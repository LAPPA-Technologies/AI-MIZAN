#!/usr/bin/env python3
"""Clean old law codes from the database and show current state."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

def load_database_url():
    env_file = ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key == "DATABASE_URL":
                return val
    return None

def main():
    import psycopg2

    db_url = load_database_url()
    if not db_url:
        print("DATABASE_URL not found in .env")
        sys.exit(1)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Show current state
    cur.execute("SELECT code, language, COUNT(*) FROM law_articles GROUP BY code, language ORDER BY code, language")
    print("Current DB contents:")
    for row in cur.fetchall():
        print(f"  {row[0]}/{row[1]}: {row[2]} articles")

    # Delete old codes that don't match the new naming convention
    old_codes = ["obligations", "penal", "family", "civil", "commerce", "criminal", "labor", "urbanism"]
    deleted_total = 0
    for oc in old_codes:
        cur.execute("DELETE FROM law_articles WHERE code = %s", (oc,))
        if cur.rowcount > 0:
            print(f"  Deleted {cur.rowcount} rows for old code: {oc}")
            deleted_total += cur.rowcount

    conn.commit()

    if deleted_total:
        print(f"\nTotal deleted: {deleted_total} rows")
    else:
        print("\nNo old codes found to delete.")

    # Show updated state
    cur.execute("SELECT code, language, COUNT(*) FROM law_articles GROUP BY code, language ORDER BY code, language")
    print("\nUpdated DB contents:")
    for row in cur.fetchall():
        print(f"  {row[0]}/{row[1]}: {row[2]} articles")

    cur.close()
    conn.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
