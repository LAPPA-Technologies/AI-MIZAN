#!/usr/bin/env python3
"""
download_laws.py — Download Moroccan legal codes from Adala Justice portal.

Reads direct PDF links from a configuration dict, downloads each file,
validates it is a real PDF, and saves it to:

    Moroccan_Laws_PDF/
        arabic/
            Family_Code/
            Penal_Code/
            ...
        french/
            Family_Code/
            Penal_Code/
            ...

Usage:
    python download_laws.py
    python download_laws.py --output "C:/some/other/dir"
    python download_laws.py --dry-run          # show what would be downloaded
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests

# ──────────────────────────────────────────────────────────────────────
# CONFIGURATION — Add / modify PDF links here
#
# Each law is a dict with:
#   code        : internal identifier
#   folder      : English folder name
#   name_ar     : Arabic display name
#   name_fr     : French display name
#   url_ar      : Adala direct PDF link (Arabic)   — set "" if unknown
#   url_fr      : Adala direct PDF link (French)    — set "" if unknown
#
# HOW TO GET A LINK:
#   1. Go to https://adala.justice.gov.ma  (or /fr for French)
#   2. Find the law, click "إقرأ الآن" / "Lire"
#   3. Copy the URL from the PDF viewer address bar
#   4. Paste it below (the script strips #toolbar=0... automatically)
# ──────────────────────────────────────────────────────────────────────

LAWS = [
    {
        "code": "family",
        "folder": "Family_Code",
        "name_ar": "مدونة الأسرة",
        "name_fr": "Code de la famille",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2024/07/22/%D9%85%D8%AF%D9%88%D9%86%D8%A9%20%D8%A7%D9%84%D8%A3%D8%B3%D8%B1%D8%A9-1721646687560.pdf",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/12/12/DAHIR%20N%C2%B0%201-04-22%20PORTANT%20PROMULGATION%20DE%20LA%20LOI.PDF-1734012188728.pdf",
    },
    {
        "code": "penal",
        "folder": "Penal_Code",
        "name_ar": "القانون الجنائي",
        "name_fr": "Code pénal",
        # ⚠️ The AR url you have (2025/12/03) is actually the criminal PROCEDURE code (مسطرة جنائية),
        # not the penal code itself. Use the correct one below:
        "url_ar": "https://www.cour-constitutionnelle.ma/Documents/Lois/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9%20%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D8%AC%D9%86%D8%A7%D8%A6%D9%8A.pdf",
        #"url_fr": "https://adala.justice.gov.ma/api/uploads/2025/04/03/Dahir%20n%C2%B0%201-59-413%20portant%20approbation%20du%20texte%20du%20code%20penal-1743685280109.pdf",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/04/30/CODE%20PENAL_compressed%20(1)-1714485942207.pdf",
    },
    {
        "code": "labor",
        "folder": "Labor_Code",
        "name_ar": "مدونة الشغل",
        "name_fr": "Code du travail",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2024/09/05/%D9%85%D8%AF%D9%88%D9%86%D8%A9%20%D8%A7%D9%84%D8%B4%D8%BA%D9%84%20%D8%B5%D9%8A%D8%BA%D8%A9%202021-1725527879588.pdf",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/04/30/code%20du%20travail-1714463246806.pdf",
    },
    {
        "code": "obligations",
        "folder": "Obligations_Contracts",
        "name_ar": "قانون الالتزامات والعقود",
        "name_fr": "Code des obligations et contrats (DOC)",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2024/10/24/%D8%B8%D9%87%D9%8A%D8%B1%20%D8%A8%D9%85%D8%AB%D8%A7%D8%A8%D8%A9%20%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D8%A7%D9%84%D8%AA%D8%B2%D8%A7%D9%85%D8%A7%D8%AA%20%D9%88%D8%A7%D9%84%D8%B9%D9%82%D9%88%D8%AF-1729777400387.pdf#toolbar=0&statusbar=0",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/02/28/Code%20des%20Obligations%20et%20des%20Contrats_compressed-1709126934943.pdf#toolbar=0&statusbar=0", 
    },
    {
        "code": "commerce",
        "folder": "Commerce_Code",
        "name_ar": "مدونة التجارة",
        "name_fr": "Code de commerce",
        # AR version: not found as api/uploads — use official RNESM Justice PDF:
        "url_ar": "https://rnesm.justice.gov.ma/Documentation/MA/3_TradeRecord_ar-MA.pdf",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/03/01/Code%20de%20commerce_compressed-1709282723074.pdf",
    },
    {
        "code": "civil_procedure",
        "folder": "Civil_Procedure",
        "name_ar": "قانون المسطرة المدنية",
        "name_fr": "Code de procédure civile",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2024/11/28/%D8%B8%D9%87%D9%8A%D8%B1%20%D8%B4%D8%B1%D9%8A%D9%81%20%D8%A8%D9%85%D8%AB%D8%A7%D8%A8%D8%A9%20%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%B1%D9%82%D9%85%201.74.447%20%D8%A8%D8%A7%D9%84%D9%85%D8%B5%D8%A7%D8%AF%D9%82%D8%A9%20%D8%B9%D9%84%D9%89%20%D9%86%D8%B5%20%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D9%85%D8%B3%D8%B7%D8%B1%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D9%86...-1732806220853.pdf",
        # FR: not found as api/uploads — available as HTML on Adala
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/02/28/Code%20de%20proc%C3%A9dure%20civile-1709129409071.pdf#toolbar=0&statusbar=0",
    },
    {
        "code": "criminal_procedure",
        "folder": "Criminal_Procedure",
        "name_ar": "قانون المسطرة الجنائية",
        "name_fr": "Code de procédure pénale",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2025/12/03/%D8%B8%D9%87%D9%8A%D8%B1%20%D8%B4%D8%B1%D9%8A%D9%81%20%D8%B1%D9%82%D9%85%201.02.255%20%D8%A8%D8%AA%D9%86%D9%81%D9%8A%D8%B0%20%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%B1%D9%82%D9%85%2022.01%20%D8%A7%D9%84%D9%85%D8%AA%D8%B9%D9%84%D9%82%20%D8%A8%D8%A7%D9%84%D9%85%D8%B3%D8%B7%D8%B1%D8%A9%20%D8%A7%D9%84%D8%AC%D9%86%D8%A7%D8%A6%D9%8A%D8%A9-1764773243438.pdf#toolbar=0&statusbar=0",
        # Note: your original penal "url_ar" (2025/12/03) was actually THIS law
        "url_fr": "",  # Not found as PDF on Adala
    },
    {
        "code": "urbanism",
        "folder": "Urbanism_Code",
        "name_ar": "قانون التعمير",
        "name_fr": "Code de l'urbanisme",
        "url_ar": "https://adala.justice.gov.ma/api/uploads/2024/06/26/%D8%A7%D9%84%D8%AA%D8%B9%D9%85%D9%8A%D8%B1-1719398558186.pdf",
        "url_fr": "https://adala.justice.gov.ma/api/uploads/2024/12/12/Dahir%20n%C2%B0%201-92-31%20portant%20promulgation%20de%20la%20loi%20n%C2%B0%2012-90%20relative%20%C3%A0%20l'ur...-1734013643842.pdf#toolbar=0&statusbar=0",  # Not found as PDF on Adala
    },
]

# ──────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────

BASE_DIR_NAME = "Moroccan_Laws_PDF"
# Some past runs used a misspelled folder. Prefer it if it already exists.
ALT_BASE_DIRS = ["Morroccan_Laws_PDF"]
REQUEST_TIMEOUT = 60  # seconds
RETRY_COUNT = 3
RETRY_DELAY = 3  # seconds between retries
DELAY_BETWEEN = 1.5  # polite delay between downloads

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/pdf,*/*",
    "Referer": "https://adala.justice.gov.ma/",
}


# ──────────────────────────────────────────────────────────────────────
# Paths & Functions
# ──────────────────────────────────────────────────────────────────────

# Script and data directory detection — used as the default output root.
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent


def clean_url(raw_url: str) -> str:
    """
    Strip fragment (e.g. #toolbar=0&statusbar=0) from a URL.
    Returns clean download URL or empty string.
    """
    if not raw_url or not raw_url.strip():
        return ""
    # Remove fragment
    url = raw_url.split("#")[0].strip()
    return url


def build_filename(url: str, code: str, lang: str, folder: str | None = None) -> str:
    """
    Build a standardized filename for the downloaded PDF.

    Preferred format: <Folder>_<lang>.pdf (e.g. Family_Code_ar.pdf).
    Falls back to <code>_<lang>.pdf if `folder` is not provided.
    """
    # Use the provided folder (English folder name) as the base for filenames.
    if folder and folder.strip():
        base = folder.strip().replace(" ", "_")
    else:
        base = code

    return f"{base}_{lang}.pdf"


def download_pdf(url: str, dest_path: Path, retries: int = RETRY_COUNT) -> bool:
    """
    Download a PDF from the given URL and save to dest_path.

    Returns True on success, False on failure.
    Retries up to `retries` times on transient errors.
    """
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, stream=True)
            resp.raise_for_status()

            # Validate it looks like a PDF
            content_type = resp.headers.get("Content-Type", "")
            first_bytes = b""

            dest_path.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if not first_bytes:
                        first_bytes = chunk[:8]
                    f.write(chunk)

            # Check PDF magic bytes
            if not first_bytes.startswith(b"%PDF"):
                print(f"    ⚠  WARNING: File does not start with %PDF header!")
                print(f"    First bytes: {first_bytes[:20]}")
                # Keep the file anyway — might be a wrapped PDF
            else:
                size_kb = dest_path.stat().st_size / 1024
                print(f"    ✓  Saved ({size_kb:.0f} KB)")

            return True

        except requests.exceptions.RequestException as e:
            print(f"    ✗  Attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                print(f"       Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)

    return False


def download_all(output_root: Path, dry_run: bool = False) -> None:
    """
    Download all configured law PDFs into the output directory.
    """
    # Prefer an existing output directory if present (tolerate common typo).
    base = None
    for name in [BASE_DIR_NAME] + ALT_BASE_DIRS:
        candidate = output_root / name
        if candidate.exists():
            base = candidate
            break

    if base is None:
        base = output_root / BASE_DIR_NAME

    total = 0
    skipped = 0
    downloaded = 0
    failed = 0

    print("=" * 60)
    print("  Adala Justice — Moroccan Laws PDF Downloader")
    print("=" * 60)
    print(f"  Output: {base}")
    print(f"  Laws:   {len(LAWS)}")
    print(f"  Mode:   {'DRY RUN' if dry_run else 'DOWNLOAD'}")
    print("=" * 60)
    print()

    for law in LAWS:
        code = law["code"]
        folder = law["folder"]

        for lang, url_key, name_key in [
            ("arabic", "url_ar", "name_ar"),
            ("french", "url_fr", "name_fr"),
        ]:
            raw_url = law[url_key]
            name = law[name_key]
            url = clean_url(raw_url)
            total += 1

            print(f"[{code}/{lang}] {name}")

            if not url:
                print(f"    ⏭  No URL configured — skipping")
                skipped += 1
                print()
                continue

            filename = build_filename(url, code, lang, folder)
            dest = base / lang / folder / filename

            if dest.exists():
                size_kb = dest.stat().st_size / 1024
                print(f"    ⏭  Already exists ({size_kb:.0f} KB) — skipping")
                skipped += 1
                print()
                continue

            if dry_run:
                print(f"    📋 Would download: {url[:80]}...")
                print(f"    📋 Save to: {dest}")
                skipped += 1
                print()
                continue

            print(f"    ↓  Downloading...")
            if download_pdf(url, dest):
                downloaded += 1
            else:
                failed += 1
                print(f"    ✗  FAILED after {RETRY_COUNT} attempts")

            # Polite delay
            time.sleep(DELAY_BETWEEN)
            print()

    # Summary
    print("=" * 60)
    print(f"  SUMMARY")
    print(f"  Total entries:  {total}")
    print(f"  Downloaded:     {downloaded}")
    print(f"  Skipped:        {skipped}")
    print(f"  Failed:         {failed}")
    print("=" * 60)

    if failed:
        print("\n  ⚠  Some downloads failed. Re-run the script to retry.")


# ──────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Download Moroccan law PDFs from Adala Justice portal.",
    )
    parser.add_argument(
        "--output",
        default=str(DATA_DIR),
        help=f"Base output directory (default: {DATA_DIR})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be downloaded without downloading",
    )
    args = parser.parse_args()

    download_all(Path(args.output), dry_run=args.dry_run)


if __name__ == "__main__":
    main()
