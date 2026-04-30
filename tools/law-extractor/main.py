import base64
import json
from pathlib import Path
from typing import Optional

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
}


# ── Models ────────────────────────────────────────────────────────────────────

class ExtractRequest(BaseModel):
    pdf_base64: str
    lawCode: str


class LoadPdfRequest(BaseModel):
    pdf_base64: str


class ApproveRequest(BaseModel):
    lawCode: str
    articleNumber: str
    text: str
    chapter: Optional[str] = None
    book: Optional[str] = None
    part: Optional[str] = None
    title: Optional[str] = None
    section: Optional[str] = None


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

    raw_text, page_count = extractor.extract_text_from_pdf(pdf_bytes)
    session["pdf_bytes"] = pdf_bytes
    session["page_count"] = page_count
    session["articles"] = []

    return {"pageCount": page_count, "textLength": len(raw_text)}


@app.post("/extract")
def extract(req: ExtractRequest):
    try:
        pdf_bytes = base64.b64decode(req.pdf_base64)
    except Exception:
        raise HTTPException(400, "Invalid base64 PDF data")

    session["pdf_bytes"] = pdf_bytes
    session["law_code"] = req.lawCode

    articles, page_count = extractor.extract_from_pdf(pdf_bytes)
    session["page_count"] = page_count

    issues = validator.validate(articles, req.lawCode)
    session["articles"] = articles

    return {"articles": articles, "issues": issues, "pageCount": page_count}


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
        "articleNumber": req.articleNumber,
        "text": req.text,
        "chapter": req.chapter,
        "book": req.book,
        "part": req.part,
        "title": req.title,
        "section": req.section,
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
