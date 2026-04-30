# AI-Mizan Law Extractor

Local web tool for extracting Arabic law articles from PDFs and reviewing them before importing to the Neon DB.

## Setup

```bash
cd tools/law-extractor
pip install -r requirements.txt
cp .env.example .env
# Fill in DATABASE_URL and ANTHROPIC_API_KEY in .env
```

## Run

```bash
uvicorn main:app --reload
```

Open: http://localhost:8000

## Workflow

1. Select the law code from the dropdown (top right)
2. Click **Upload PDF** to load a law PDF
3. Click **Extract from PDF** — Claude cleans the text and detects article boundaries
4. Review each article in the editor panel; compare with the DB version
5. Edit text if needed, then **Approve** (writes to DB) or **Reject** (flags locally)
6. Click **Import Approved** to batch-write all approved articles
7. Use **Export JSON** to save a local copy

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Approve current article |
| `Ctrl+→` | Next unreviewed article |
| `Ctrl+↓` | Next issue (⚠️ or ❌) |

## Notes

- The tool only handles Arabic (`language = 'ar'`).
- Rejecting an article does **not** delete the DB version — it only flags the session copy.
- Approving writes/updates the article in `law_articles` with `source = 'extractor'`.
- No authentication — local use only.
