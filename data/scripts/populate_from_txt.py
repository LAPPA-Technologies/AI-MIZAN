#!/usr/bin/env python3
"""
populate_from_txt.py — Parse Moroccan law .txt files and populate the database.

Reads every .txt file under  data/Moroccan_Laws_PDF/<lang>/<category>/
Extracts articles with full hierarchical structure, produces JSON, and
optionally inserts rows directly into the PostgreSQL database.

Output JSON article format (one file per law/language):
{
    "doc_id": "ma_civil_procedure_1_74_447",
    "jurisdiction": "MA",
    "code": "civil_procedure",
    "articles": [ ... ]
}

Usage:
    python data/scripts/populate_from_txt.py                       # JSON only
    python data/scripts/populate_from_txt.py --db                  # JSON + DB insert
    python data/scripts/populate_from_txt.py --code civil_procedure
    python data/scripts/populate_from_txt.py --dry-run             # parse + print stats
    python data/scripts/populate_from_txt.py --strip-footnotes     # attempt footnote removal
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

# ─── Paths ───────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent.parent          # AI-Mizan/
PDF_DIR = ROOT / "data" / "Moroccan_Laws_PDF"
OUT_DIR = ROOT / "data" / "laws_extracted"


# ─── PDF text extraction (PyMuPDF / fitz) ────────────────────────────────────

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract raw text from a PDF file using PyMuPDF.

    Returns the concatenated text of all pages.
    """
    if not HAS_PYMUPDF:
        print("  ✗  PyMuPDF not installed. Run: pip install pymupdf", file=sys.stderr)
        return ""
    doc = fitz.open(str(pdf_path))
    pages: List[str] = []
    for page in doc:
        pages.append(page.get_text("text"))
    doc.close()
    return "\n".join(pages)

# ─── Per-law configuration ───────────────────────────────────────────────────
#
# folder        : subfolder name inside arabic/ and french/
# code          : DB code that matches lawMetadata.ts & seed.ts
# doc_id        : document identifier for JSON export
# source_ar/fr  : source field
# effective_date: ISO date string
# version       : integer version for the DB
# dahir         : Dahir reference (for metadata)
# ─────────────────────────────────────────────────────────────────────────────

LAW_CONFIGS: Dict[str, Dict[str, Any]] = {
    "Civil_Procedure": {
        "code":           "civil_procedure",
        "doc_id":         "ma_civil_procedure_1_74_447",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "1974-09-28",
        "version":         1,
        "dahir":           "ظهير شريف بمثابة قانون رقم 1.74.447",
    },
    "Commerce_Code": {
        "code":           "commerce_code",
        "doc_id":         "ma_commerce_15_95",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "1997-08-01",
        "version":         1,
        "dahir":           "قانون رقم 15.95",
    },
    "Criminal_Procedure": {
        "code":           "criminal_procedure",
        "doc_id":         "ma_criminal_procedure_1_02_255",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "2003-10-01",
        "version":         1,
        "dahir":           "ظهير رقم 1.02.255",
    },
    "Family_Code": {
        "code":           "family_code",
        "doc_id":         "ma_family_70_03",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "2004-02-05",
        "version":         1,
        "dahir":           "قانون رقم 70.03",
    },
    "Labor_Code": {
        "code":           "labor_code",
        "doc_id":         "ma_labor_65_99",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "2004-06-08",
        "version":         1,
        "dahir":           "قانون رقم 65.99",
    },
    "Obligations_Contracts": {
        "code":           "obligations_contracts",
        "doc_id":         "ma_doc_1913",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "1913-08-12",
        "version":         1,
        "dahir":           "ظهير 12 غشت 1913",
    },
    "Penal_Code": {
        "code":           "penal_code",
        "doc_id":         "ma_penal_1_59_413",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "1962-11-26",
        "version":         1,
        "dahir":           "ظهير رقم 1.59.413",
    },
    "Urbanism_Code": {
        "code":           "urbanism_code",
        "doc_id":         "ma_urbanism_12_90",
        "source_ar":      "الجريدة الرسمية",
        "source_fr":      "Bulletin Officiel",
        "effective_date":  "1992-06-17",
        "version":         1,
        "dahir":           "قانون رقم 12.90",
    },
}

# ─── Text-cleaning helpers ───────────────────────────────────────────────────

PAGE_SEP_RE  = re.compile(r"^\s*-\s*\d+\s*-\s*$")           # "- 14 -"
SOLO_NUM_RE  = re.compile(r"^\s*\d{1,4}\s*$")               # stray page numbers
FOOTNOTE_RE  = re.compile(                                   # footnote lines
    r"^\d+\s+[-–]?\s*(تطبيقا|أنظر|انظر|تم|بخصوص|يراجع|راجع|بموجب|"
    r"Voir|voir|V\.|Cf\.|cf\.|Article|art\.)",
    re.IGNORECASE,
)


def clean_lines(lines: List[str], *, strip_footnotes: bool = False) -> List[str]:
    """Remove page separators and other PDF artefacts."""
    out: List[str] = []
    for raw in lines:
        if PAGE_SEP_RE.match(raw):
            continue
        s = raw.strip()
        # skip stray standalone page numbers (1-4 digits alone on a line)
        if SOLO_NUM_RE.match(s) and len(s) <= 4:
            continue
        if strip_footnotes and FOOTNOTE_RE.match(s):
            continue
        out.append(raw)
    return out


def normalise_whitespace(text: str) -> str:
    """Collapse multiple blank lines into one; trim trailing spaces."""
    lines = text.split("\n")
    result: List[str] = []
    prev_blank = False
    for line in lines:
        stripped = line.rstrip()
        if not stripped:
            if prev_blank:
                continue
            prev_blank = True
        else:
            prev_blank = False
        result.append(stripped)
    return "\n".join(result).strip()


# ─── Arabic hierarchy patterns ───────────────────────────────────────────────
#
# Moroccan legal hierarchy (Arabic):
#   الكتاب  (Book)   →  DB field: book
#   القسم   (Part)   →  DB field: title      (matches French "TITRE")
#   الباب   (Chapter)→  DB field: chapter
#   الفرع   (Section)→  DB field: section
#
# Articles: الفصل N  or  المادة N  (N is a digit — distinguishes from
#           ordinal الفصل الأول which is a Dahir article, not a law article)
# ─────────────────────────────────────────────────────────────────────────────

# Ordinals that legitimately follow a hierarchy keyword
_AR_ORD = (
    r"(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|"
    r"التاسع|العاشر|الحادي\s+عشر|الثاني\s+عشر|الثالث\s+عشر|"
    r"الرابع\s+عشر|الخامس\s+عشر|التمهيدي|الوحيد|الفريد|الأخير|\d+)"
)

# Compiled patterns that anchor each keyword at start of a *segment*
# and require an ordinal / number after it, with NOTHING else in the segment.
# This prevents false positives like "القسم الرابع إذا لم تكن مخالفة..." (body text).
AR_HIER_PATTERNS: List[Tuple[str, re.Pattern]] = [
    ("book",    re.compile(r"^الكتاب\s+" + _AR_ORD + r"\s*$")),
    ("title",   re.compile(r"^القسم\s+"  + _AR_ORD + r"\s*$")),
    ("chapter", re.compile(r"^الباب\s+"  + _AR_ORD + r"\s*$")),
    ("section", re.compile(r"^الفرع\s+"  + _AR_ORD + r"\s*$")),
    # standalone preliminary chapter
    ("chapter", re.compile(r"^باب\s+تمهيدي\s*$")),
]

AR_ARTICLE_RE = re.compile(
    r"^(?:الفصل|المادة)\s+"
    r"(\d+(?:\s*[-–]\s*\d+)?(?:\s+مكرر(?:\s+\d+)?)?)\s*$"
)


def _parse_arabic_hierarchy(line: str) -> List[Tuple[str, str]]:
    """Return list of (db_field, value) found in *line*.

    Handles combined headers like:
        القسم الأول: الباب الأول: مقتضيات تمهيدية
    by splitting on ':' and checking each segment.
    """
    # Split the line into segments by ':'
    # e.g. "القسم الأول: الباب الأول: مقتضيات تمهيدية"
    #   → ["القسم الأول", "الباب الأول", "مقتضيات تمهيدية"]
    raw_segments = [s.strip() for s in line.split(":") if s.strip()]

    # Try to match each segment against hierarchy patterns
    matched: List[Tuple[str, str]] = []
    unmatched_tail: List[str] = []

    for seg in raw_segments:
        seg_matched = False
        for field, pat in AR_HIER_PATTERNS:
            if pat.match(seg):
                matched.append((field, seg))
                seg_matched = True
                break
        if not seg_matched:
            unmatched_tail.append(seg)

    if not matched:
        return []

    # Append any unmatched trailing text to the last matched field's value
    # e.g. "مقتضيات تمهيدية" gets appended to "الباب الأول"
    if unmatched_tail and matched:
        last_field, last_val = matched[-1]
        matched[-1] = (last_field, last_val + ": " + ": ".join(unmatched_tail))

    return matched


# ─── French hierarchy patterns ───────────────────────────────────────────────

FR_HIER_KEYWORDS: List[Tuple[str, re.Pattern]] = [
    ("book",    re.compile(r"(?:LIVRE|Livre)\s+.+", re.IGNORECASE)),
    ("title",   re.compile(r"(?:TITRE|Titre)\s+.+", re.IGNORECASE)),
    ("chapter", re.compile(r"(?:CHAPITRE|Chapitre)\s+.+", re.IGNORECASE)),
    ("section", re.compile(r"(?:SECTION|Section)\s+.+", re.IGNORECASE)),
]

FR_ARTICLE_RE = re.compile(
    r"^(?:Article|Art\.?)\s+"
    r"(\d+(?:\s*[-–]\s*\d+)?(?:\s+(?:bis|ter|quater|quinquies|sexies|premier|1er))?)\s*[.\-]?\s*$",
    re.IGNORECASE,
)


def _parse_french_hierarchy(line: str) -> List[Tuple[str, str]]:
    """Return list of (db_field, value) found in *line*."""
    for field, pat in FR_HIER_KEYWORDS:
        if pat.match(line.strip()):
            return [(field, line.strip().rstrip(":").strip())]
    return []


# ─── Generic parser ──────────────────────────────────────────────────────────

HIER_LEVELS = ["book", "title", "chapter", "section"]


def _reset_below(hierarchy: Dict[str, Optional[str]], field: str) -> None:
    """When a higher hierarchy level is set, clear everything below it."""
    idx = HIER_LEVELS.index(field)
    for lower in HIER_LEVELS[idx + 1:]:
        hierarchy[lower] = None


def parse_txt(
    text: str,
    language: str,
    config: Dict[str, Any],
    *,
    strip_footnotes: bool = False,
) -> List[Dict[str, Any]]:
    """
    Parse a single .txt file and return a list of article dicts.

    Each dict has keys:
        article_number, language, text, path{book,title,chapter,section},
        order_index, source, effective_date, version, doc_id, code
    """
    if not text.strip():
        return []

    lines = text.split("\n")
    lines = clean_lines(lines, strip_footnotes=strip_footnotes)

    is_arabic = language == "ar"
    article_re = AR_ARTICLE_RE if is_arabic else FR_ARTICLE_RE
    parse_hier = _parse_arabic_hierarchy if is_arabic else _parse_french_hierarchy

    hierarchy: Dict[str, Optional[str]] = {k: None for k in HIER_LEVELS}
    articles: List[Dict[str, Any]] = []
    current_num: Optional[str] = None
    text_buf: List[str] = []

    def _flush() -> None:
        nonlocal current_num, text_buf
        if current_num is not None:
            body = normalise_whitespace("\n".join(text_buf))
            if body:
                articles.append(_build_article(
                    current_num, body, dict(hierarchy), len(articles), language, config,
                ))
            current_num = None
            text_buf = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current_num is not None:
                text_buf.append("")
            continue

        # ── hierarchy marker? ──
        hier = parse_hier(stripped)
        if hier:
            for field, value in hier:
                hierarchy[field] = value
                _reset_below(hierarchy, field)
            # If we're NOT inside an article, skip this line
            if current_num is None:
                continue
            # If we ARE inside an article, the hierarchy line ends the article
            _flush()
            continue

        # ── article start? ──
        m = article_re.match(stripped)
        if m:
            _flush()
            raw_num = m.group(1).strip()
            # normalise: "1er" → "1", whitespace around dashes
            raw_num = re.sub(r"\s*[-–]\s*", "-", raw_num)
            raw_num = re.sub(r"\b1er\b", "1", raw_num, flags=re.IGNORECASE)
            raw_num = re.sub(r"\bpremier\b", "1", raw_num, flags=re.IGNORECASE)
            current_num = raw_num
            continue

        # ── regular body text ──
        if current_num is not None:
            text_buf.append(stripped)

    _flush()
    return articles


def _build_article(
    article_number: str,
    text: str,
    path: Dict[str, Optional[str]],
    order_index: int,
    language: str,
    config: Dict[str, Any],
) -> Dict[str, Any]:
    code = config["code"]
    doc_id = config["doc_id"]
    source = config["source_ar"] if language == "ar" else config["source_fr"]
    return {
        "doc_id":         doc_id,
        "jurisdiction":   "MA",
        "code":           code,
        "article_id":     f"{code}:art:{article_number}",
        "article_number": str(article_number),
        "language":       language,
        "path": {
            "book":    path.get("book"),
            "title":   path.get("title"),
            "chapter": path.get("chapter"),
            "section": path.get("section"),
        },
        "text":           text,
        "status":         "active",
        "version":        config.get("version", 1),
        "superseded_by":  None,
        "amended_by":     None,
        "source":         source,
        "effective_date": config.get("effective_date", ""),
        "pdf_file":       "",          # filled in by caller
        "pdf_pages":      [],          # pages unknown from txt
        "order_index":    order_index,
    }


# ─── File scanner ────────────────────────────────────────────────────────────

LANG_MAP = {"arabic": "ar", "french": "fr"}

# Source type indicator: "txt" or "pdf"
SourceInfo = Tuple[Path, str, str, Dict[str, Any], str]  # (path, lang, folder, config, source_type)


def scan_files(
    only_code: Optional[str] = None,
) -> List[SourceInfo]:
    """
    Return list of (filepath, language, folder_name, config, source_type) for
    every processable file under Moroccan_Laws_PDF/.

    Strategy:
      - Arabic: always use .txt files (user-curated text)
      - French: if .txt has real content (≥100 bytes), use it;
                otherwise extract from .pdf directly
    """
    results: List[SourceInfo] = []
    for lang_folder, lang_code in LANG_MAP.items():
        lang_dir = PDF_DIR / lang_folder
        if not lang_dir.is_dir():
            continue
        for cat_dir in sorted(lang_dir.iterdir()):
            if not cat_dir.is_dir():
                continue
            folder_name = cat_dir.name
            if folder_name not in LAW_CONFIGS:
                print(f"  ⚠  No config for folder '{folder_name}', skipping", file=sys.stderr)
                continue
            cfg = LAW_CONFIGS[folder_name]
            if only_code and cfg["code"] != only_code:
                continue

            # Try to find a usable txt file first
            txt_files = sorted(cat_dir.glob("*.txt"))
            usable_txt = [f for f in txt_files if f.stat().st_size >= 100]

            if usable_txt:
                for txt_file in usable_txt:
                    results.append((txt_file, lang_code, folder_name, cfg, "txt"))
            elif lang_code == "fr":
                # French: fall back to PDF extraction
                pdf_files = sorted(cat_dir.glob("*.pdf"))
                if pdf_files:
                    results.append((pdf_files[0], lang_code, folder_name, cfg, "pdf"))
                else:
                    print(f"  ⚠  No usable txt or pdf in {cat_dir}", file=sys.stderr)
            # Arabic with empty stubs: skip (user hasn't pasted text yet)

    return results


# Keep backward-compat alias
def scan_txt_files(only_code: Optional[str] = None):
    return [(p, l, f, c) for p, l, f, c, _ in scan_files(only_code)]


# ─── JSON export ─────────────────────────────────────────────────────────────

def export_json(
    articles: List[Dict[str, Any]],
    config: Dict[str, Any],
    language: str,
    out_dir: Path,
) -> Path:
    """Write articles to a JSON file and return its path."""
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{config['code']}_{language}.json"
    out_path = out_dir / filename

    doc = {
        "doc_id":         config["doc_id"],
        "jurisdiction":   "MA",
        "code":           config["code"],
        "language":       language,
        "source":         config["source_ar"] if language == "ar" else config["source_fr"],
        "effective_date": config["effective_date"],
        "version":        str(config["version"]),
        "extracted_at":   datetime.now(timezone.utc).isoformat(),
        "total_articles": len(articles),
        "articles":       articles,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    return out_path


# ─── JSON compatible with seed.ts (ExtractedDocument) ────────────────────────

def export_seed_json(
    articles: List[Dict[str, Any]],
    config: Dict[str, Any],
    language: str,
) -> Path:
    """
    Write a JSON file in the format that prisma/seed.ts expects:
    data/laws/<code>/<lang>/<code>.json

    ExtractedDocument:
      { doc_id, code, language, source, effective_date, version,
        pdf_file, extracted_at, total_articles,
        articles: [ { article_number, content, hierarchy: {book,part,title,chapter,section} } ] }
    """
    laws_dir = ROOT / "data" / "laws" / config["code"] / language
    laws_dir.mkdir(parents=True, exist_ok=True)
    out_path = laws_dir / f"{config['code']}.json"

    seed_articles = []
    for art in articles:
        path = art["path"]
        seed_articles.append({
            "article_number": art["article_number"],
            "content":        art["text"],
            "hierarchy": {
                "book":    path.get("book"),
                "part":    path.get("title"),       # القسم → part in seed.ts
                "title":   None,                    # unused for Arabic
                "chapter": path.get("chapter"),
                "section": path.get("section"),
            },
        })

    doc = {
        "doc_id":          0,
        "code":            config["code"],
        "language":        language,
        "source":          config["source_ar"] if language == "ar" else config["source_fr"],
        "effective_date":  config["effective_date"],
        "version":         str(config["version"]),
        "pdf_file":        "",
        "extracted_at":    datetime.now(timezone.utc).isoformat(),
        "total_articles":  len(seed_articles),
        "articles":        seed_articles,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    return out_path


# ─── Database insertion (psycopg2) ───────────────────────────────────────────

def load_database_url() -> Optional[str]:
    """Read DATABASE_URL from .env file or environment."""
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key == "DATABASE_URL":
                return val
    return None


def generate_cuid() -> str:
    """Generate a cuid-like ID (26-char lowercase string)."""
    return "cl" + uuid.uuid4().hex[:23]


def insert_into_db(
    articles: List[Dict[str, Any]],
    config: Dict[str, Any],
    language: str,
    db_url: str,
    *,
    dry_run: bool = False,
) -> int:
    """Insert articles into law_articles table. Returns count of upserted rows."""
    try:
        import psycopg2
    except ImportError:
        print("  ✗  psycopg2 not installed. Run: pip install psycopg2-binary", file=sys.stderr)
        return 0

    if dry_run:
        print(f"  [dry-run] Would insert {len(articles)} rows for {config['code']}/{language}")
        return len(articles)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    upsert_sql = """
        INSERT INTO law_articles (
            id, code, book, book_order, part, title, chapter, section,
            article_number, language, text, source, effective_date,
            version, created_at, updated_at
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, NOW(), NOW()
        )
        ON CONFLICT (code, article_number, language, version)
        DO UPDATE SET
            book           = EXCLUDED.book,
            book_order     = EXCLUDED.book_order,
            part           = EXCLUDED.part,
            title          = EXCLUDED.title,
            chapter        = EXCLUDED.chapter,
            section        = EXCLUDED.section,
            text           = EXCLUDED.text,
            source         = EXCLUDED.source,
            effective_date = EXCLUDED.effective_date,
            updated_at     = NOW()
    """

    count = 0
    for art in articles:
        path = art["path"]
        book_val = path.get("book")
        book_order = _extract_book_order(book_val, language)
        eff_date = config.get("effective_date")
        eff_date_val = eff_date if eff_date else None

        cur.execute(upsert_sql, (
            generate_cuid(),
            config["code"],
            book_val,
            book_order,
            path.get("title"),          # part in DB = القسم = title in our hierarchy
            None,                       # title column (unused in Arabic mapping)
            path.get("chapter"),
            path.get("section"),
            art["article_number"],
            language,
            art["text"],
            config["source_ar"] if language == "ar" else config["source_fr"],
            eff_date_val,
            config.get("version", 1),
        ))
        count += 1

    conn.commit()
    cur.close()
    conn.close()
    return count


# ─── Book-order helpers ──────────────────────────────────────────────────────

_AR_ORDINALS = {
    "الأول": 1, "الثاني": 2, "الثالث": 3, "الرابع": 4, "الخامس": 5,
    "السادس": 6, "السابع": 7, "الثامن": 8, "التاسع": 9, "العاشر": 10,
}
_FR_ORDINALS = {
    "PREMIER": 1, "DEUXIEME": 2, "DEUXIÈME": 2, "TROISIEME": 3, "TROISIÈME": 3,
    "QUATRIEME": 4, "QUATRIÈME": 4, "CINQUIEME": 5, "CINQUIÈME": 5,
    "SIXIEME": 6, "SIXIÈME": 6, "SEPTIEME": 7, "SEPTIÈME": 7,
    "HUITIEME": 8, "HUITIÈME": 8, "NEUVIEME": 9, "NEUVIÈME": 9,
    "DIXIEME": 10, "DIXIÈME": 10,
}


def _extract_book_order(book: Optional[str], language: str) -> Optional[int]:
    if not book:
        return None
    if language == "ar":
        for word, num in _AR_ORDINALS.items():
            if word in book:
                return num
    else:
        upper = book.upper()
        for word, num in _FR_ORDINALS.items():
            if word in upper:
                return num
    m = re.search(r"(\d+)", book)
    return int(m.group(1)) if m else None


# ─── CLI & main ──────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Parse Moroccan law .txt files → JSON → DB",
    )
    parser.add_argument(
        "--db", action="store_true",
        help="Also insert into PostgreSQL (reads DATABASE_URL from .env)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Parse and print stats without writing JSON or DB",
    )
    parser.add_argument(
        "--code", type=str, default=None,
        help="Only process a specific law code (e.g. civil_procedure)",
    )
    parser.add_argument(
        "--strip-footnotes", action="store_true",
        help="Attempt to remove footnote lines from article text",
    )
    parser.add_argument(
        "--seed-json", action="store_true",
        help="Also produce JSON in seed.ts-compatible format under data/laws/",
    )
    args = parser.parse_args()

    # ── scan files (txt + pdf fallback for French) ──
    files = scan_files(only_code=args.code)
    if not files:
        print("No processable files found. Nothing to do.")
        print(f"  Looked in: {PDF_DIR}")
        sys.exit(0)

    txt_count = sum(1 for *_, st in files if st == "txt")
    pdf_count = sum(1 for *_, st in files if st == "pdf")
    print(f"Found {len(files)} file(s) to process ({txt_count} txt, {pdf_count} pdf)\n")

    # ── optional DB setup ──
    db_url: Optional[str] = None
    if args.db:
        db_url = load_database_url()
        if not db_url:
            print("✗  --db flag given but DATABASE_URL not found in .env or env", file=sys.stderr)
            sys.exit(1)
        print(f"DB: ...{db_url[-30:]}\n")

    grand_total = 0

    for file_path, lang, folder_name, config, source_type in files:
        rel = file_path.relative_to(ROOT)
        print(f"── {rel}  [{source_type.upper()}]")

        # Get text: from txt file or PDF extraction
        if source_type == "pdf":
            if not HAS_PYMUPDF:
                print("  ✗  Skipping PDF — pymupdf not installed", file=sys.stderr)
                continue
            text = extract_text_from_pdf(file_path)
            pdf_name = file_path.name
        else:
            text = file_path.read_text(encoding="utf-8")
            pdf_name = file_path.stem + ".pdf"

        articles = parse_txt(
            text, lang, config,
            strip_footnotes=args.strip_footnotes,
        )

        # fill in pdf_file
        for art in articles:
            art["pdf_file"] = pdf_name

        code = config["code"]
        print(f"   {code}/{lang}: {len(articles)} articles extracted")

        if not articles:
            continue

        # show first/last article as sanity check
        first = articles[0]
        last  = articles[-1]
        print(f"   First: Art. {first['article_number']}  |  Last: Art. {last['article_number']}")
        ch = first["path"]["chapter"] or "-"
        print(f"   Hierarchy sample: book={first['path']['book'] or '-'}, "
              f"title={first['path']['title'] or '-'}, chapter={ch}")

        if args.dry_run:
            grand_total += len(articles)
            continue

        # ── write JSON ──
        json_path = export_json(articles, config, lang, OUT_DIR)
        print(f"   ✓ JSON → {json_path.relative_to(ROOT)}")

        # ── optionally write seed.ts-compatible JSON ──
        if args.seed_json:
            seed_path = export_seed_json(articles, config, lang)
            print(f"   ✓ seed JSON → {seed_path.relative_to(ROOT)}")

        # ── optionally insert into DB ──
        if db_url:
            n = insert_into_db(articles, config, lang, db_url, dry_run=False)
            print(f"   ✓ DB: {n} rows upserted")

        grand_total += len(articles)
        print()

    print(f"═══ Total: {grand_total} articles across {len(files)} file(s)")


if __name__ == "__main__":
    main()
