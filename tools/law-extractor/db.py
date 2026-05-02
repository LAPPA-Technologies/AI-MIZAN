import os
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL not set in .env")
    return psycopg2.connect(url)


def get_articles(law_code: str) -> list[dict]:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, code, article_number, text, chapter, book, part,
                       title, section, source, version, language,
                       updated_at, created_at
                FROM law_articles
                WHERE code = %s AND language = 'ar'
                ORDER BY
                    CASE WHEN article_number ~ '^[0-9]+$'
                         THEN CAST(article_number AS INTEGER)
                         ELSE 9999999
                    END,
                    article_number
                """,
                (law_code,),
            )
            return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_article(law_code: str, article_number: str) -> dict | None:
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, code, article_number, text, chapter, book, part,
                       title, section, source, version, language,
                       updated_at, created_at
                FROM law_articles
                WHERE code = %s AND article_number = %s AND language = 'ar'
                ORDER BY version DESC
                LIMIT 1
                """,
                (law_code, article_number),
            )
            row = cur.fetchone()
            return dict(row) if row else None
    finally:
        conn.close()


def upsert_article(law_code: str, article: dict) -> dict:
    """
    Insert or update an article. Uses ON CONFLICT to update if same
    (code, article_number, language, version) already exists.
    Returns the upserted row id.
    """
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO law_articles
                    (id, code, article_number, language, text,
                     book, part, title, chapter, section,
                     source, source_page, source_document, extraction_quality,
                     version, updated_at, created_at)
                VALUES
                    (gen_random_uuid()::text, %s, %s, 'ar', %s,
                     %s, %s, %s, %s, %s,
                     'extractor', %s, %s, %s,
                     1, NOW(), NOW())
                ON CONFLICT (code, article_number, language, version)
                DO UPDATE SET
                    text               = EXCLUDED.text,
                    book               = EXCLUDED.book,
                    part               = EXCLUDED.part,
                    title              = EXCLUDED.title,
                    chapter            = EXCLUDED.chapter,
                    section            = EXCLUDED.section,
                    source             = 'extractor',
                    source_page        = EXCLUDED.source_page,
                    source_document    = EXCLUDED.source_document,
                    extraction_quality = EXCLUDED.extraction_quality,
                    updated_at         = NOW()
                RETURNING id
                """,
                (
                    law_code,
                    article["articleNumber"],
                    article["text"],
                    article.get("book"),
                    article.get("part"),
                    article.get("title"),
                    article.get("chapter"),
                    article.get("section"),
                    article.get("startPage"),
                    article.get("sourceDocument"),
                    article.get("quality"),
                ),
            )
            conn.commit()
            row = cur.fetchone()
            return {"id": row["id"]}
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def import_batch(law_code: str, articles: list[dict]) -> dict:
    """Import a batch of approved articles. Returns counts."""
    imported = 0
    failed = []
    for article in articles:
        try:
            upsert_article(law_code, article)
            imported += 1
        except Exception as e:
            failed.append({"articleNumber": article.get("articleNumber"), "error": str(e)})
    return {"imported": imported, "failed": failed}
