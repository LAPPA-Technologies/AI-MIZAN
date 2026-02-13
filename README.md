# AI-MIZAN
The structured Moroccan legal engine
=======
# AI-Mizan ⚖️
**Moroccan Law — AI Legal Assistant with Citations**

AI-Mizan is a legal-focused assistant designed to answer questions about **Moroccan law** (multiple codes and official sources).  
It retrieves relevant legal articles, provides **grounded answers with citations**, and supports **Darija, French, and Arabic**.

> Goal: Make Moroccan law easier to understand while staying strict, transparent, and source-based.

## ✨ Features

- ✅ **Legal-only responses** (rejects non-legal questions)
- 📚 **Citations to articles** (answer always references sources)
- 🔎 **Retrieval-Augmented Generation (RAG)** over official legal text
- 🌍 **Multilingual**: Darija / Français / العربية
- 🧩 **PDF → structured articles** (Articles converted to JSON)
- 🗂️ Article search by keywords + semantic similarity
- 🧾 Clear “source-first” UI: show article numbers + quoted excerpt (short) + link/page reference (if available)

---

## 🧱 Tech Stack (this repo)

- **Frontend / App**: Next.js (App Router) + TypeScript
- **Backend / API**: Next.js server routes (app/api)
- **Database**: PostgreSQL via Prisma ORM (seed + migrations included)
- **Embeddings**: local hashing fallback; optional OpenAI or DeepSeek embedding providers
- **LLM / Completions**: DeepSeek chat completions (wrapper in `lib/deepseek.ts`) with local fallbacks
- **Search**: in-process vector search over `LawEmbedding` rows + keyword fallback
- **Styling**: Tailwind CSS (present in devDependencies)

Key files:
- `app/api/chat/route.ts` — main chat handler (RAG, gating, fallbacks)
- `lib/embeddings.ts` — local / OpenAI / DeepSeek embedding logic
- `lib/deepseek.ts` — DeepSeek API wrapper
- `lib/search.ts` — retrieval and similarity scoring
- `prisma/seed.ts` — seeds articles and embeddings
- `data/laws/` — law JSON seed files

---

## 📂 Project Structure (actual)
```bash
AI-Mizan/
├─ app/
│  └─ api/chat/route.ts
├─ data/
│  └─ laws/ (seed JSON files)
├─ lib/
│  ├─ embeddings.ts
│  ├─ deepseek.ts
│  ├─ search.ts
│  ├─ searchGate.ts
│  └─ prisma.ts
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
├─ styles.css
├─ package.json
└─ README.md
```
## 🚀 Quickstart (how to run this repository)

### 1) Clone (Using Git shell cmd window)

```bash
git clone <repo-url>
cd AI-Mizan
```

### 2) Install dependencies (Open a CMD window in the AI Mizan project folder)

```bash
npm install
# or pnpm install
```

### 3) Configure environment

Copy and edit `.env` (create from `.env.example` if present):

```bash
cp .env.example .env
```

Required / useful env vars are listed below.

### 4) Run migrations, seed, and start dev server : 
1- Prisma / seed (if you have Postgres):
```bash
npm run prisma:generate
npm run prisma:migrate 
npm run db:seed
```

2- Start dev server:
```bash
npm run dev
```

3- Open Chrome to the site: http://localhost:3000

## 🔧 Configuration (env)

Important environment variables used by this codebase:

- `DATABASE_URL` — Postgres connection string (required for Prisma).
- `DEEPSEEK_API_KEY` — DeepSeek API key (optional, used for chat completions and embeddings).
- `DEEPSEEK_BASE_URL` — DeepSeek base URL (optional).
- `DEEPSEEK_MODEL` — DeepSeek model id (optional).
- `OPENAI_API_KEY` — OpenAI API key (optional, used for embeddings if `EMBEDDINGS_MODE` allows).
- `EMBEDDINGS_MODE` — `auto|local|openai|deepseek` (default: `auto`).
- `MIN_RELEVANCE` — float threshold (default `0.78`) to mark citations as grounded.
- `RETRIEVE_TOP_K` — number of articles to retrieve for context (default `5`).
- `LOCAL_EMBEDDINGS_DIM` — integer dimension for local hashing embeddings (default 256).

Notes:
- In `auto` mode the app tries OpenAI → DeepSeek → local embedding providers.
- The seed script (`prisma/seed.ts`) will create local embeddings if remote keys are missing.

## 🧠 How it works (RAG pipeline in this repo)

1. Ingestion: law JSON files in `data/laws/` are read by `prisma/seed.ts`.
2. Seeding: articles are upserted into the `LawArticle` table and embeddings into `LawEmbedding`.
3. Embeddings: `lib/embeddings.ts` supports local hashing embeddings plus optional OpenAI/DeepSeek providers.
4. Retrieval: `lib/search.ts` computes cosine similarity against stored embeddings and returns top K results; `keywordFallback` covers missing embeddings.
5. Routing: `lib/searchGate.ts` decides whether a message should trigger a legal DB search or be treated as small talk.
6. Answering: `app/api/chat/route.ts` composes the LLM prompt (DeepSeek) using retrieved articles, or falls back to an extractive/local reply when needed.
7. Grounding: citations are marked `grounded` only when the top similarity score ≥ `MIN_RELEVANCE` or when keyword fallback matched.

## 🛡️ Guardrails (Legal-only)

AI-Mizan must not answer:

- general knowledge (e.g., “distance between Mars and Earth”)
- medical advice, hacking, politics, etc.

Instead it replies with a short refusal and a redirect, for example:

> “I can only answer questions about Moroccan family law. Ask me about marriage, divorce, custody, inheritance…”

### 📌 Example Query

User:

`"شنو الشروط ديال الزواج فمدونة الأسرة؟"`

AI-Mizan:

- Provides a structured answer
- Includes citations (Article X, Article Y)
- Optionally adds short excerpts (≤ 1–2 sentences)

## ✅ Roadmap

- Improve PDF parsing robustness (headers, footnotes, OCR fallback)
- Add bilingual citations display (FR/AR)
- Add “Article explorer” UI (browse by book/chapter/article)
- Add evaluation set (50–200 legal Q/A with expected sources)
- Add rate limiting + abuse protection
- Add admin tool to upload new legal texts

## ⚠️ Disclaimer

AI-Mizan provides informational content based on legal texts and does not replace a lawyer.
Always verify with official sources or a qualified legal professional for critical decisions.

## 🤝 Contributing

Contributions are welcome:

Fork the repo

Create a feature branch: git checkout -b feature/my-feature

Commit: git commit -m "Add my feature"

Push: git push origin feature/my-feature

Open a Pull Request

>>>>>>> 979f61b (Initial commit - AI-Mizan setup)
