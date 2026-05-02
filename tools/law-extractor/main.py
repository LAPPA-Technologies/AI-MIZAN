import base64
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
_env_path = Path(__file__).parent / ".env"
print(f"[DEBUG] Loading .env from: {_env_path} (exists: {_env_path.exists()})")
load_dotenv(_env_path)

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import db
import extractor
import session_store
import validator

app = FastAPI(title="AI-Mizan Law Extractor")

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# In-memory state (single-user local tool — resets on restart)
session: dict = {
    "pdf_bytes": None,
    "page_count": 0,
    "law_code": None,
    "articles": [],
    "progress": {"done": 0, "total": 0, "status": "idle", "message": ""},
}

# Reviewer identity — set once per session, not persisted to DB
_reviewer_name: str = ""


# ── Models ────────────────────────────────────────────────────────────────────

class ExtractRequest(BaseModel):
    pdf_base64: str
    lawCode: str
    apiProvider: str = "claude"
    fileName: str = ""


class LoadPdfRequest(BaseModel):
    pdf_base64: str


class IdentityRequest(BaseModel):
    name: str


class ApproveRequest(BaseModel):
    lawCode: str
    articleNumber: str
    text: str
    reviewerName: str
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
    reviewerName: str
    reason: Optional[str] = None
    rejectionCategory: Optional[str] = None


class ImportBatchRequest(BaseModel):
    articles: list[dict]
    lawCode: str
    reviewerName: str = ""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


# ── Reviewer identity ─────────────────────────────────────────────────────────

@app.get("/session/identity")
def get_identity():
    return {"name": _reviewer_name}


@app.post("/session/identity")
def set_identity(req: IdentityRequest):
    global _reviewer_name
    name = req.name.strip()
    if not name:
        raise HTTPException(400, "Name cannot be empty")
    _reviewer_name = name
    return {"name": _reviewer_name}


# ── Session persistence ───────────────────────────────────────────────────────

@app.get("/session/load/{law_code}")
def load_saved_session(law_code: str):
    articles = session_store.load_session(law_code)
    if articles is None:
        return {"articles": None, "lawCode": law_code}
    approved = sum(1 for a in articles if a.get("status") == "approved")
    rejected = sum(1 for a in articles if a.get("status") == "rejected")
    return {
        "articles": articles,
        "lawCode": law_code,
        "total": len(articles),
        "approved": approved,
        "rejected": rejected,
    }


# ── PDF load ──────────────────────────────────────────────────────────────────

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


# ── Extraction ────────────────────────────────────────────────────────────────

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
    session["progress"] = {
        "done": 0, "total": 0, "status": "running",
        "message": f"جارٍ تحليل الوثيقة ({provider})...", "provider": provider,
    }

    # Clear any prior session for this law_code before extracting fresh
    session_store.clear_session(req.lawCode)

    def on_progress(done: int, total: int, message: str):
        session["progress"] = {
            "done": done, "total": total, "status": "running",
            "message": message, "provider": provider,
        }

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

    # Persist session to SQLite so it survives restarts
    session_store.save_session(req.lawCode, articles)

    return {
        "articles": articles,
        "issues": issues,
        "pageCount": page_count,
        "interrupted": interrupted,
        "interruptReason": interrupt_reason,
    }


# ── DB read ───────────────────────────────────────────────────────────────────

@app.get("/db/articles/{law_code}")
def get_db_articles(law_code: str):
    try:
        articles = db.get_articles(law_code)
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


# ── Approve ───────────────────────────────────────────────────────────────────

@app.post("/db/approve")
def approve(req: ApproveRequest):
    reviewer = req.reviewerName.strip()
    if not reviewer:
        raise HTTPException(400, "Reviewer name required before approving")

    now_iso = datetime.now(timezone.utc).isoformat()
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
    except Exception as e:
        raise HTTPException(500, str(e))

    # Update in-memory session
    for a in session["articles"]:
        if a["articleNumber"] == req.articleNumber:
            a["status"] = "approved"
            a["quality"] = "clean"
            a["reviewer"] = reviewer
            a["approver"] = reviewer
            a["approvedAt"] = now_iso
            break

    # Persist to SQLite
    session_store.update_article(req.lawCode, req.articleNumber, {
        "status": "approved", "quality": "clean",
        "reviewer": reviewer, "approver": reviewer, "approvedAt": now_iso,
    })

    return {"success": True, "id": result["id"]}


# ── Reject ────────────────────────────────────────────────────────────────────

@app.post("/db/reject")
def reject(req: RejectRequest):
    reviewer = req.reviewerName.strip()
    if not reviewer:
        raise HTTPException(400, "Reviewer name required before rejecting")

    now_iso = datetime.now(timezone.utc).isoformat()

    for a in session["articles"]:
        if a["articleNumber"] == req.articleNumber:
            a["status"] = "rejected"
            a["rejectionReason"] = req.reason
            a["rejectionCategory"] = req.rejectionCategory
            a["reviewer"] = reviewer
            a["rejectedAt"] = now_iso
            break

    session_store.update_article(req.lawCode, req.articleNumber, {
        "status": "rejected",
        "rejectionReason": req.reason,
        "rejectionCategory": req.rejectionCategory,
        "reviewer": reviewer,
        "rejectedAt": now_iso,
    })

    return {"success": True}


# ── Push to Neon DB (batch import) ────────────────────────────────────────────

@app.post("/db/import-batch")
def import_batch(req: ImportBatchRequest):
    approved = [a for a in req.articles if a.get("status") == "approved"]
    if not approved:
        return {"imported": 0, "failed": [], "message": "No approved articles to import"}
    try:
        result = db.import_batch(req.lawCode, approved)
        session_store.log_push(
            req.lawCode, req.reviewerName,
            result.get("imported", 0), len(result.get("failed", [])),
        )
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


# ── PDF viewer ────────────────────────────────────────────────────────────────

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
