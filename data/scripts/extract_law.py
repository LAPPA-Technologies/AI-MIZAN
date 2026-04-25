#!/usr/bin/env python3
"""
extract_law.py — Production-grade legal PDF → structured JSON extractor.

Supports Arabic (ar) and French (fr) Moroccan legal PDFs.

Key features:
  - Arabic: auto-detects المادة vs الفصل article header style
  - French: dict-mode extraction filters footnote superscripts from article numbers
  - Robust regression trimmer that doesn't false-positive on preamble references

Usage:
    python extract_law.py input.pdf --doc_id 1 --code family --language ar
    python extract_law.py input.pdf --doc_id 2 --code family --language fr
    python extract_law.py --batch --output ../data
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF


# ─────────────────────────── Configuration ───────────────────────────

# ── Arabic article patterns ──────────────────────────────────────────
# "المادة" (madda) style — used by Family Code, Penal Code, Labor Code,
# Commerce Code, Criminal Procedure, Urbanism Code
_ARTICLE_AR_MADDA_CLEAN = re.compile(r"^المادة\s*(\d+)")
_ARTICLE_AR_MADDA_FLEX = re.compile(
    r"^ا?\s?ل\s?م\s?ا\s?د\s?ة\s*(\d+)"
)

# "الفصل" (fasl) style — used by Obligations & Contracts, Civil Procedure
_ARTICLE_AR_FASL_CLEAN = re.compile(r"^الفصل\s*(\d+)")
_ARTICLE_AR_FASL_FLEX = re.compile(
    r"^ا?\s?ل?\s?ف\s?ص\s?ل\s*(\d+)"
)

# ── French article pattern ───────────────────────────────────────────
_ARTICLE_FR = re.compile(r"^Article\s+(premier|\d+)", re.IGNORECASE)

# ── Hierarchy patterns per language ──────────────────────────────────
# Each entry: (level_name, compiled regex)
# For Arabic chapter: use negative lookahead (?!\d) so "الفصل 5" is NOT
# consumed as hierarchy when the law uses الفصل for articles.
_HIERARCHY = {
    "ar": [
        ("book", re.compile(r"^الكتاب\s")),
        ("part", re.compile(r"^القسم\s")),
        ("title", re.compile(r"^الباب\s")),
        ("chapter", re.compile(r"^(الفصل|فصل)\s+(?!\d)")),
        ("section", re.compile(r"^(فرع|الفرع)\s")),
    ],
    "fr": [
        ("book", re.compile(r"^LIVRE\s", re.IGNORECASE)),
        ("part", re.compile(r"^PARTIE\s", re.IGNORECASE)),
        ("title", re.compile(r"^TITRE\s", re.IGNORECASE)),
        ("chapter", re.compile(r"^CHAPITRE\s", re.IGNORECASE)),
        ("section", re.compile(r"^SECTION\s", re.IGNORECASE)),
    ],
}

# ── Noise patterns to strip ──────────────────────────────────────────
_NOISE_PATTERNS = [
    re.compile(r"^PURL:\s*https?://.*$", re.IGNORECASE),   # FR watermark
    re.compile(r"^\s*-\s*$"),                                # lone dashes
    re.compile(r"^\s*-\s*\d{1,4}\s*-\s*$"),                  # "- 4 -" page numbers
    re.compile(r"^\s*\d{1,3}\s*$"),                          # bare page numbers
    re.compile(r"^\s*\d{5,}\s*$"),                           # long digit artifacts
    re.compile(r"^\.{4,}"),                                  # TOC dot leaders
]

# TOC sentinel — skip everything until first real article
_TOC_SENTINEL = re.compile(r"\.{4,}\s*\d+\s*$")


# ─────────────────────────── Data Classes ────────────────────────────

@dataclass
class HierarchyState:
    """Tracks current position in the document hierarchy."""
    book: str = ""
    part: str = ""
    title: str = ""
    chapter: str = ""
    section: str = ""

    def snapshot(self) -> dict:
        return {k: v for k, v in {
            "book": self.book,
            "part": self.part,
            "title": self.title,
            "chapter": self.chapter,
            "section": self.section,
        }.items() if v}

    def update(self, level: str, value: str):
        """Set a level and clear all narrower levels."""
        order = ["book", "part", "title", "chapter", "section"]
        idx = order.index(level)
        setattr(self, level, value)
        for deeper in order[idx + 1:]:
            setattr(self, deeper, "")


# ─────────────────── Arabic Article-Mode Detection ───────────────────

def _detect_ar_article_mode(lines: list[str]) -> str:
    """
    Auto-detect whether an Arabic law uses المادة or الفصل for article headers.

    Scans all lines for line-start matches and returns "madda" or "fasl"
    based on which pattern dominates.
    """
    madda_count = 0
    fasl_count = 0
    for line in lines:
        s = line.strip()
        if _ARTICLE_AR_MADDA_CLEAN.match(s) or _ARTICLE_AR_MADDA_FLEX.match(s):
            madda_count += 1
        if _ARTICLE_AR_FASL_CLEAN.match(s) or _ARTICLE_AR_FASL_FLEX.match(s):
            fasl_count += 1

    mode = "fasl" if fasl_count > madda_count else "madda"
    print(f"       Arabic article mode: {mode} (المادة={madda_count}, الفصل={fasl_count})")
    return mode


# ─────────────────────── PDF Text Extraction ─────────────────────────

def extract_pdf_text(pdf_path: str, language: str) -> list[str]:
    """
    Extract text from PDF, returning a list of cleaned lines.

    Uses **dict-mode** extraction for all languages, which provides per-span
    font size information.  Two levels of filtering are applied:

    1. **Page-level**: compute the dominant font size across the whole page
       and drop entire spans whose size < 80 % of it.  This removes footnote
       blocks (e.g. 12 pt amendment notes on an otherwise 16 pt Arabic page).

    2. **Line-level**: on every surviving line, if the dominant span size
       differs from the page dominant (e.g. a 9.5 pt superscript "2" on a
       15 pt French line), drop the small spans.  This fixes the French
       "Article 62" → "Article 6" footnote concatenation.

    Falls back to plain-text extraction on corrupt / unparseable pages.
    """
    doc = fitz.open(pdf_path)
    all_lines: list[str] = []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        lines = _extract_dict_page(page)
        all_lines.extend(lines)

    doc.close()

    if language == "ar":
        all_lines = _heal_arabic_lines(all_lines)

    return all_lines


def _extract_plain_page(page: fitz.Page) -> list[str]:
    """Extract text from a page using standard text mode (fallback)."""
    text = page.get_text("text")
    lines = []
    for raw_line in text.splitlines():
        stripped = raw_line.strip()
        if stripped:
            lines.append(stripped)
    return lines


def _extract_dict_page(page: fitz.Page) -> list[str]:
    """
    Extract text from a page using dict mode with two-level font filtering.

    1.  Compute **page-level** dominant font size (by char count).
    2.  Drop spans below 80 % of page dominant (removes footnote blocks).
    3.  For each remaining line, drop spans below 75 % of that line's
        dominant size (removes inline superscripts).
    """
    try:
        blocks = page.get_text("dict")["blocks"]
    except Exception:
        return _extract_plain_page(page)

    # ── Pass 1: page-level dominant font size ──
    page_size_weights: dict[float, int] = {}
    for block in blocks:
        if "lines" not in block:
            continue
        for line_dict in block["lines"]:
            for s in line_dict.get("spans", []):
                txt = s.get("text", "")
                if not txt.strip():
                    continue
                rounded = round(s["size"], 1)
                page_size_weights[rounded] = page_size_weights.get(rounded, 0) + len(txt)

    if not page_size_weights:
        return _extract_plain_page(page)

    page_dominant = max(page_size_weights, key=page_size_weights.get)
    page_threshold = page_dominant * 0.80  # 80 % of page dominant

    # ── Pass 2: build lines, filtering small-font spans ──
    lines: list[str] = []

    for block in blocks:
        if "lines" not in block:
            continue
        for line_dict in block["lines"]:
            spans = line_dict.get("spans", [])
            if not spans:
                continue

            # Keep only page-level survivors
            surviving = [s for s in spans if s["size"] >= page_threshold]
            if not surviving:
                continue

            # Line-level dominant (handles inline superscripts)
            line_size_weights: dict[float, int] = {}
            for s in surviving:
                txt = s.get("text", "")
                if not txt.strip():
                    continue
                rounded = round(s["size"], 1)
                line_size_weights[rounded] = line_size_weights.get(rounded, 0) + len(txt)

            if not line_size_weights:
                continue

            line_dominant = max(line_size_weights, key=line_size_weights.get)
            line_threshold = line_dominant * 0.75  # 75 % of line dominant

            parts: list[str] = []
            for s in surviving:
                if s["size"] >= line_threshold:
                    parts.append(s.get("text", ""))

            text = "".join(parts).strip()
            if text:
                lines.append(text)

    return lines


def _heal_arabic_lines(lines: list[str]) -> list[str]:
    """
    Post-process Arabic lines to heal split words across line breaks.

    Handles:
    1. Article headers split across lines (المادة / الفصل alone, number on next).
    2. Body text with split words (line ending in single connecting Arabic letter).
    """
    if not lines:
        return lines

    healed: list[str] = []
    i = 0

    # Patterns for lone article keywords on a line
    _madda_alone = re.compile(
        r"^ا?\s?ل?\s?م?\s?ا?\s?د?\s?ة?\s*المادة\s*$|^المادة\s*$|^ا?\s?ل\s?م\s?ا\s?د\s?ة\s*$"
    )
    _fasl_alone = re.compile(
        r"^الفصل\s*$|^ا?\s?ل?\s?ف\s?ص\s?ل\s*$"
    )

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Case 1: المادة or الفصل alone on a line, next line is a number
        if i + 1 < len(lines) and (_madda_alone.match(stripped) or _fasl_alone.match(stripped)):
            next_line = lines[i + 1].strip()
            if re.match(r"^\d+$", next_line):
                healed.append(stripped + next_line)
                i += 2
                continue

        healed.append(line)
        i += 1

    return healed


# ─────────────────────── Language Detection ──────────────────────────

def detect_language(lines: list[str]) -> str:
    """Auto-detect document language from text content. Returns 'ar' or 'fr'."""
    sample = " ".join(lines[:200])

    arabic_chars = sum(1 for ch in sample if "\u0600" <= ch <= "\u06FF" or "\uFE70" <= ch <= "\uFEFF")
    total_alpha = sum(1 for ch in sample if ch.isalpha())

    if total_alpha > 0 and arabic_chars / total_alpha > 0.3:
        return "ar"

    return "fr"


# ──────────────────────── Text Cleaning ──────────────────────────────

def clean_text(text: str, language: str) -> str:
    """
    Clean extracted text: NFC normalize, collapse whitespace, fix Arabic ligatures.
    """
    text = unicodedata.normalize("NFC", text)

    if language == "ar":
        text = _fix_arabic_ligatures(text)

    text = re.sub(r"[ \t]+", " ", text)
    text = text.strip()
    return text


def _fix_arabic_ligatures(text: str) -> str:
    """Fix common lam-alef ligature artifacts from PDF extraction."""
    replacements = [
        ("األ", "الأ"),
        ("اإل", "الإ"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text


# ──────────────────── Structure Detection ────────────────────────────

def detect_structure(line: str, language: str) -> Optional[tuple[str, str]]:
    """
    Check if a line is a hierarchy header.
    Returns (level_name, full_header_text) or None.
    """
    stripped = line.strip()
    if not stripped:
        return None

    for level_name, pattern in _HIERARCHY.get(language, []):
        if pattern.pattern == "^$":
            continue
        if pattern.search(stripped):
            return (level_name, stripped)

    return None


# ──────────────────── Article Header Detection ───────────────────────

def is_article_header(line: str, language: str, ar_mode: str = "madda") -> Optional[int]:
    """
    Check if a line is an article header.
    Returns the article number (int) or None.

    ar_mode: "madda" → match المادة; "fasl" → match الفصل
    """
    stripped = line.strip()

    if language == "ar":
        if ar_mode == "fasl":
            patterns = (_ARTICLE_AR_FASL_CLEAN, _ARTICLE_AR_FASL_FLEX)
        else:
            patterns = (_ARTICLE_AR_MADDA_CLEAN, _ARTICLE_AR_MADDA_FLEX)
        for pat in patterns:
            m = pat.match(stripped)
            if m:
                try:
                    return int(m.group(1))
                except ValueError:
                    pass
        return None

    if language == "fr":
        m = _ARTICLE_FR.match(stripped)
        if m:
            val = m.group(1)
            if val.lower() == "premier":
                return 1
            try:
                return int(val)
            except ValueError:
                return None
        return None

    return None


# ──────────────────── Article Splitting ──────────────────────────────

def split_articles(
    lines: list[str],
    language: str,
    ar_mode: str = "madda",
) -> tuple[list[dict], HierarchyState]:
    """
    Split lines into articles with hierarchy tracking.

    Returns (articles_list, final_hierarchy_state).
    """
    articles: list[dict] = []
    hierarchy = HierarchyState()
    current_article: Optional[dict] = None
    skip_until_article = True

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if _is_noise(stripped):
            continue

        if _TOC_SENTINEL.search(stripped):
            continue

        # ── Check article header FIRST ──
        # This ensures "الفصل 5" is caught as an article in fasl-mode
        # before the hierarchy check can consume it as a chapter header.
        art_num = is_article_header(stripped, language, ar_mode)
        if art_num is not None:
            skip_until_article = False
            if current_article is not None:
                articles.append(current_article)
            current_article = {
                "article_number": art_num,
                "header_line": stripped,
                "body_lines": [],
                "hierarchy": hierarchy.snapshot(),
            }
            continue

        # ── Hierarchy header ──
        struct = detect_structure(stripped, language)
        if struct:
            level_name, header_text = struct
            hierarchy.update(level_name, header_text)
            continue

        # Skip preamble / TOC lines before first article
        if skip_until_article:
            continue

        # Accumulate body lines
        if current_article is not None:
            current_article["body_lines"].append(stripped)

    if current_article is not None:
        articles.append(current_article)

    # Post-processing
    articles = _deduplicate(articles)

    return articles, hierarchy


def _deduplicate(articles: list[dict]) -> list[dict]:
    """
    Keep only one version of each article number — the one with the longest
    body text.  This handles cross-references and amendment duplicates that
    re-use the same article number: short cross-ref bodies are discarded in
    favour of the full legal text.

    Output preserves document order (position of first occurrence).
    """
    # Find the best (longest-body) version for each article number
    best: dict[int, tuple[dict, int]] = {}
    for art in articles:
        num = art["article_number"]
        body_len = sum(len(line) for line in art["body_lines"])
        if num not in best or body_len > best[num][1]:
            best[num] = (art, body_len)

    # Emit in document order of first occurrence
    seen: set[int] = set()
    result: list[dict] = []
    for art in articles:
        num = art["article_number"]
        if num not in seen:
            seen.add(num)
            result.append(best[num][0])
    return result


def _is_noise(line: str) -> bool:
    """Check if a line is noise (page numbers, watermarks, etc.)."""
    for pat in _NOISE_PATTERNS:
        if pat.search(line):
            return True
    return False


# ──────────────────── Article Object Builder ─────────────────────────

def build_article_object(raw: dict, language: str) -> dict:
    """Build a structured article object from raw split data."""
    body_text = "\n".join(raw["body_lines"])
    body_text = clean_text(body_text, language)

    article = {
        "article_number": raw["article_number"],
        "content": body_text,
    }

    if raw["hierarchy"]:
        article["hierarchy"] = raw["hierarchy"]

    return article


# ──────────────────── Document JSON Builder ──────────────────────────

def build_document_json(
    articles: list[dict],
    doc_id: int,
    code: str,
    language: str,
    pdf_path: str,
    effective_date: str = "",
    version: str = "1.0",
) -> dict:
    """Build the complete document JSON with metadata wrapper."""
    return {
        "doc_id": doc_id,
        "code": code,
        "language": language,
        "source": os.path.basename(pdf_path),
        "effective_date": effective_date or "2004-02-05",
        "version": version,
        "pdf_file": os.path.basename(pdf_path),
        "extracted_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "total_articles": len(articles),
        "articles": articles,
    }


# ──────────────────────── Save JSON ──────────────────────────────────

def save_json(data: dict, output_dir: str, code: str, language: str) -> str:
    """Save JSON to /laws/{code}/{lang}/ directory structure."""
    target_dir = Path(output_dir) / "laws" / code / language
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{code}_{language}.json"
    filepath = target_dir / filename

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return str(filepath)


# ────────────────────────── Main Pipeline ────────────────────────────

def extract_law(
    pdf_path: str,
    doc_id: int,
    code: str,
    language: str = "",
    output_dir: str = "",
    effective_date: str = "",
    version: str = "1.0",
) -> dict:
    """
    Main pipeline: PDF → structured JSON.

    1. extract_pdf_text   — raw lines (dict-mode for FR, plain for AR)
    2. detect_language     — auto-detect if not specified
    3. _detect_ar_article_mode — choose المادة vs الفصل for AR
    4. split_articles      — split into articles + track hierarchy
    5. build_article_object — clean and structure each article
    6. build_document_json  — wrap with metadata
    7. save_json           — write to disk
    """
    print(f"[1/7] Extracting text from: {pdf_path}")
    lines = extract_pdf_text(pdf_path, language or "fr")

    if not language:
        print("[2/7] Auto-detecting language...")
        language = detect_language(lines)
        print(f"       Detected: {language}")
        if language == "ar":
            print("       Re-extracting with Arabic mode...")
            lines = extract_pdf_text(pdf_path, "ar")
    else:
        print(f"[2/7] Language: {language}")

    # Detect Arabic article mode
    ar_mode = "madda"
    if language == "ar":
        print("[3/7] Detecting Arabic article pattern...")
        ar_mode = _detect_ar_article_mode(lines)
    else:
        print("[3/7] (skip — not Arabic)")

    print(f"[4/7] Splitting articles (total lines: {len(lines)})...")
    raw_articles, hierarchy = split_articles(lines, language, ar_mode)
    print(f"       Found {len(raw_articles)} raw articles")

    print("[5/7] Building article objects...")
    articles = [build_article_object(raw, language) for raw in raw_articles]

    print("[6/7] Building document JSON...")
    doc_json = build_document_json(
        articles=articles,
        doc_id=doc_id,
        code=code,
        language=language,
        pdf_path=pdf_path,
        effective_date=effective_date,
        version=version,
    )

    if output_dir:
        print("[7/7] Saving JSON...")
        filepath = save_json(doc_json, output_dir, code, language)
        print(f"       Saved to: {filepath}")
    else:
        print("[7/7] No output directory specified — returning dict only.")

    # ── Summary ──
    print(f"\n{'='*50}")
    print(f"  Extraction complete!")
    print(f"  Language:  {language}")
    if language == "ar":
        print(f"  AR mode:   {ar_mode}")
    print(f"  Articles:  {len(articles)}")

    if articles:
        nums = [a["article_number"] for a in articles]
        print(f"  Range:     {min(nums)} – {max(nums)}")

        expected = set(range(min(nums), max(nums) + 1))
        missing = sorted(expected - set(nums))
        if missing:
            print(f"  Missing:   {len(missing)} ({missing[:20]}{'...' if len(missing) > 20 else ''})")
        else:
            print(f"  Gaps:      None (consecutive)")

        empty = [a["article_number"] for a in articles if not a["content"].strip()]
        if empty:
            print(f"  Empty:     {empty[:20]}{'...' if len(empty) > 20 else ''}")
        else:
            print(f"  Empty:     None")

    print(f"{'='*50}")

    return doc_json


# ────────────────────────── CLI Entry ────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract legal text from PDF and output structured JSON.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python extract_law.py input.pdf --doc_id 1 --code family --language ar
  python extract_law.py input.pdf --doc_id 2 --code family --language fr
  python extract_law.py --batch --output ../data
        """,
    )
    parser.add_argument("pdf", nargs="?", help="Path to input PDF file (omit when using --batch)")
    parser.add_argument("--doc_id", type=int, required=False, help="Document ID (integer)")
    parser.add_argument("--code", required=False, help="Law code identifier (e.g., 'family')")
    parser.add_argument("--language", choices=["ar", "fr"], default="",
                        help="Force language (auto-detected if omitted)")
    parser.add_argument("--output", default=".", help="Base output directory (default: current dir)")
    parser.add_argument("--effective_date", default="2004-02-05",
                        help="Law effective date (default: 2004-02-05)")
    parser.add_argument("--version", default="1.0", help="Extraction version (default: 1.0)")
    parser.add_argument("--batch", action="store_true",
                        help="Process all PDFs under data/Moroccan_Laws_PDF (arabic+french)")
    parser.add_argument("--remove-english-jsons", action="store_true",
                        help="Remove existing English JSON outputs from data/laws/*/en")

    args = parser.parse_args()

    # ── Batch mode ──
    if args.batch:
        script_dir = Path(__file__).resolve().parent
        data_dir = script_dir.parent
        candidates = [data_dir / "Morroccan_Laws_PDF", data_dir / "Moroccan_Laws_PDF"]
        base = None
        for c in candidates:
            if c.exists():
                base = c
                break
        if base is None:
            print("Error: Could not find Morroccan_Laws_PDF or Moroccan_Laws_PDF under data/",
                  file=sys.stderr)
            sys.exit(1)

        print(f"Batch mode: scanning PDFs under {base}")

        lang_dirs = [("ar", "arabic"), ("fr", "french")]
        doc_counter = args.doc_id or 1

        for lang_code, dir_name in lang_dirs:
            lang_path = base / dir_name
            if not lang_path.exists():
                continue
            for law_folder in sorted(p for p in lang_path.iterdir() if p.is_dir()):
                pdfs = list(law_folder.glob("*.pdf"))
                if not pdfs:
                    continue
                pdf_path = str(pdfs[0])
                code = law_folder.name.lower()
                print(f"\n{'='*60}")
                print(f"Processing: {code} ({lang_code}) -> {pdf_path}")
                print(f"{'='*60}")
                extract_law(
                    pdf_path=pdf_path,
                    doc_id=doc_counter,
                    code=code,
                    language=lang_code,
                    output_dir=args.output,
                    effective_date=args.effective_date,
                    version=args.version,
                )
                doc_counter += 1

        if args.remove_english_jsons:
            laws_dir = Path(args.output) / "laws"
            if laws_dir.exists():
                for code_dir in laws_dir.iterdir():
                    en_dir = code_dir / "en"
                    if en_dir.exists():
                        print(f"Removing English JSONs in {en_dir}")
                        for f in en_dir.glob("*.json"):
                            f.unlink()
                        try:
                            en_dir.rmdir()
                        except OSError:
                            pass

        print("\nBatch extraction complete.")
        return

    # ── Single-file mode ──
    if not args.pdf or not os.path.isfile(args.pdf):
        print(f"Error: PDF file not found: {args.pdf}", file=sys.stderr)
        sys.exit(1)

    extract_law(
        pdf_path=args.pdf,
        doc_id=args.doc_id or 1,
        code=args.code or "unknown",
        language=args.language,
        output_dir=args.output,
        effective_date=args.effective_date,
        version=args.version,
    )


if __name__ == "__main__":
    main()
