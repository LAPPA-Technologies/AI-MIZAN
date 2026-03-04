"""
improved_arabic_pdf_extractor.py

Enhanced Arabic PDF text extraction with better Unicode and diacritic support.

Features:
- Uses pdfplumber for better Arabic text extraction
- Post-processing corrections for common Arabic issues
- Proper handling of hamzas and diacritics
- Fallback to PyMuPDF with improved options

Install additional dependencies:
  pip install pdfplumber arabic-reshaper python-bidi

Run:
  python improved_arabic_pdf_extractor.py
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import fitz  # PyMuPDF
import pdfplumber
from arabic_reshaper import arabic_reshaper
from bidi.algorithm import get_display

def extract_text_improved(pdf_path: Path) -> List[List[str]]:
    """
    Extract text from PDF with improved Arabic support.
    Tries pdfplumber first, falls back to PyMuPDF with better options.
    """
    pages_lines = []

    try:
        # Try pdfplumber first - better for Arabic
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                # Post-process Arabic text
                text = post_process_arabic_text(text)
                lines = [clean_line(ln) for ln in text.splitlines()]
                lines = [ln for ln in lines if not is_noise_line(ln)]
                pages_lines.append(lines)

    except Exception as e:
        print(f"pdfplumber failed, falling back to PyMuPDF: {e}")
        # Fallback to PyMuPDF with better options
        doc = fitz.open(str(pdf_path))
        for page in doc:
            # Try different text extraction options
            text = ""
            try:
                # Try with 'dict' option for better Unicode handling
                blocks = page.get_text("dict")
                for block in blocks.get("blocks", []):
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line.get("spans", []):
                                if span.get("text"):
                                    text += span["text"] + " "
                            text += "\n"
            except:
                # Fallback to basic text extraction
                text = page.get_text("text") or ""

            # Post-process Arabic text
            text = post_process_arabic_text(text)
            lines = [clean_line(ln) for ln in text.splitlines()]
            lines = [ln for ln in lines if not is_noise_line(ln)]
            pages_lines.append(lines)

    return pages_lines

def post_process_arabic_text(text: str) -> str:
    """
    Post-process extracted Arabic text to fix common issues.
    """
    # Fix common hamza issues
    corrections = [
        # Fix missing hamzas in common words
        (r'\bاأل([ا-ي])', r'الأ\1'),  # Words starting with missing hamza
        (r'\bاإل([ا-ي])', r'الإ\1'),
        (r'\bاألسرة\b', 'الأسرة'),
        (r'\bاألهلية\b', 'الأهلية'),
        (r'\bاألقارب\b', 'الأقارب'),
        (r'\bاألب\b', 'الأب'),
        (r'\bاألم\b', 'الأم'),
        (r'\bاإلحصان\b', 'الإحصان'),
        (r'\bاإلجبار\b', 'الإجبار'),
        (r'\bاإلكراه\b', 'الإكراه'),
        (r'\bاإلعسار\b', 'الإعسار'),
        (r'\bاإلعاقة\b', 'الإعاقة'),
        (r'\bاإلنجاب\b', 'الإنجاب'),
        (r'\bاإلنفاق\b', 'الإنفاق'),
        (r'\bاإلنذار\b', 'الإنذار'),
        (r'\bاإلنكار\b', 'الإنكار'),
        (r'\bالالجئين\b', 'اللاجئين'),
        (r'\bالالزام\b', 'الالتزام'),
        (r'\bالان([ا-ي]+)', r'الإن\1'),
        (r'\bالال([ا-ي]+)', r'الل\1'),
        (r'\bانحالل\b', 'انحلال'),  # Specific fix for dissolution
    ]

    for pattern, replacement in corrections:
        text = re.sub(pattern, replacement, text)

    # Try to reshape Arabic text properly
    try:
        text = arabic_reshaper.reshape(text)
        text = get_display(text)
    except:
        pass  # If reshaping fails, continue with original text

    return text

def clean_line(s: str) -> str:
    """Clean and normalize a line of text."""
    s = s.replace("\u00ad", "")  # Remove soft hyphens
    s = s.replace("￾", "")  # Remove other artifacts
    s = re.sub(r"[ \t]+", " ", s).strip()
    return s

def is_noise_line(line: str) -> bool:
    """Check if a line is noise (headers, footers, etc.)."""
    if len(line.strip()) < 3:
        return True
    # Add more noise detection logic as needed
    return False

# Test the improved extraction
if __name__ == "__main__":
    pdf_path = Path("Morrocan Laws PDF/Family_Moudawana_Arabic.pdf")
    if pdf_path.exists():
        print("Testing improved Arabic extraction...")
        pages_lines = extract_text_improved(pdf_path)

        # Show first few pages as example
        for i, lines in enumerate(pages_lines[:3]):
            print(f"\nPage {i+1}:")
            for line in lines[:5]:  # First 5 lines per page
                print(f"  {line}")
    else:
        print(f"PDF not found: {pdf_path}")
        print("Please ensure the Arabic PDF is in the correct location.")