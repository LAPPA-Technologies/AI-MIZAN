import json
import pdfplumber
import arabic_reshaper
from bidi.algorithm import get_display
import unicodedata
import re
from pathlib import Path

def extract_arabic_text_from_pdf(pdf_path):
    """
    Extract Arabic text from PDF with proper reshaping and bidirectional handling
    """
    articles = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            try:
                # Extract text from page
                text = page.extract_text()

                if text and text.strip():
                    # Clean and normalize the text
                    text = clean_arabic_text(text)

                    # Split text into potential articles
                    page_articles = parse_articles_from_text(text, page_num + 1)

                    articles.extend(page_articles)

            except Exception as e:
                print(f"Error processing page {page_num + 1}: {e}")
                continue

    return articles

def clean_arabic_text(text):
    """
    Clean and properly shape Arabic text
    """
    if not text:
        return ""

    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text.strip())

    # Handle Arabic text reshaping
    try:
        # Reshape Arabic text
        reshaped_text = arabic_reshaper.reshape(text)

        # Apply bidirectional algorithm
        bidi_text = get_display(reshaped_text)

        # Normalize Unicode
        normalized_text = unicodedata.normalize('NFKC', bidi_text)

        return normalized_text
    except Exception as e:
        print(f"Error reshaping text: {e}")
        return text

def parse_articles_from_text(text, page_num):
    """
    Parse articles from extracted text
    """
    articles = []

    # Pattern to find article numbers (المادة followed by number)
    article_pattern = r'المادة\s*(\d+)'

    # Split text by article markers
    parts = re.split(f'({article_pattern})', text)

    current_article = None
    current_text = []

    for i, part in enumerate(parts):
        if re.match(article_pattern, part):
            # Save previous article if exists
            if current_article and current_text:
                article_data = {
                    'article_number': current_article,
                    'text': ' '.join(current_text).strip(),
                    'page': page_num
                }
                articles.append(article_data)

            # Start new article
            match = re.search(article_pattern, part)
            current_article = match.group(1)
            current_text = [part]
        else:
            if current_article:
                current_text.append(part)

    # Add the last article
    if current_article and current_text:
        article_data = {
            'article_number': current_article,
            'text': ' '.join(current_text).strip(),
            'page': page_num
        }
        articles.append(article_data)

    return articles

def update_json_with_corrected_text(pdf_path, json_path):
    """
    Update the JSON file with correctly extracted Arabic text
    """
    # Load existing JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        articles_data = json.load(f)

    # Extract correct text from PDF
    pdf_articles = extract_arabic_text_from_pdf(pdf_path)

    # Create mapping of article numbers to corrected text
    corrected_texts = {}
    for article in pdf_articles:
        article_num = article['article_number']
        corrected_texts[article_num] = article['text']

    print(f"Found {len(corrected_texts)} articles in PDF")

    # Update JSON data
    updated_count = 0
    for article in articles_data:
        if article.get('language') == 'ar':
            article_num = article.get('article_number')
            if article_num in corrected_texts:
                old_text = article['text']
                new_text = corrected_texts[article_num]

                # Only update if text is significantly different and new text is not empty
                if new_text and len(new_text) > len(old_text) * 0.5:
                    article['text'] = new_text
                    updated_count += 1
                    print(f"Updated Article {article_num}")
                else:
                    print(f"Skipped Article {article_num} - text too short or similar")

    print(f"Updated {updated_count} articles")

    # Save updated JSON
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(articles_data, f, ensure_ascii=False, indent=2)

    return updated_count

if __name__ == "__main__":
    pdf_path = "Morrocan Laws PDF/Family_Moudawana_Arabic.pdf"
    json_path = "family_law_articles_ar.json"

    print("Starting Arabic text extraction from PDF...")
    updated_count = update_json_with_corrected_text(pdf_path, json_path)
    print(f"Successfully updated {updated_count} articles with corrected Arabic text")