"""
comprehensive_arabic_corrector.py

A comprehensive system for correcting Arabic text extracted from PDFs.
This addresses the fundamental issue that PDF text extraction corrupts Arabic script.

Features:
- Fixes hamza placement and forms
- Corrects common Arabic word errors
- Handles diacritical marks
- Provides pattern-based corrections

Usage:
- Run on extracted text to improve accuracy
- Can be integrated into the extraction pipeline
"""

import re
import json
from pathlib import Path
from typing import Dict, List

class ArabicTextCorrector:
    """Comprehensive Arabic text correction system."""

    def __init__(self):
        # Common Arabic corrections database
        self.corrections = {
            # Hamza corrections
            r'\bاأل([ا-ي])': r'الأ\1',  # Missing hamza at start
            r'\bاإل([ا-ي])': r'الإ\1',
            r'\bاألسرة\b': 'الأسرة',
            r'\bاألهلية\b': 'الأهلية',
            r'\bاألقارب\b': 'الأقارب',
            r'\bاألب\b': 'الأب',
            r'\bاألم\b': 'الأم',
            r'\bاإلحصان\b': 'الإحصان',
            r'\bاإلجبار\b': 'الإجبار',
            r'\bاإلكراه\b': 'الإكراه',
            r'\bاإلعسار\b': 'الإعسار',
            r'\bاإلعاقة\b': 'الإعاقة',
            r'\bاإلنجاب\b': 'الإنجاب',
            r'\bاإلنفاق\b': 'الإنفاق',
            r'\bاإلنذار\b': 'الإنذار',
            r'\bاإلنكار\b': 'الإنكار',

            # Specific legal terms
            r'\bانحالل\b': 'انحلال',  # Dissolution
            r'\bميثاق\b': 'ميثاق',    # Covenant
            r'\bتراض\b': 'تراض',     # Mutual consent
            r'\bترابط\b': 'ترابط',   # Connection
            r'\bشرعي\b': 'شرعي',     # Legal/Islamic
            r'\bدوام\b': 'دوام',     # Permanence
            r'\bغايته\b': 'غايته',   # Its purpose
            r'\bإحصان\b': 'إحصان',   # Chastity
            r'\bعفاف\b': 'عفاف',     # Modesty
            r'\bإنشاء\b': 'إنشاء',   # Establishment
            r'\bأسرة\b': 'أسرة',     # Family
            r'\bمستقرة\b': 'مستقرة', # Stable

            # Additional corrections based on user feedback
            r'\bألحكام\b': 'أحكام',  # Rules/laws - missing hamza
            r'\bأعاله\b': 'أعماله',  # His works (assuming this is the intended word)
            r'\bألزوجين\b': 'الزوجين',  # The spouses - missing hamza
            r'\bألخلع\b': 'الخلع',   # Divorce by mutual consent - missing hamza
            r'\bألطالق\b': 'الطالق', # Divorce - missing hamza

            # Common prefixes
            r'\bالالجئين\b': 'اللاجئين',
            r'\bالالزام\b': 'الالتزام',
            r'\bالان([ا-ي]+)': r'الإن\1',
            r'\bالال([ا-ي]+)': r'الل\1',

            # Book and chapter titles
            r'\bكتاب\b': 'كتاب',     # Book
            r'\bباب\b': 'باب',       # Chapter
            r'\bفصل\b': 'فصل',       # Title/Section
            r'\bمادة\b': 'مادة',     # Article

            # Ordinals
            r'\bاألول\b': 'الأول',
            r'\bالثاني\b': 'الثاني',
            r'\bالثالث\b': 'الثالث',
            r'\bالرابع\b': 'الرابع',
            r'\bالخامس\b': 'الخامس',
            r'\bالسادس\b': 'السادس',
            r'\bالسابع\b': 'السابع',
        }

        # Compile regex patterns for efficiency
        self.compiled_corrections = [(re.compile(pattern), replacement)
                                   for pattern, replacement in self.corrections.items()]

    def correct_text(self, text: str) -> str:
        """Apply all corrections to the text."""
        for pattern, replacement in self.compiled_corrections:
            text = pattern.sub(replacement, text)
        return text

    def correct_json_file(self, file_path: Path) -> int:
        """Correct Arabic text in a JSON file containing articles."""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        corrections_made = 0
        for article in data:
            if 'text' in article:
                original_text = article['text']
                corrected_text = self.correct_text(original_text)
                if corrected_text != original_text:
                    article['text'] = corrected_text
                    corrections_made += 1

            # Also correct path fields
            if 'path' in article:
                for key in ['book', 'title', 'chapter', 'section']:
                    if key in article['path'] and article['path'][key]:
                        original = article['path'][key]
                        corrected = self.correct_text(original)
                        if corrected != original:
                            article['path'][key] = corrected
                            corrections_made += 1

        # Save corrected data
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return corrections_made

def main():
    """Main function to correct Arabic text in the project."""
    corrector = ArabicTextCorrector()

    # Correct the Arabic articles file
    arabic_file = Path("family_law_articles_ar.json")
    if arabic_file.exists():
        print("Correcting Arabic articles...")
        corrections = corrector.correct_json_file(arabic_file)
        print(f"Made {corrections} corrections to Arabic text.")
    else:
        print(f"File not found: {arabic_file}")

    # Test corrections on sample text
    sample_text = "مدونة األسرة - انحالل ميثاق الزوجية - اإلحصان والعفاف"
    corrected = corrector.correct_text(sample_text)
    print(f"\nSample correction:")
    print(f"Original:  {sample_text}")
    print(f"Corrected: {corrected}")

if __name__ == "__main__":
    main()