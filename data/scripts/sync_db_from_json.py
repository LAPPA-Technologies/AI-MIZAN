#!/usr/bin/env python3
"""
sync_db_from_json.py — Reset/import law articles from data/laws JSON files.

Usage:
  python sync_db_from_json.py --reset         # TRUNCATE law tables (destructive)
  python sync_db_from_json.py --import       # Import all FR/AR JSONs under data/laws
  python sync_db_from_json.py --import --only=family,penal

Important:
  - Requires environment variable DATABASE_URL to be set to your Postgres DB.
  - This script uses psycopg2. Install with: pip install psycopg2-binary
  - The script is opinionated; review before running against production DB.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List

try:
    import psycopg2
    from psycopg2.extras import execute_values
except Exception:
    psycopg2 = None


DATA_LAWS_DIR = Path(__file__).resolve().parent.parent / "laws"


def get_db_conn():
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("Error: DATABASE_URL environment variable is not set.")
        sys.exit(1)
    if psycopg2 is None:
        print("Error: psycopg2 not installed. Install with: pip install psycopg2-binary")
        sys.exit(1)
    return psycopg2.connect(dsn=url)


def reset_db(conn):
    """Destructively truncate related tables.
    Use with caution. This truncates law_embeddings and law_articles (cascades may apply).
    """
    cur = conn.cursor()
    print("Truncating law_embeddings, chat_citations, law_articles (CASCADE)...")
    cur.execute("TRUNCATE TABLE law_embeddings CASCADE;")
    cur.execute("TRUNCATE TABLE law_articles RESTART IDENTITY CASCADE;")
    conn.commit()
    cur.close()
    print("Reset complete.")


def import_jsons(conn, only_codes: List[str] | None = None):
    """Import FR/AR JSON files under data/laws into the `law_articles` table.

    This inserts rows for each article. Existing rows are NOT deduplicated by this
    script — use --reset first if you want a clean import.
    """
    # Gather files
    files = []
    for code_dir in DATA_LAWS_DIR.iterdir():
        if not code_dir.is_dir():
            continue
        code = code_dir.name
        if only_codes and code not in only_codes:
            continue
        for lang in ("ar", "fr"):
            pat = code_dir / lang / f"{code}_{lang}.json"
            if pat.exists():
                files.append(pat)

    if not files:
        print(f"No FR/AR JSON files found under {DATA_LAWS_DIR}")
        return

    cur = conn.cursor()

    insert_sql = """
    INSERT INTO law_articles
      (id, code, book, book_order, title, chapter, section, article_number, language, text, source, effective_date, version)
    VALUES %s
    ON CONFLICT (code, article_number, language, version) DO NOTHING
    """

    for fpath in files:
        print(f"Importing: {fpath}")
        with open(fpath, "r", encoding="utf-8") as fh:
            doc = json.load(fh)
        code = doc.get("code")
        language = doc.get("language")
        source = doc.get("source")
        eff = doc.get("effective_date")
        try:
            eff_date = datetime.fromisoformat(eff).date() if eff else None
        except Exception:
            eff_date = None

        version_raw = doc.get("version", "1.0")
        try:
            version = int(float(version_raw))
        except Exception:
            version = 1

        values = []
        for art in doc.get("articles", []):
            a_num = str(art.get("article_number"))
            text = art.get("content", "")[:100000]  # cap size
            hier = art.get("hierarchy", {}) or {}
            book = hier.get("book")
            title = hier.get("title")
            chapter = hier.get("chapter")
            section = hier.get("section")
            # id left to DB default if omitted; but schema requires id - use gen_random_uuid? skip id
            # We'll insert NULL for id so DB default applies by omitting the column. But execute_values requires fixed columns.
            # For simplicity, generate a cuid-like placeholder using code+article+lang+version
            uid = f"{code}-{a_num}-{language}-{version}"[:63]
            values.append((uid, code, book, None, title, chapter, section, a_num, language, text, source, eff_date, version))

        if values:
            execute_values(cur, insert_sql, values)
            conn.commit()

    cur.close()
    print("Import finished.")


def main():
    parser = argparse.ArgumentParser(description="Reset/import law articles from JSON into Postgres DB")
    parser.add_argument("--reset", action="store_true", help="Truncate law tables (destructive)")
    parser.add_argument("--import", dest="do_import", action="store_true", help="Import FR/AR JSONs under data/laws")
    parser.add_argument("--only", help="Comma-separated list of law codes to import (e.g. family,penal)")
    parser.add_argument("--yes", action="store_true", help="Confirm destructive actions without interactive prompt")
    args = parser.parse_args()

    conn = get_db_conn()

    try:
        if args.reset:
            if not args.yes:
                confirm = input("This will TRUNCATE law tables. Type YES to continue: ")
                if confirm != "YES":
                    print("Aborted.")
                    return
            reset_db(conn)

        if args.do_import:
            only = args.only.split(",") if args.only else None
            import_jsons(conn, only_codes=only)

    finally:
        conn.close()


if __name__ == "__main__":
    main()
