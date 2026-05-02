"""
main.py — FastAPI server for AI-Mizan Law Extractor.

Security: set EXTRACTOR_PASSCODE in tools/law-extractor/.env to require
a code at login. Leave unset (or empty) for no code requirement.
"""
import base64
import os
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

# Security passcode — set EXTRACTOR_PASSCODE in .env, leave empty to disable
EXTRACTOR_PASSCODE: str = os.getenv("EXTRACTOR_PASSCODE", "").strip()

# In-memory state (single-user local tool — resets on server restart)
session: dict = {
    "pdf_bytes": None,
    "page_count": 0,
    "law_code": None,
    "articles": [],
    "progress": {"done": 0, "total": 0, "status": "idle", "message": ""},
}

_reviewer_name: str = ""


# ── Models ────────────────────────────────────────────────────────────────────

class ExtractRequest(BaseModel):
    pdf_base64: str
    lawCode: str
    apiProvider: str = "claude"
    fileName: str = ""


class LoadPdfRequest(BaseModel):
    pdf_base64: str
    fileName: str = ""
    lawCode: str = ""


class IdentityRequest(BaseModel):
    name: str
    securityCode: str = ""


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


class MarkPushedRequest(BaseModel):
    lawCode: str
    articleNumbers: list[str]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def index():
    return FileResponse(str(STATIC_DIR / "index.html"))


# ── Reviewer identity + security ──────────────────────────────────────────────

@app.get("/session/identity")
def get_identity():
    return {
        "name": _reviewer_name,
        "hasPasscode": bool(EXTRACTOR_PASSCODE),
    }


@app.post("/session/identity")
def set_identity(req: IdentityRequest):
    global _reviewer_name
    name = req.name.strip()
    if not name:
        raise HTTPException(400, "Name cannot be empty")
    if EXTRACTOR_PASSCODE and req.securityCode != EXTRACTOR_PASSCODE:
        raise HTTPException(403, "Invalid security code")
    _reviewer_name = name
    return {"name": _reviewer_name}


# ── Session list ──────────────────────────────────────────────────────────────

@app.get("/session/list")
def list_sessions():
    return {"sessions": session_store.list_sessions()}


@app.get("/session/load/{law_code}")
def load_saved_session(law_code: str):
    articles = session_store.load_session(law_code)
    if articles is None:
        return {"articles": None, "lawCode": law_code}
    approved = sum(1 for a in articles if a.get("status") == "approved")
    rejected = sum(1 for a in articles if a.get("status") == "rejected")
    pdf_meta = session_store.load_pdf(law_code)
    return {
        "articles":  articles,
        "lawCode":   law_code,
        "total":     len(articles),
        "approved":  approved,
        "rejected":  rejected,
        "fileName":  pdf_meta["file_name"]  if pdf_meta else None,
        "pageCount": pdf_meta["page_count"] if pdf_meta else 0,
    }


@app.get("/session/pdf/{law_code}")
def get_session_pdf(law_code: str):
    pdf_data = session_store.load_pdf(law_code)
    if pdf_data is None:
        raise HTTPException(404, f"No PDF stored for {law_code}")
    return {
        "pdf_base64": base64.b64encode(pdf_data["pdf_bytes"]).decode(),
        "file_name":  pdf_data["file_name"],
        "page_count": pdf_data["page_count"],
        "law_code":   law_code,
    }


@app.delete("/session/{law_code}")
def delete_session(law_code: str):
    session_store.delete_session(law_code)
    return {"deleted": law_code}


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

    # Persist PDF so the session can be fully restored after restart
    if req.lawCode:
        session["law_code"] = req.lawCode
        session_store.save_pdf(req.lawCode, pdf_bytes, req.fileName or "unknown.pdf", page_count)

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

    session_store.save_session(req.lawCode, articles)
    # Also save the PDF (in case it wasn't saved via /session/load-pdf)
    session_store.save_pdf(req.lawCode, pdf_bytes, req.fileName or "unknown.pdf", page_count)

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
        "approvedBy":     reviewer,
    }
    try:
        result = db.upsert_article(req.lawCode, article_dict)
    except Exception as e:
        raise HTTPException(500, str(e))

    for a in session["articles"]:
        if a["articleNumber"] == req.articleNumber:
            a.update({"status": "approved", "quality": "clean",
                      "reviewer": reviewer, "approver": reviewer, "approvedAt": now_iso})
            break

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
    updates = {
        "status": "rejected",
        "rejectionReason":    req.reason,
        "rejectionCategory":  req.rejectionCategory,
        "reviewer":           reviewer,
        "rejectedAt":         now_iso,
    }
    for a in session["articles"]:
        if a["articleNumber"] == req.articleNumber:
            a.update(updates)
            break

    session_store.update_article(req.lawCode, req.articleNumber, updates)
    return {"success": True}


# ── Push to Neon DB ───────────────────────────────────────────────────────────

@app.post("/db/import-batch")
def import_batch(req: ImportBatchRequest):
    approved = [a for a in req.articles if a.get("status") == "approved"]
    if not approved:
        return {"imported": 0, "failed": [], "message": "No approved articles to import"}
    # Attach approver to each article before upserting
    for a in approved:
        a["approvedBy"] = req.reviewerName
    try:
        result = db.import_batch(req.lawCode, approved)
        session_store.log_push(
            req.lawCode, req.reviewerName,
            result.get("imported", 0), len(result.get("failed", [])),
        )
        return result
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/session/mark-pushed")
def mark_pushed(req: MarkPushedRequest):
    session_store.mark_pushed_batch(req.lawCode, req.articleNumbers)
    # Also update in-memory session
    pushed_set = set(req.articleNumbers)
    for a in session["articles"]:
        if a.get("articleNumber") in pushed_set:
            a["status"] = "pushed"
    return {"marked": len(req.articleNumbers)}


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
