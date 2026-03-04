"""
extract_law_articles.py — AI-Mizan V1 Universal Law PDF Extractor

A production-grade extractor for Moroccan legal codes from official PDFs.
Supports: Family Code (Moudawana), Penal Code, Labor Code, Housing Code, etc.

Features:
  - Robust text extraction via PyMuPDF (fitz) with fallback to pdfplumber
  - Arabic text post-processing: hamza/lam-alif normalization, line-break healing
  - Automatic repeating header/footer removal (frequency heuristic)
  - Full hierarchy tracking: Book → Title → Chapter → Section
  - Article boundary detection (FR/EN/AR with Arabic-Indic digit support)
  - Cross-page article continuation
  - Deduplication and validation pass
  - Structured JSON output with metadata

Install:
  pip install pymupdf pdfplumber

Run:
  python extract_law_articles.py
  python extract_law_articles.py --pdf "path/to/file.pdf" --lang ar --code family

Author: AI-Mizan Team
Version: 2.0.0 (V1 Release)
"""

import re
import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
from collections import Counter

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIGURATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EFFECTIVE_DATES = {
    "family": "2004-02-05",
    "penal": "1963-06-26",
    "labor": "2004-06-08",
    "housing": "2013-12-01",
    "commerce": "1996-08-01",
    "obligations": "1913-08-12",
}

DOC_IDS = {
    "family": "ma_family_70_03",
    "penal": "ma_penal_1_59_413",
    "labor": "ma_labor_65_99",
    "housing": "ma_housing_67_12",
    "commerce": "ma_commerce_15_95",
    "obligations": "ma_obligations_doc",
}

EXTRACTION_CONFIGS = [
    {
        "pdf_path": Path("Morrocan Laws PDF/Family_Moudawana_French.pdf"),
        "output_json": Path("family_law_articles_fr.json"),
        "language": "fr",
        "code": "family",
        "source": "Bulletin Officiel",
    },
    {
        "pdf_path": Path("Morrocan Laws PDF/Family_Moudawana_English.pdf"),
        "output_json": Path("family_law_articles_en.json"),
        "language": "en",
        "code": "family",
        "source": "Official Bulletin",
    },
    {
        "pdf_path": Path("Morrocan Laws PDF/Family_Moudawana_Arabic.pdf"),
        "output_json": Path("family_law_articles_ar.json"),
        "language": "ar",
        "code": "family",
        "source": "الجريدة الرسمية",
    },
]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ARABIC TEXT NORMALIZATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARABIC_INDIC_TABLE = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")

# Common PDF extraction corruptions for Arabic
ARABIC_CORRECTIONS: List[Tuple[str, str]] = [
    # Lam-Alif corruptions
    (r"ﻻ", "لا"),
    (r"ﻷ", "لأ"),
    (r"ﻹ", "لإ"),
    (r"ﻵ", "لآ"),
    # Hamza misplacements from OCR/PDF
    (r"األ", "الأ"),
    (r"إل([اأ])", r"الإ\1"),
    # Common broken word patterns
    (r"اال", "الا"),
    (r"التفاقية", "الاتفاقية"),
    (r"لعالقات", "للعلاقات"),
    (r"الزام", "إلزام"),
    (r"فائدة", "فائدة"),
    # Normalize Arabic punctuation
    (r"،\s*،", "،"),
    (r"\.\s*\.", "."),
    # Fix period at start of word (PDF artifact)
    (r"(?<=\s)\.(?=\S)", ""),
]

# Word-boundary corrections
ARABIC_WORD_CORRECTIONS: Dict[str, str] = {
    "األسرة": "الأسرة",
    "األطفال": "الأطفال",
    "األب": "الأب",
    "األم": "الأم",
    "األهلية": "الأهلية",
    "ألزوجين": "الزوجين",
    "ألزوج": "الزوج",
    "ألزوجة": "الزوجة",
    "إرادة": "إرادة",
}


def normalize_arabic_text(text: str) -> str:
    """Apply Arabic-specific corrections to fix PDF extraction artifacts."""
    if not text:
        return text
    
    # Apply regex corrections
    for pattern, replacement in ARABIC_CORRECTIONS:
        text = re.sub(pattern, replacement, text)
    
    # Apply word-level corrections
    for wrong, correct in ARABIC_WORD_CORRECTIONS.items():
        text = text.replace(wrong, correct)
    
    # Normalize multiple spaces
    text = re.sub(r"[ \t]+", " ", text)
    
    # Fix line-break artifacts within words (Arabic: connected script broken by \n)
    # Pattern: Arabic letter + \n + Arabic letter with no space = merge
    text = re.sub(
        r"([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF])\n([\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF])",
        r"\1\2",
        text,
    )
    
    # Normalize tatweel/kashida
    text = re.sub(r"\u0640{2,}", "\u0640", text)
    
    return text.strip()


def normalize_french_text(text: str) -> str:
    """Fix common French PDF extraction issues."""
    if not text:
        return text
    # Fix ligature breakage
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")
    text = text.replace("œ", "oe") if "œ" not in text else text
    # Normalize spaces
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TEXT CLEANING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def clean_line(s: str) -> str:
    """Remove soft hyphens, replacement chars, and normalize whitespace."""
    s = s.replace("\u00ad", "")   # soft hyphen
    s = s.replace("\ufffe", "")   # replacement char
    s = s.replace("￾", "")       # another replacement
    s = re.sub(r"[ \t]+", " ", s).strip()
    return s


def is_page_number(line: str) -> bool:
    """Detect standalone page numbers."""
    return bool(re.fullmatch(r"\s*-?\s*\d{1,4}\s*-?\s*", line))


def is_noise_line(line: str) -> bool:
    """Detect lines that should be discarded."""
    if not line or not line.strip():
        return True
    if is_page_number(line):
        return True
    if re.match(r"^\s*PURL\s*:", line, re.IGNORECASE):
        return True
    if re.match(r"^\s*https?://", line):
        return True
    # Very short lines that are likely artifacts
    if len(line.strip()) <= 2 and not re.match(r"\d", line):
        return True
    return False


def detect_repeating_content(
    pages_lines: List[List[str]], top_k: int = 3, bottom_k: int = 3
) -> Tuple[Set[str], Set[str]]:
    """
    Identify repeating headers/footers across pages.
    Lines appearing on 30%+ of pages at the top/bottom are removed.
    """
    if not pages_lines:
        return set(), set()
    
    header_counter: Counter = Counter()
    footer_counter: Counter = Counter()
    total = len(pages_lines)
    
    for lines in pages_lines:
        top = lines[:min(top_k, len(lines))]
        bottom = lines[-min(bottom_k, len(lines)):]
        for ln in top:
            if ln.strip():
                header_counter[ln] += 1
        for ln in bottom:
            if ln.strip():
                footer_counter[ln] += 1
    
    threshold = max(3, int(total * 0.30))
    headers = {ln for ln, count in header_counter.items() if count >= threshold}
    footers = {ln for ln, count in footer_counter.items() if count >= threshold}
    
    return headers, footers


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PDF TEXT EXTRACTION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_pages_fitz(pdf_path: Path) -> List[List[str]]:
    """Extract text using PyMuPDF (best for most PDFs)."""
    if fitz is None:
        raise ImportError("PyMuPDF (fitz) not installed. Run: pip install pymupdf")
    
    doc = fitz.open(str(pdf_path))
    pages: List[List[str]] = []
    
    for page in doc:
        text = page.get_text("text") or ""
        lines = [clean_line(ln) for ln in text.splitlines()]
        lines = [ln for ln in lines if not is_noise_line(ln)]
        pages.append(lines)
    
    doc.close()
    return pages


def extract_pages_pdfplumber(pdf_path: Path) -> List[List[str]]:
    """Fallback extraction via pdfplumber (better for some Arabic PDFs)."""
    if pdfplumber is None:
        raise ImportError("pdfplumber not installed. Run: pip install pdfplumber")
    
    pages: List[List[str]] = []
    
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            lines = [clean_line(ln) for ln in text.splitlines()]
            lines = [ln for ln in lines if not is_noise_line(ln)]
            pages.append(lines)
    
    return pages


def extract_pages(pdf_path: Path, prefer_pdfplumber: bool = False) -> List[List[str]]:
    """
    Extract pages with automatic fallback.
    For Arabic: tries fitz first, falls back to pdfplumber.
    """
    if prefer_pdfplumber and pdfplumber:
        try:
            return extract_pages_pdfplumber(pdf_path)
        except Exception:
            pass
    
    if fitz:
        try:
            return extract_pages_fitz(pdf_path)
        except Exception:
            pass
    
    if pdfplumber:
        return extract_pages_pdfplumber(pdf_path)
    
    raise RuntimeError(
        f"No PDF library available. Install: pip install pymupdf pdfplumber"
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ARTICLE DETECTION PATTERNS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# French patterns
FR_ARTICLE_RE = re.compile(
    r"^\s*Article\s+(?P<num>\d+|premier|1er)\s*$", re.IGNORECASE
)
FR_ARTICLE_INLINE_RE = re.compile(
    r"^\s*Article\s+(?P<num>\d+|premier|1er)\s*[:\-–]\s*(?P<body>.+)$", re.IGNORECASE
)

# English patterns
EN_ARTICLE_RE = re.compile(
    r"^\s*Article\s+(?P<num>\d+)\s*$", re.IGNORECASE
)
EN_ARTICLE_INLINE_RE = re.compile(
    r"^\s*Article\s+(?P<num>\d+)\s*[:\-–]\s*(?P<body>.+)$", re.IGNORECASE
)

# Arabic patterns (standard + Arabic-Indic digits)
AR_ARTICLE_RE = re.compile(
    r"^\s*(?:ال)?مادة\s*(?P<num>[\d٠-٩]+)\s*$"
)
AR_ARTICLE_INLINE_RE = re.compile(
    r"^\s*(?:ال)?مادة\s*(?P<num>[\d٠-٩]+)\s*[:\-–]\s*(?P<body>.+)$"
)

# Arabic ordinals for article numbering
AR_ORDINALS = {
    "الأولى": "1", "الاولى": "1",
    "الثانية": "2",
    "الثالثة": "3",
    "الرابعة": "4",
    "الخامسة": "5",
    "السادسة": "6",
    "السابعة": "7",
    "الثامنة": "8",
    "التاسعة": "9",
    "العاشرة": "10",
}

# Hierarchy patterns by language
HIERARCHY_PATTERNS = {
    "fr": [
        ("book", re.compile(r"^\s*LIVRE\b.*$", re.IGNORECASE)),
        ("title", re.compile(r"^\s*TITRE\b.*$", re.IGNORECASE)),
        ("chapter", re.compile(r"^\s*CHAPITRE\b.*$", re.IGNORECASE)),
        ("section", re.compile(r"^\s*SECTION\b.*$", re.IGNORECASE)),
    ],
    "en": [
        ("book", re.compile(r"^\s*BOOK\b.*$", re.IGNORECASE)),
        ("title", re.compile(r"^\s*TITLE\b.*$", re.IGNORECASE)),
        ("chapter", re.compile(r"^\s*CHAPTER\b.*$", re.IGNORECASE)),
        ("section", re.compile(r"^\s*SECTION\b.*$", re.IGNORECASE)),
    ],
    "ar": [
        ("book", re.compile(r"^\s*(?:ال)?كتاب\b.*$")),
        ("title", re.compile(r"^\s*(?:ال)?فصل\b.*$")),
        ("chapter", re.compile(r"^\s*(?:ال)?باب\b.*$")),
        ("section", re.compile(r"^\s*(?:ال)?قسم\b.*$")),
    ],
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  ARTICLE NUMBER NORMALIZATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def normalize_article_number(raw: str, lang: str) -> Optional[str]:
    """Convert article number to standard integer string."""
    raw = raw.strip()
    if not raw:
        return None
    
    if lang == "fr":
        low = raw.lower()
        if low in ("premier", "1er"):
            return "1"
        m = re.search(r"\d+", low)
        return m.group(0) if m else None
    
    if lang == "en":
        m = re.search(r"\d+", raw)
        return m.group(0) if m else None
    
    if lang == "ar":
        # Try Arabic-Indic digit conversion first
        converted = raw.translate(ARABIC_INDIC_TABLE).strip()
        m = re.search(r"\d+", converted)
        if m:
            return m.group(0)
        # Try ordinal lookup
        normalized = re.sub(r"\s+", " ", raw).strip()
        return AR_ORDINALS.get(normalized)
    
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HIERARCHY & ARTICLE MATCHING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def match_hierarchy(line: str, lang: str) -> Optional[Tuple[str, str]]:
    """Check if a line is a hierarchy marker (book/title/chapter/section)."""
    patterns = HIERARCHY_PATTERNS.get(lang, [])
    for kind, pattern in patterns:
        if pattern.match(line):
            return (kind, line.strip())
    return None


def match_article_start(line: str, lang: str) -> Optional[Tuple[str, Optional[str]]]:
    """
    Check if a line starts a new article.
    Returns (article_number, inline_body_or_None) or None.
    """
    if lang == "fr":
        mi = FR_ARTICLE_INLINE_RE.match(line)
        if mi:
            num = normalize_article_number(mi.group("num"), "fr")
            return (num, mi.group("body").strip()) if num else None
        m = FR_ARTICLE_RE.match(line)
        if m:
            num = normalize_article_number(m.group("num"), "fr")
            return (num, None) if num else None
    
    elif lang == "en":
        mi = EN_ARTICLE_INLINE_RE.match(line)
        if mi:
            num = normalize_article_number(mi.group("num"), "en")
            return (num, mi.group("body").strip()) if num else None
        m = EN_ARTICLE_RE.match(line)
        if m:
            num = normalize_article_number(m.group("num"), "en")
            return (num, None) if num else None
    
    elif lang == "ar":
        mi = AR_ARTICLE_INLINE_RE.match(line)
        if mi:
            num = normalize_article_number(mi.group("num"), "ar")
            return (num, mi.group("body").strip()) if num else None
        m = AR_ARTICLE_RE.match(line)
        if m:
            num = normalize_article_number(m.group("num"), "ar")
            return (num, None) if num else None
    
    return None


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CORE EXTRACTION ENGINE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def extract_articles(
    pdf_path: Path,
    lang: str,
    code: str,
    source: str,
    version: int = 1,
) -> List[Dict]:
    """
    Extract all articles from a legal PDF.
    
    Args:
        pdf_path: Path to the PDF file
        lang: Language code (fr/en/ar)
        code: Law code identifier (family/penal/labor/etc.)
        source: Source attribution string
        version: Document version number
    
    Returns:
        List of article dictionaries with full metadata
    """
    doc_id = DOC_IDS.get(code, f"ma_{code}")
    effective_date = EFFECTIVE_DATES.get(code, "")
    pdf_file = pdf_path.name
    
    # Use pdfplumber preference for Arabic (better RTL handling)
    prefer_plumber = lang == "ar" and pdfplumber is not None
    pages_lines = extract_pages(pdf_path, prefer_pdfplumber=prefer_plumber)
    
    if not pages_lines:
        print(f"  [WARN] No text extracted from {pdf_path}")
        return []
    
    # Identify and remove repeating headers/footers
    headers, footers = detect_repeating_content(pages_lines)
    if headers:
        print(f"  [INFO] Detected {len(headers)} repeating header patterns")
    if footers:
        print(f"  [INFO] Detected {len(footers)} repeating footer patterns")
    
    # State tracking
    current_book: Optional[str] = None
    current_title: Optional[str] = None
    current_chapter: Optional[str] = None
    current_section: Optional[str] = None
    book_order: int = 0
    
    current_num: Optional[str] = None
    current_lines: List[str] = []
    current_pages: Set[int] = set()
    order_index: int = 0
    output: List[Dict] = []
    
    def flush():
        nonlocal current_num, current_lines, current_pages, order_index
        if not current_num:
            return
        
        # Join and clean article text
        raw_text = "\n".join(ln for ln in current_lines if ln.strip())
        
        # Apply language-specific normalization
        if lang == "ar":
            text = normalize_arabic_text(raw_text)
        elif lang == "fr":
            text = normalize_french_text(raw_text)
        else:
            text = re.sub(r"[ \t]+", " ", raw_text).strip()
        
        if not text:
            current_num = None
            current_lines = []
            current_pages = set()
            return
        
        output.append({
            "doc_id": doc_id,
            "code": code,
            "article_id": f"{doc_id}:v{version}:art:{current_num}",
            "article_number": current_num,
            "language": lang,
            "path": {
                "book": current_book,
                "book_order": book_order,
                "title": current_title,
                "chapter": current_chapter,
                "section": current_section,
            },
            "text": text,
            "source": source,
            "effective_date": effective_date,
            "version": version,
            "pdf_file": pdf_file,
            "pdf_pages": sorted(current_pages),
            "order_index": order_index,
        })
        order_index += 1
        current_num = None
        current_lines = []
        current_pages = set()
    
    # Process each page
    for page_idx, lines in enumerate(pages_lines, start=1):
        # Remove detected headers/footers
        cleaned = [ln for ln in lines if ln not in headers and ln not in footers]
        
        for line in cleaned:
            # Check hierarchy markers
            h = match_hierarchy(line, lang)
            if h:
                kind, value = h
                if current_num:
                    flush()
                if kind == "book":
                    current_book = value
                    book_order += 1
                    current_title = current_chapter = current_section = None
                elif kind == "title":
                    current_title = value
                    current_chapter = current_section = None
                elif kind == "chapter":
                    current_chapter = value
                    current_section = None
                elif kind == "section":
                    current_section = value
                continue
            
            # Check article start
            a = match_article_start(line, lang)
            if a:
                flush()
                num, inline_body = a
                if not num:
                    continue
                current_num = num
                current_pages.add(page_idx)
                if inline_body:
                    current_lines.append(inline_body)
                continue
            
            # Continuation of current article
            if current_num:
                current_pages.add(page_idx)
                current_lines.append(line)
    
    # Flush last article
    flush()
    
    return output


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  POST-PROCESSING & VALIDATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def validate_articles(articles: List[Dict], expected_count: Optional[int] = None) -> Dict:
    """
    Validate extracted articles and report issues.
    """
    report = {
        "total": len(articles),
        "duplicates": [],
        "empty_text": [],
        "missing_hierarchy": [],
        "gaps": [],
        "warnings": [],
    }
    
    seen_numbers: Dict[str, int] = {}
    numbers: List[int] = []
    
    for art in articles:
        num = art["article_number"]
        
        # Check duplicates
        if num in seen_numbers:
            report["duplicates"].append(num)
        seen_numbers[num] = seen_numbers.get(num, 0) + 1
        
        # Check empty text
        if not art["text"] or len(art["text"].strip()) < 10:
            report["empty_text"].append(num)
        
        # Check hierarchy
        if not art["path"]["book"] and not art["path"]["chapter"]:
            report["missing_hierarchy"].append(num)
        
        # Track for gap detection
        try:
            numbers.append(int(num))
        except ValueError:
            pass
    
    # Detect gaps in numbering
    if numbers:
        numbers.sort()
        for i in range(len(numbers) - 1):
            gap = numbers[i + 1] - numbers[i]
            if gap > 1:
                for missing in range(numbers[i] + 1, numbers[i + 1]):
                    report["gaps"].append(str(missing))
    
    # Expected count check
    if expected_count and len(articles) != expected_count:
        report["warnings"].append(
            f"Expected {expected_count} articles, got {len(articles)}"
        )
    
    return report


def deduplicate_articles(articles: List[Dict]) -> List[Dict]:
    """Remove duplicate articles, keeping the one with the longest text."""
    seen: Dict[str, Dict] = {}
    
    for art in articles:
        key = art["article_number"]
        if key not in seen or len(art["text"]) > len(seen[key]["text"]):
            seen[key] = art
    
    # Maintain original order
    return sorted(seen.values(), key=lambda a: a["order_index"])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def process_config(cfg: Dict) -> None:
    """Process a single extraction configuration."""
    pdf_path = cfg["pdf_path"]
    out_path = cfg["output_json"]
    lang = cfg["language"]
    code = cfg["code"]
    source = cfg["source"]
    
    if not pdf_path.exists():
        print(f"  [SKIP] PDF not found: {pdf_path}")
        return
    
    print(f"\n{'='*60}")
    print(f"  Extracting: {lang.upper()} from {pdf_path}")
    print(f"  Code: {code} | Source: {source}")
    print(f"{'='*60}")
    
    articles = extract_articles(pdf_path, lang, code, source)
    
    # Deduplicate
    before = len(articles)
    articles = deduplicate_articles(articles)
    if before != len(articles):
        print(f"  [INFO] Removed {before - len(articles)} duplicates")
    
    # Validate
    report = validate_articles(articles)
    print(f"  Total articles: {report['total']}")
    if report["duplicates"]:
        print(f"  [WARN] Duplicate articles: {report['duplicates'][:10]}")
    if report["empty_text"]:
        print(f"  [WARN] Empty articles: {report['empty_text'][:10]}")
    if report["gaps"]:
        print(f"  [INFO] Number gaps: {report['gaps'][:20]}")
    if report["missing_hierarchy"]:
        print(f"  [INFO] No hierarchy: articles {report['missing_hierarchy'][:10]}")
    
    # Write output
    out_path.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  -> {len(articles)} articles written to {out_path}")
    
    # Write validation report
    report_path = out_path.with_suffix(".report.json")
    report_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"  -> Validation report: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description="AI-Mizan V1 — Universal Moroccan Law PDF Extractor"
    )
    parser.add_argument("--pdf", type=str, help="Path to a specific PDF file")
    parser.add_argument("--lang", type=str, choices=["fr", "en", "ar"], help="Language")
    parser.add_argument("--code", type=str, default="family", help="Law code (family/penal/labor/etc.)")
    parser.add_argument("--source", type=str, default="Bulletin Officiel", help="Source label")
    parser.add_argument("--output", type=str, help="Output JSON path")
    parser.add_argument("--all", action="store_true", help="Run all configured extractions")
    
    args = parser.parse_args()
    
    if args.pdf and args.lang:
        # Single PDF extraction
        cfg = {
            "pdf_path": Path(args.pdf),
            "output_json": Path(args.output or f"{args.code}_articles_{args.lang}.json"),
            "language": args.lang,
            "code": args.code,
            "source": args.source,
        }
        process_config(cfg)
    elif args.all or len(sys.argv) == 1:
        # Run all configured extractions
        print("AI-Mizan V1 — Running all configured extractions")
        print(f"Configs: {len(EXTRACTION_CONFIGS)}")
        
        for cfg in EXTRACTION_CONFIGS:
            try:
                process_config(cfg)
            except Exception as e:
                print(f"  [ERROR] {cfg['language']}: {e}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
