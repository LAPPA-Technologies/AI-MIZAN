import re
import io
import base64
import pdfplumber
import anthropic

CLEANING_PROMPT = """
أنت أداة تصحيح نص، وليس كاتباً أو مترجماً.

مهمتك الوحيدة: تصحيح أخطاء استخراج PDF في النص العربي
الوارد أدناه، دون تغيير أي كلمة أو معنى.

ما يُسمح لك بتصحيحه فقط:
1. ترتيب الأحرف المعكوس بسبب RTL/LTR (مثل: "ةمكحملا" → "المحكمة")
2. أرقام الفقرات التي اندمجت مع النص
   (مثل: "المحكمة 2 تثير" → "2. تثير المحكمة")
3. أرقام الصفحات أو رؤوس الصفحات التي نزت في النص
4. المسافات الزائدة أو المفقودة بين الكلمات
5. الأحرف غير المرئية (zero-width joiners, soft hyphens)
6. الوصل غير الصحيح للحروف بسبب ترميز PDF

ما لا يُسمح لك به أبداً:
- إضافة أي كلمة غير موجودة في النص الأصلي
- حذف أي كلمة من النص الأصلي
- إعادة صياغة أي جملة
- تحسين الأسلوب أو تصحيح النحو
- تفسير أو شرح أي شيء

إذا لم تكن متأكداً من حرف أو كلمة، أبقِ النص كما هو.

أعد النص المصحح فقط، بدون أي تعليق أو شرح.
النص المراد تصحيحه:
{text}
"""

ARTICLE_PATTERNS = [
    r'المادة\s+(\d+(?:-\d+)?)',
    r'المادة\s+رقم\s+(\d+)',
    r'الفصل\s+(\d+)',
]

BOOK_PATTERNS = [r'الكتاب\s+\w+', r'القسم\s+\w+']
CHAPTER_PATTERNS = [r'الباب\s+\w+', r'الفصل\s+\w+']


def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """Extract raw text from all PDF pages. Returns (full_text, page_count)."""
    pages = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            text = page.extract_text() or ""
            pages.append(text)
    return "\n".join(pages), page_count


def extract_page_image(pdf_bytes: bytes, page_number: int) -> str:
    """Render a PDF page as base64 PNG."""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        if page_number < 1 or page_number > len(pdf.pages):
            raise ValueError(f"Page {page_number} out of range")
        page = pdf.pages[page_number - 1]
        img = page.to_image(resolution=150)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()


def clean_text_with_claude(raw_text: str) -> str:
    client = anthropic.Anthropic()
    prompt = CLEANING_PROMPT.format(text=raw_text)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8096,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text


def split_into_articles(text: str) -> list[dict]:
    combined = "|".join(f"(?:{p})" for p in ARTICLE_PATTERNS)
    pattern = re.compile(combined)

    matches = list(pattern.finditer(text))
    if not matches:
        return []

    articles = []
    current_book = None
    current_chapter = None

    for i, match in enumerate(matches):
        # Determine article number from whichever group matched
        article_num = next(g for g in match.groups() if g is not None)

        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        article_text = text[start:end].strip()

        # Detect book/chapter context from preceding text
        preceding = text[max(0, start - 500):start]
        for bp in BOOK_PATTERNS:
            bm = re.search(bp, preceding)
            if bm:
                current_book = bm.group(0)
        for cp in CHAPTER_PATTERNS:
            cm = re.search(cp, preceding)
            if cm:
                current_chapter = cm.group(0)

        articles.append({
            "articleNumber": article_num,
            "text": article_text,
            "book": current_book,
            "chapter": current_chapter,
            "startPos": start,
            "quality": "pending",
            "status": "pending",
        })

    return articles


def extract_from_pdf(pdf_bytes: bytes) -> tuple[list[dict], int]:
    """Full pipeline: extract text, clean with Claude, split into articles.
    Returns (articles, page_count).
    """
    raw_text, page_count = extract_text_from_pdf(pdf_bytes)
    cleaned_text = clean_text_with_claude(raw_text)
    articles = split_into_articles(cleaned_text)
    return articles, page_count
