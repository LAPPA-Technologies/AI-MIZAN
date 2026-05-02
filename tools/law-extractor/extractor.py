"""
extractor.py — PDF extraction for AI-Mizan Law Extractor tool.

Extraction engine ported from data/scripts/extract_law.py (production script).
Cleaning step sends each article's dirty text to Claude or OpenAI.
"""
from __future__ import annotations

import base64
import concurrent.futures
import re
import threading
import unicodedata
from dataclasses import dataclass, field
from typing import Optional

import anthropic
import fitz  # PyMuPDF
import openai


class RateLimitReached(Exception):
    pass

CLAUDE_MODEL = "claude-sonnet-4-6"
OPENAI_MODEL = "gpt-4o"

CLEANING_PROMPT = """
أنت أداة تصحيح نص فقط.

النص أدناه مستخرج من PDF قانوني مغربي وبه أخطاء تقنية.
صحح هذه الأخطاء التقنية فقط:

1. الأحرف المعكوسة (مثل "ةمكحملا" → "المحكمة")
2. أرقام الفقرات المندمجة مع النص
3. أرقام الصفحات النازة في النص
4. المسافات الزائدة أو المفقودة
5. الأحرف غير المرئية

لا تغير أي كلمة. لا تضف. لا تحذف.
أعد النص المصحح فقط.

النص:
{dirty_text}
"""

# ── Noise / TOC patterns (from extract_law.py) ────────────────────────────────

_NOISE_PATTERNS = [
    re.compile(r"^PURL:\s*https?://.*$", re.IGNORECASE),
    re.compile(r"^\s*-\s*$"),
    re.compile(r"^\s*-\s*\d{1,4}\s*-\s*$"),
    re.compile(r"^\s*\d{1,3}\s*$"),
    re.compile(r"^\s*\d{5,}\s*$"),
    re.compile(r"^\.{4,}"),
]
_TOC_SENTINEL = re.compile(r"\.{4,}\s*\d+\s*$")

# ── Arabic article patterns ───────────────────────────────────────────────────

_MADDA_CLEAN = re.compile(r"^المادة\s*(\d+)")
_MADDA_FLEX  = re.compile(r"^ا?\s?ل\s?م\s?ا\s?د\s?ة\s*(\d+)")
_FASL_CLEAN  = re.compile(r"^الفصل\s*(\d+)")
_FASL_FLEX   = re.compile(r"^ا?\s?ل?\s?ف\s?ص\s?ل\s*(\d+)")

# ── Hierarchy patterns ────────────────────────────────────────────────────────

_HIERARCHY_AR = [
    ("book",    re.compile(r"^الكتاب\s")),
    ("part",    re.compile(r"^القسم\s")),
    ("title",   re.compile(r"^الباب\s")),
    ("chapter", re.compile(r"^(الفصل|فصل)\s+(?!\d)")),
    ("section", re.compile(r"^(فرع|الفرع)\s")),
]


# ── Hierarchy state ───────────────────────────────────────────────────────────

@dataclass
class HierarchyState:
    book: str    = ""
    part: str    = ""
    title: str   = ""
    chapter: str = ""
    section: str = ""

    def snapshot(self) -> dict:
        return {k: v for k, v in {
            "book": self.book, "part": self.part, "title": self.title,
            "chapter": self.chapter, "section": self.section,
        }.items() if v}

    def update(self, level: str, value: str):
        order = ["book", "part", "title", "chapter", "section"]
        setattr(self, level, value)
        for deeper in order[order.index(level) + 1:]:
            setattr(self, deeper, "")


# ── PDF text extraction (dict-mode with font filtering) ───────────────────────

def _extract_dict_page(page: fitz.Page) -> list[str]:
    try:
        blocks = page.get_text("dict")["blocks"]
    except Exception:
        return [l.strip() for l in page.get_text("text").splitlines() if l.strip()]

    # Page-level dominant font size
    size_weights: dict[float, int] = {}
    for block in blocks:
        for ld in block.get("lines", []):
            for s in ld.get("spans", []):
                t = s.get("text", "")
                if t.strip():
                    sz = round(s["size"], 1)
                    size_weights[sz] = size_weights.get(sz, 0) + len(t)

    if not size_weights:
        return [l.strip() for l in page.get_text("text").splitlines() if l.strip()]

    page_dom = max(size_weights, key=size_weights.get)
    page_thr = page_dom * 0.80

    lines: list[str] = []
    for block in blocks:
        for ld in block.get("lines", []):
            spans = [s for s in ld.get("spans", []) if s["size"] >= page_thr]
            if not spans:
                continue
            lsw: dict[float, int] = {}
            for s in spans:
                t = s.get("text", "")
                if t.strip():
                    sz = round(s["size"], 1)
                    lsw[sz] = lsw.get(sz, 0) + len(t)
            if not lsw:
                continue
            line_dom = max(lsw, key=lsw.get)
            line_thr = line_dom * 0.75
            text = "".join(s.get("text", "") for s in spans if s["size"] >= line_thr).strip()
            if text:
                lines.append(text)

    return lines


def _heal_arabic_lines(lines: list[str]) -> list[str]:
    _madda_alone = re.compile(r"^المادة\s*$|^ا?\s?ل\s?م\s?ا\s?د\s?ة\s*$")
    _fasl_alone  = re.compile(r"^الفصل\s*$|^ا?\s?ل?\s?ف\s?ص\s?ل\s*$")
    healed: list[str] = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if i + 1 < len(lines) and (_madda_alone.match(s) or _fasl_alone.match(s)):
            nxt = lines[i + 1].strip()
            if re.match(r"^\d+$", nxt):
                healed.append(s + nxt)
                i += 2
                continue
        healed.append(lines[i])
        i += 1
    return healed


_PAGE_MARKER = re.compile(r"^__P(\d+)__$")

def extract_lines_from_pdf(pdf_bytes: bytes) -> tuple[list[str], int]:
    """Extract cleaned lines using dict-mode + Arabic healing. Returns (lines, page_count).
    Injects __P{n}__ markers between pages so article splitter can track startPage."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)
    all_lines: list[str] = []
    for i in range(page_count):
        all_lines.append(f"__P{i + 1}__")
        all_lines.extend(_extract_dict_page(doc[i]))
    doc.close()
    all_lines = _heal_arabic_lines(all_lines)
    return all_lines, page_count


# ── Article detection + splitting ─────────────────────────────────────────────

def _detect_ar_mode(lines: list[str]) -> str:
    madda = sum(1 for l in lines if _MADDA_CLEAN.match(l.strip()) or _MADDA_FLEX.match(l.strip()))
    fasl  = sum(1 for l in lines if _FASL_CLEAN.match(l.strip())  or _FASL_FLEX.match(l.strip()))
    mode = "fasl" if fasl > madda else "madda"
    print(f"[EXTRACT] AR mode: {mode} (المادة={madda}, الفصل={fasl})")
    return mode


def _is_article_header(line: str, ar_mode: str) -> Optional[int]:
    s = line.strip()
    pats = (_FASL_CLEAN, _FASL_FLEX) if ar_mode == "fasl" else (_MADDA_CLEAN, _MADDA_FLEX)
    for pat in pats:
        m = pat.match(s)
        if m:
            try:
                return int(m.group(1))
            except ValueError:
                pass
    return None


def _is_noise(line: str) -> bool:
    return any(p.search(line) for p in _NOISE_PATTERNS)


def _detect_structure(line: str) -> Optional[tuple[str, str]]:
    s = line.strip()
    for level, pat in _HIERARCHY_AR:
        if pat.search(s):
            return (level, s)
    return None


def _clean_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    for old, new in [("األ", "الأ"), ("اإل", "الإ")]:
        text = text.replace(old, new)
    return re.sub(r"[ \t]+", " ", text).strip()


def split_into_articles(lines: list[str], ar_mode: str) -> list[dict]:
    hierarchy = HierarchyState()
    articles: list[dict] = []
    current: Optional[dict] = None
    skip = True
    current_page = 1

    for line in lines:
        s = line.strip()

        # Page marker
        pm = _PAGE_MARKER.match(s)
        if pm:
            current_page = int(pm.group(1))
            continue

        if not s or _is_noise(s) or _TOC_SENTINEL.search(s):
            continue

        art_num = _is_article_header(s, ar_mode)
        if art_num is not None:
            skip = False
            if current:
                articles.append(current)
            current = {
                "articleNumber": str(art_num),
                "startPage": current_page,
                "body_lines": [],
                "hierarchy": hierarchy.snapshot(),
            }
            continue

        struct = _detect_structure(s)
        if struct:
            hierarchy.update(struct[0], struct[1])
            continue

        if skip:
            continue

        if current is not None:
            current["body_lines"].append(s)

    if current:
        articles.append(current)

    return _deduplicate(articles)


def _deduplicate(articles: list[dict]) -> list[dict]:
    best: dict[str, tuple[dict, int]] = {}
    for a in articles:
        n = a["articleNumber"]
        body_len = sum(len(l) for l in a["body_lines"])
        if n not in best or body_len > best[n][1]:
            best[n] = (a, body_len)
    seen: set[str] = set()
    result: list[dict] = []
    for a in articles:
        n = a["articleNumber"]
        if n not in seen:
            seen.add(n)
            result.append(best[n][0])
    return result


def extract_with_pdfplumber(pdf_bytes: bytes, source_document: str = "") -> tuple[list[dict], int]:
    """Extract articles using production dict-mode engine. Returns (articles, page_count)."""
    lines, page_count = extract_lines_from_pdf(pdf_bytes)
    ar_mode = _detect_ar_mode(lines)
    raw_articles = split_into_articles(lines, ar_mode)
    print(f"[EXTRACT] {len(raw_articles)} articles found in {page_count} pages")

    articles = []
    for raw in raw_articles:
        h = raw["hierarchy"]
        body = _clean_text("\n".join(raw["body_lines"]))
        articles.append({
            "articleNumber":  raw["articleNumber"],
            "startPage":      raw.get("startPage", 1),
            "text":           body,
            "book":           h.get("book"),
            "part":           h.get("part"),
            "title":          h.get("title"),
            "chapter":        h.get("chapter"),
            "section":        h.get("section"),
            "sourceDocument": source_document or None,
            "quality":        "pending",
            "status":         "pending",
        })

    return articles, page_count


# ── Per-article text cleaning ─────────────────────────────────────────────────

def _clean_one(dirty_text: str, provider: str) -> str:
    prompt = CLEANING_PROMPT.format(dirty_text=dirty_text)
    try:
        if provider == "openai":
            client = openai.OpenAI()
            resp = client.chat.completions.create(
                model=OPENAI_MODEL, max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.choices[0].message.content.strip()
        else:
            client = anthropic.Anthropic()
            resp = client.messages.create(
                model=CLAUDE_MODEL, max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.content[0].text.strip()
    except (anthropic.RateLimitError, openai.RateLimitError) as e:
        raise RateLimitReached(str(e)) from e
    except anthropic.BadRequestError as e:
        # Monthly/plan usage cap returns 400 invalid_request_error, not 429
        if "usage limit" in str(e).lower():
            raise RateLimitReached(str(e)) from e
        raise
    except openai.BadRequestError as e:
        if "rate limit" in str(e).lower() or "usage limit" in str(e).lower():
            raise RateLimitReached(str(e)) from e
        raise


def _assess_quality(text: str) -> str:
    if not text or len(text.strip()) < 20:
        return "corrupted"
    if not re.search(r"[\u0600-\u06FF]{5,}", text):
        return "corrupted"
    if re.search(r"\b\d{4,}\b", text):
        return "needs_review"
    return "clean"


# ── Orchestrator ──────────────────────────────────────────────────────────────

def extract_all_articles(
    pdf_bytes: bytes,
    progress_callback=None,
    provider: str = "claude",
    source_document: str = "",
) -> tuple[list[dict], int, bool, Optional[str]]:
    """
    Step 1: dict-mode fitz extraction → split articles + hierarchy (no API)
    Step 2: parallel per-article cleaning via Claude or OpenAI (skipped if provider='none')
    Returns (articles, page_count, interrupted, interrupt_reason).
    interrupted=True when API rate limit was hit mid-extraction.
    """
    model_label = OPENAI_MODEL if provider == "openai" else (CLAUDE_MODEL if provider != "none" else "none")
    print(f"[EXTRACT] provider={provider} ({model_label})")

    if progress_callback:
        progress_callback(0, 0, "جارٍ استخراج هيكل الوثيقة...")

    articles, page_count = extract_with_pdfplumber(pdf_bytes, source_document=source_document)
    total = len(articles)

    if not articles:
        return [], page_count, False, None

    # ── No-API mode: assess raw quality only, skip all API calls ─────────────
    if provider == "none":
        for a in articles:
            a["quality"] = _assess_quality(a["text"])
        if progress_callback:
            progress_callback(total, total, f"جاهز — {total} مادة (بدون تصحيح API)")
        print(f"[EXTRACT] Done (no API) — {total} articles")
        return articles, page_count, False, None

    if progress_callback:
        progress_callback(0, total, f"تم العثور على {total} مادة — جارٍ تنظيف النصوص ({provider})...")

    stop_event = threading.Event()
    rate_limit_info: dict = {"hit": False, "message": ""}
    done_count = [0]

    def _clean_article(idx: int) -> None:
        a = articles[idx]
        if stop_event.is_set():
            # Rate limit already hit — assess raw quality without cleaning
            a["quality"] = _assess_quality(a["text"])
            done_count[0] += 1
            return
        try:
            a["text"]    = _clean_one(a["text"], provider)
            a["quality"] = _assess_quality(a["text"])
        except RateLimitReached as e:
            stop_event.set()
            rate_limit_info["hit"] = True
            rate_limit_info["message"] = str(e)
            a["quality"] = "needs_review"
            print(f"[CLEAN] Rate limit reached on Art.{a['articleNumber']}: {e}")
        except Exception as e:
            print(f"[CLEAN] Error on Art.{a['articleNumber']}: {e}")
            a["quality"] = "needs_review"
        done_count[0] += 1
        if progress_callback:
            progress_callback(done_count[0], total, f"تم تنظيف المادة {a['articleNumber']}")
        print(f"[CLEAN] {done_count[0]}/{total} Art.{a['articleNumber']} ({a['quality']})")

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(_clean_article, i) for i in range(total)]
        for f in concurrent.futures.as_completed(futures):
            try:
                f.result()
            except Exception as e:
                print(f"[CLEAN] Unexpected: {e}")

    interrupted = rate_limit_info["hit"]
    interrupt_reason = rate_limit_info["message"] if interrupted else None

    if interrupted:
        print(f"[EXTRACT] Interrupted by rate limit after {done_count[0]}/{total} articles")
        return articles, page_count, True, interrupt_reason

    # Clean unique structure values (book/chapter/section) — deduplicated API calls
    unique_structs = {
        v for a in articles
        for v in (a.get("book"), a.get("part"), a.get("title"), a.get("chapter"), a.get("section"))
        if v
    }
    struct_map: dict[str, str] = {}
    if unique_structs:
        print(f"[CLEAN] Cleaning {len(unique_structs)} unique structure labels...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            fs = {executor.submit(_clean_one, s, provider): s for s in unique_structs}
            for f in concurrent.futures.as_completed(fs):
                original = fs[f]
                try:
                    struct_map[original] = f.result()
                except RateLimitReached:
                    struct_map[original] = original
                except Exception:
                    struct_map[original] = original

    for a in articles:
        for fld in ("book", "part", "title", "chapter", "section"):
            if a.get(fld) and a[fld] in struct_map:
                a[fld] = struct_map[a[fld]]

    print(f"[EXTRACT] Done — {total} articles")
    return articles, page_count, False, None


# ── Page image rendering ──────────────────────────────────────────────────────

def extract_page_image(pdf_bytes: bytes, page_number: int) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if page_number < 1 or page_number > len(doc):
        doc.close()
        raise ValueError(f"Page {page_number} out of range (total: {len(doc)})")
    page = doc[page_number - 1]
    mat  = fitz.Matrix(150 / 72, 150 / 72)
    pix  = page.get_pixmap(matrix=mat)
    result = base64.b64encode(pix.tobytes("png")).decode()
    doc.close()
    return result
