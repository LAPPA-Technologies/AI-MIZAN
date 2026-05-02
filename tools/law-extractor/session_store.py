"""
session_store.py — SQLite-backed session persistence for the Law Extractor.
Uses Python's built-in sqlite3, no extra dependencies.

Sessions are keyed by law_code. Each row stores the full article list as
a JSON blob. Individual articles can be patched via update_article().
"""
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "sessions.db"

# Fields persisted per article.
_ARTICLE_FIELDS = [
    "articleNumber", "text",
    "book", "part", "title", "chapter", "section",
    "startPage", "quality", "status", "sourceDocument",
    "reviewer", "approver",
    "approvedAt", "rejectedAt", "rejectionReason", "rejectionCategory",
]


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            law_code   TEXT PRIMARY KEY,
            data       TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


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
    """Delete the saved session for law_code."""
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE law_code = ?", (law_code,))


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


def log_push(law_code: str, reviewer: str, imported: int, failed: int) -> None:
    """Append a push-to-DB log entry to the session metadata."""
    conn = _connect()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS push_log (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                law_code    TEXT NOT NULL,
                reviewer    TEXT NOT NULL,
                imported    INTEGER NOT NULL,
                failed      INTEGER NOT NULL,
                pushed_at   TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.execute(
            "INSERT INTO push_log (law_code, reviewer, imported, failed, pushed_at) VALUES (?,?,?,?,?)",
            (law_code, reviewer, imported, failed, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
    finally:
        conn.close()
