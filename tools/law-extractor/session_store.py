"""
session_store.py — SQLite-backed session persistence for the Law Extractor.
Uses Python's built-in sqlite3, no extra dependencies.

Two tables:
  sessions  — article lists keyed by law_code (JSON blob)
  pdf_store — raw PDF bytes keyed by law_code (BLOB + metadata)
  push_log  — history of every "Push to Neon DB" action
"""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "sessions.db"

_ARTICLE_FIELDS = [
    "articleNumber", "text",
    "book", "part", "title", "chapter", "section",
    "startPage", "quality", "status", "sourceDocument",
    "reviewer", "approver",
    "approvedAt", "rejectedAt", "rejectionReason", "rejectionCategory",
]


# ── Schema bootstrap ──────────────────────────────────────────────────────────

def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS sessions (
            law_code   TEXT PRIMARY KEY,
            data       TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS pdf_store (
            law_code   TEXT PRIMARY KEY,
            pdf_bytes  BLOB NOT NULL,
            file_name  TEXT NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS push_log (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            law_code   TEXT NOT NULL,
            reviewer   TEXT NOT NULL,
            imported   INTEGER NOT NULL,
            failed     INTEGER NOT NULL,
            pushed_at  TEXT NOT NULL
        );
    """)
    conn.commit()
    return conn


# ── Articles ──────────────────────────────────────────────────────────────────

def save_session(law_code: str, articles: list[dict]) -> None:
    """Persist the full article list for law_code, replacing any prior session."""
    clean = [{k: a.get(k) for k in _ARTICLE_FIELDS} for a in articles]
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO sessions (law_code, data, updated_at) VALUES (?, ?, ?)",
            (law_code, json.dumps(clean, ensure_ascii=False), now),
        )


def load_session(law_code: str) -> list[dict] | None:
    """Return saved articles for law_code, or None if no session exists."""
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT data FROM sessions WHERE law_code = ?", (law_code,)
        ).fetchone()
        if row is None:
            return None
        articles = json.loads(row["data"])
        for a in articles:
            a.setdefault("quality", "pending")
            a.setdefault("status", "pending")
        return articles
    finally:
        conn.close()


def clear_session(law_code: str) -> None:
    """Delete the saved articles + PDF for law_code (used before fresh extraction)."""
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE law_code = ?", (law_code,))
        conn.execute("DELETE FROM pdf_store WHERE law_code = ?", (law_code,))


def delete_session(law_code: str) -> None:
    """Fully delete a session (articles + PDF). Same as clear_session, exposed separately."""
    clear_session(law_code)


def update_article(law_code: str, article_number: str, updates: dict) -> None:
    """Patch one article's fields in the persisted session."""
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT data FROM sessions WHERE law_code = ?", (law_code,)
        ).fetchone()
        if row is None:
            return
        articles = json.loads(row["data"])
        for a in articles:
            if a.get("articleNumber") == article_number:
                a.update(updates)
                break
        now = datetime.now(timezone.utc).isoformat()
        conn.execute(
            "UPDATE sessions SET data = ?, updated_at = ? WHERE law_code = ?",
            (json.dumps(articles, ensure_ascii=False), now, law_code),
        )
        conn.commit()
    finally:
        conn.close()


# ── PDF storage ───────────────────────────────────────────────────────────────

def save_pdf(law_code: str, pdf_bytes: bytes, file_name: str, page_count: int) -> None:
    """Store raw PDF bytes so the session can be fully restored on next launch."""
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO pdf_store
               (law_code, pdf_bytes, file_name, page_count, updated_at)
               VALUES (?, ?, ?, ?, ?)""",
            (law_code, pdf_bytes, file_name, page_count, now),
        )


def load_pdf(law_code: str) -> dict | None:
    """Return {pdf_bytes, file_name, page_count} or None."""
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT pdf_bytes, file_name, page_count FROM pdf_store WHERE law_code = ?",
            (law_code,)
        ).fetchone()
        if row is None:
            return None
        return {
            "pdf_bytes":  bytes(row["pdf_bytes"]),
            "file_name":  row["file_name"],
            "page_count": row["page_count"],
        }
    finally:
        conn.close()


# ── Session list ──────────────────────────────────────────────────────────────

def list_sessions() -> list[dict]:
    """Return summary metadata for all saved sessions, most-recently-updated first."""
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT law_code, data, updated_at FROM sessions ORDER BY updated_at DESC"
        ).fetchall()
        result = []
        for row in rows:
            articles = json.loads(row["data"])
            total    = len(articles)
            approved = sum(1 for a in articles if a.get("status") == "approved")
            rejected = sum(1 for a in articles if a.get("status") == "rejected")
            pdf_row  = conn.execute(
                "SELECT file_name, page_count FROM pdf_store WHERE law_code = ?",
                (row["law_code"],)
            ).fetchone()
            result.append({
                "law_code":   row["law_code"],
                "file_name":  pdf_row["file_name"]  if pdf_row else None,
                "page_count": pdf_row["page_count"] if pdf_row else 0,
                "total":      total,
                "approved":   approved,
                "rejected":   rejected,
                "pending":    total - approved - rejected,
                "updated_at": row["updated_at"],
            })
        return result
    finally:
        conn.close()


# ── Push log ──────────────────────────────────────────────────────────────────

def log_push(law_code: str, reviewer: str, imported: int, failed: int) -> None:
    """Record a push-to-Neon-DB action."""
    with _connect() as conn:
        conn.execute(
            "INSERT INTO push_log (law_code, reviewer, imported, failed, pushed_at) VALUES (?,?,?,?,?)",
            (law_code, reviewer, imported, failed, datetime.now(timezone.utc).isoformat()),
        )
