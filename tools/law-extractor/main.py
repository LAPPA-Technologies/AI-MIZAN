import base64
import json
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
_env_path = Path(__file__).parent / ".env"
print(f"[DEBUG] Loading .env from: {_env_path} (exists: {_env_path.exists()})")
load_dotenv(_env_path)

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import db
import extractor
import validator

app = FastAPI(title="AI-Mizan Law Extractor")

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# In-memory session state (single-user local tool)
session: dict = {
    "pdf_bytes": None,
    "page_count": 0,
    "law_code": None,
    "articles": [],
    "progress": {"done": 0, "total": 0, "status": "idle", "message": ""},
}


# ── Models ────────────────────────────────────────────────────────────────────

class ExtractRequest(BaseModel):
    pdf_base64: str
    lawCode: str
    apiProvider: str = "claude"  # "claude" or "openai"
    fileName: str = ""           # original PDF filename, stored as sourceDocument


class LoadPdfRequest(BaseModel):
    pdf_base64: str


class ApproveRequest(BaseModel):
    lawCode: str
    articleNumber: str
    text: str
    book: Optional[str] = None
    part: Optional[str] = None
    title: Optional[str] = None
    chapter: Optional[str] = None
    section: Optional[str] = None
    startPage: Optional[int] = None
    sourceDocument: Optional[str] = None
    quality: Optional[str] = None


class RejectRequest(BaseModel):
    lawCode: str
    articleNumber: str
    reason: Optional[str] = None


class ImportBatchRequest(BaseModel):
    articles: list[dict]
    lawCode: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.post("/session/load-pdf")
def load_pdf(req: LoadPdfRequest):
    try:
        pdf_bytes = base64.b64decode(req.pdf_base64)
    except Exception:
        raise HTTPException(400, "Invalid base64 PDF data")

    import pdfplumber, io as _io
    with pdfplumber.open(_io.BytesIO(pdf_bytes)) as pdf:
        page_count = len(pdf.pages)
    session["pdf_bytes"] = pdf_bytes
    session["page_count"] = page_count
    session["articles"] = []

    return {"pageCount": page_count, "textLength": len(pdf_bytes)}


@app.get("/extract/progress")
def extract_progress():
    return session["progress"]


@app.post("/extract")
def extract(req: ExtractRequest):
    try:
        pdf_bytes = base64.b64decode(req.pdf_base64)
    except Exception:
        raise HTTPException(400, "Invalid base64 PDF data")

    provider = req.apiProvider if req.apiProvider in ("claude", "openai", "none") else "claude"
    session["pdf_bytes"] = pdf_bytes
    session["law_code"] = req.lawCode
    session["progress"] = {"done": 0, "total": 0, "status": "running", "message": f"جارٍ تحليل الوثيقة ({provider})...", "provider": provider}

    def on_progress(done: int, total: int, message: str):
        session["progress"] = {"done": done, "total": total, "status": "running", "message": message, "provider": provider}

    try:
        articles, page_count, interrupted, interrupt_reason = extractor.extract_all_articles(
            pdf_bytes, progress_callback=on_progress, provider=provider,
            source_document=req.fileName,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        session["progress"] = {"done": 0, "total": 0, "status": "error", "message": str(e)}
        raise HTTPException(500, str(e))

    session["page_count"] = page_count
    status = "interrupted" if interrupted else "done"
    session["progress"] = {
        "done": len(articles), "total": len(articles),
        "status": status,
        "message": interrupt_reason or f"اكتمل — {len(articles)} مادة",
        "provider": provider,
    }

    issues = validator.validate(articles, req.lawCode)
    session["articles"] = articles

    return {
        "articles": articles,
        "issues": issues,
        "pageCount": page_count,
        "interrupted": interrupted,
        "interruptReason": interrupt_reason,
    }


@app.get("/db/articles/{law_code}")
def get_db_articles(law_code: str):
    try:
        articles = db.get_articles(law_code)
        # Convert datetime objects to strings for JSON serialization
        for a in articles:
            for k, v in a.items():
                if hasattr(v, "isoformat"):
                    a[k] = v.isoformat()
        return {"articles": articles}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/db/article/{law_code}/{article_number}")
def get_db_article(law_code: str, article_number: str):
    try:
        article = db.get_article(law_code, article_number)
        if article is None:
            return {"article": None}
        for k, v in article.items():
            if hasattr(v, "isoformat"):
                article[k] = v.isoformat()
        return {"article": article}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/db/approve")
def approve(req: ApproveRequest):
    article_dict = {
        "articleNumber":  req.articleNumber,
        "text":           req.text,
        "book":           req.book,
        "part":           req.part,
        "title":          req.title,
        "chapter":        req.chapter,
        "section":        req.section,
        "startPage":      req.startPage,
        "sourceDocument": req.sourceDocument,
        "quality":        req.quality,
    }
    try:
        result = db.upsert_article(req.lawCode, article_dict)
        # Update session status
        for a in session["articles"]:
            if a["articleNumber"] == req.articleNumber:
                a["status"] = "approved"
                a["quality"] = "clean"
                break
        return {"success": True, "id": result["id"]}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/db/reject")
def reject(req: RejectRequest):
    # Mark in session only — never delete from DB
    for a in session["articles"]:
        if a["articleNumber"] == req.articleNumber:
            a["status"] = "rejected"
            a["rejectReason"] = req.reason
            break
    return {"success": True}


@app.post("/db/import-batch")
def import_batch(req: ImportBatchRequest):
    approved = [a for a in req.articles if a.get("status") == "approved"]
    if not approved:
        return {"imported": 0, "failed": [], "message": "No approved articles to import"}
    try:
        result = db.import_batch(req.lawCode, approved)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/pdf/page/{page_number}")
def get_pdf_page(page_number: int):
    if session["pdf_bytes"] is None:
        raise HTTPException(400, "No PDF loaded in session")
    try:
        img_b64 = extractor.extract_page_image(session["pdf_bytes"], page_number)
        return {"image": img_b64, "page": page_number, "total": session["page_count"]}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/session/articles")
def get_session_articles():
    return {"articles": session["articles"], "lawCode": session["law_code"]}


@app.get("/debug/raw-text")
def debug_raw_text():
    if session["pdf_bytes"] is None:
        raise HTTPException(400, "No PDF loaded — upload a PDF first via the UI")
    articles, page_count = extractor.extract_with_pdfplumber(session["pdf_bytes"])
    sample = articles[0]["text"][:500] if articles else ""
    return {
        "page_count": page_count,
        "articles_found": len(articles),
        "first_article_preview": sample,
    }
