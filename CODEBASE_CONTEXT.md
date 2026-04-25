# AI-Mizan — Complete Codebase Context

> **Purpose of this document:** Full technical context for an AI model to understand the AI-Mizan project — its architecture, every file, the data layer, deployment target, and current state.

---

## 1. Project Overview

**AI-Mizan** is a trilingual AI-powered Moroccan legal information assistant.  
It lets users search and ask questions about official Moroccan law codes in Arabic, French, and English.  
The AI answers strictly from cited articles stored in the database — it does **not** provide legal advice, only legal information.

| Property | Value |
|----------|-------|
| App type | Next.js 16 (App Router) |
| Database | PostgreSQL via Supabase + Prisma 5 |
| Primary AI | DeepSeek (`deepseek-chat`, streaming) |
| Embeddings | Local hash (free/default) or DeepSeek or OpenAI |
| Locales | `ar` (default, RTL), `fr`, `en` |
| Deployment target | Vercel (serverless Node.js runtime) |

---

## 2. Current Directory Structure (production-clean state)

```
AI-Mizan/
├── app/
│   ├── layout.tsx                  # Root layout: locale detection, fonts, Header
│   ├── page.tsx                    # Home page (hero, search bar, stats, recent updates)
│   ├── globals.css                 # Tailwind base styles
│   ├── not-found.tsx               # 404 page
│   ├── about/page.tsx              # About page
│   ├── admin/page.tsx              # Admin dashboard (protected)
│   ├── chat/
│   │   ├── layout.tsx              # Chat layout: auth gate + public mode check
│   │   └── page.tsx                # Full chat UI (streaming, multi-turn, citations)
│   ├── guides/page.tsx             # Legal guides page
│   ├── laws/
│   │   ├── page.tsx                # Law codes index (all codes with article counts)
│   │   ├── loading.tsx             # Suspense skeleton
│   │   ├── search/page.tsx         # Cross-code search page (text + article number)
│   │   └── [code]/                 # Individual law code browser
│   ├── services/
│   │   ├── page.tsx
│   │   ├── courts/                 # Court locator
│   │   └── documents/             # Document generator
│   ├── simulators/page.tsx         # Legal simulators (divorce, labor, etc.)
│   ├── updates/
│   │   ├── page.tsx                # Recent law updates
│   │   └── loading.tsx
│   └── api/
│       ├── chat/route.ts           # POST: AI chat endpoint (main)
│       ├── articles/route.ts       # GET: article lookup by code+number
│       ├── translate/route.ts      # POST: translation via MyMemory API
│       └── admin/
│           ├── login/route.ts      # POST: admin login
│           └── logout/route.ts     # POST: admin logout
├── components/
│   ├── Header.tsx                  # Site header + language switcher
│   ├── Footer.tsx                  # Site footer
│   ├── Container.tsx               # Page wrapper with max-width
│   ├── DisclaimerBanner.tsx        # Legal disclaimer banner
│   ├── MobileNav.tsx               # Mobile navigation drawer
│   ├── LanguageDropdown.tsx        # Language selector dropdown
│   ├── ChatAccessGate.tsx          # Chat auth gate component
│   ├── TranslateButton.tsx         # In-page translation button
│   └── forms/
│       ├── FormBuilder.tsx         # Dynamic form renderer
│       ├── DocumentPreview.tsx     # PDF preview component
│       └── PDFGenerator.ts         # jsPDF document generator
├── lib/
│   ├── adminAuth.ts                # HMAC admin auth (server + client helpers)
│   ├── crossLangSearch.ts          # EN→AR/FR keyword expansion for search
│   ├── deepseek.ts                 # DeepSeek API client (streaming + non-streaming)
│   ├── embeddings.ts               # Embedding creation (local/deepseek/openai)
│   ├── fastRouter.ts               # Regex-based request classifier (free, no LLM)
│   ├── i18n.ts                     # Server-side locale detection + dictionary loader
│   ├── i18nClient.ts               # Client-side dictionary helpers
│   ├── i18nData.ts                 # All translation strings (ar/fr/en)
│   ├── language.ts                 # Language detection from text content
│   ├── lawMetadata.ts              # Static metadata for all 8 law codes
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rateLimit.ts                # DB-backed rate limiting (5 req/min per IP)
│   ├── search.ts                   # Vector search + keyword fallback
│   ├── validators.ts               # Zod schemas for API inputs
│   └── forms/                      # Form definitions for document generator
├── prisma/
│   ├── schema.prisma               # DB schema (5 models)
│   ├── seed.ts                     # DB seeder: reads JSON → upserts to DB
│   └── migrations/                 # Prisma migration history
├── data/
│   └── laws/                       # Law JSON files (canonical, language-suffixed)
│       ├── civil_procedure/
│       │   ├── ar/civil_procedure_ar.json     (470 articles)
│       │   └── fr/civil_procedure_fr.json     (492 articles)
│       ├── commerce_code/
│       │   ├── ar/commerce_code_ar.json       (794 articles)
│       │   └── fr/commerce_code_fr.json       (798 articles)
│       ├── criminal_procedure/
│       │   └── ar/criminal_procedure_ar.json  (757 articles) ← no FR version
│       ├── family_code/
│       │   └── ar/family_code_ar.json         (400 articles) ← no FR version (PDF not extracted)
│       ├── labor_code/
│       │   ├── ar/labor_code_ar.json          (297 articles)
│       │   └── fr/labor_code_fr.json          (589 articles)
│       ├── obligations_contracts/
│       │   ├── ar/obligations_contracts_ar.json  (1239 articles)
│       │   └── fr/obligations_contracts_fr.json  (1240 articles)
│       ├── penal_code/
│       │   ├── ar/penal_code_ar.json          (757 articles)
│       │   └── fr/penal_code_fr.json          (611 articles)
│       └── urbanism_code/
│           ├── ar/urbanism_code_ar.json       (93 articles)
│           └── fr/urbanism_code_fr.json       (93 articles)
├── public/                         # Static assets
├── types/html2pdf.d.ts             # Type declaration for html2pdf.js
├── .env                            # Real secrets (gitignored)
├── .env.example                    # All required env vars documented
├── .gitignore
├── next.config.mjs
├── package.json
├── prisma/schema.prisma
├── tailwind.config.ts
├── tsconfig.json
├── DEPLOYMENT.md                   # Full deployment guide
└── ARCHITECTURE.md                 # High-level architecture doc
```

**Data coverage summary:**

| Law Code | Arabic | French | Total articles |
|----------|--------|--------|----------------|
| `family_code` | ✅ 400 | ❌ missing | 400 |
| `penal_code` | ✅ 757 | ✅ 611 | 1,368 |
| `obligations_contracts` | ✅ 1,239 | ✅ 1,240 | 2,479 |
| `civil_procedure` | ✅ 470 | ✅ 492 | 962 |
| `criminal_procedure` | ✅ 757 | ❌ missing | 757 |
| `commerce_code` | ✅ 794 | ✅ 798 | 1,592 |
| `labor_code` | ✅ 297 | ✅ 589 | 886 |
| `urbanism_code` | ✅ 93 | ✅ 93 | 186 |

English UI is supported but articles only exist in AR/FR — `en` locale maps to `fr` for article content.

---

## 3. Tech Stack & Dependencies

```json
{
  "next": "^16.1.6",
  "react": "^18.2.0",
  "@prisma/client": "^5.18.0",
  "prisma": "^5.18.0",
  "zod": "^3.23.8",
  "react-hook-form": "^7.71.2",
  "@hookform/resolvers": "^5.2.2",
  "jspdf": "^4.2.0",
  "jspdf-autotable": "^5.0.7",
  "html2pdf.js": "^0.10.1",
  "tailwindcss": "^3.4.7",
  "tsx": "^4.15.6",
  "typescript": "^5.5.4"
}
```

**Build:**
- `next build --webpack` (webpack bundler, not Turbopack)
- `postinstall` runs `prisma generate` automatically
- `typescript.ignoreBuildErrors: true` in `next.config.mjs`
- `experimental.serverActions.bodySizeLimit: "2mb"`

---

## 4. Environment Variables

All API routes use `runtime = "nodejs"` (not edge).

```bash
# Database (Supabase)
DATABASE_URL="postgresql://...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# DeepSeek AI (primary)
DEEPSEEK_API_KEY="sk-..."
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_EMBEDDING_MODEL="deepseek-embedding"

# OpenAI (optional, fallback)
OPENAI_API_KEY=""

# Embeddings
# Options: "auto" | "local" | "deepseek" | "openai"
# auto = tries deepseek first, falls back to local hash
EMBEDDINGS_MODE="auto"
LOCAL_EMBEDDINGS_DIM="256"

# Search tuning
RETRIEVE_TOP_K="8"
MIN_RELEVANCE="0.0"

# Translation (MyMemory free API)
MYMEMORY_EMAIL=""

# Admin
ADMIN_SECRET="your-strong-secret-here"

# Chat access control
# true = anyone can chat | false = admin only (default)
NEXT_PUBLIC_CHAT_PUBLIC="false"
```

**Important Supabase URL note:**
- `DATABASE_URL` uses port **6543** (PgBouncer pooled — for runtime queries)
- `DIRECT_URL` uses port **5432** (direct — for Prisma migrations only)

---

## 5. Database Schema (`prisma/schema.prisma`)

```prisma
model LawArticle {
  id            String      @id @default(cuid())
  code          String                        // e.g. "family_code"
  book          String?
  bookOrder     Int?        @map("book_order")
  part          String?
  title         String?
  chapter       String?
  section       String?
  articleNumber String      @map("article_number")  // e.g. "1", "115 bis"
  language      String                        // "ar" | "fr"
  text          String
  source        String                        // e.g. "Bulletin Officiel n° 5184"
  effectiveDate DateTime?   @map("effective_date")
  version       Int
  updatedAt     DateTime    @updatedAt @map("updated_at")
  createdAt     DateTime    @default(now()) @map("created_at")

  embedding     LawEmbedding?
  citations     ChatCitation[]

  @@unique([code, articleNumber, language, version])
  @@index([code])
  @@index([code, chapter])
  @@index([code, articleNumber])
  @@map("law_articles")
}

model LawEmbedding {
  id         String     @id @default(cuid())
  articleId  String     @unique @map("article_id")
  embedding  Float[]                          // 256-dim by default (local hash)
  createdAt  DateTime   @default(now()) @map("created_at")

  article    LawArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)
  @@map("law_embeddings")
}

model ChatQuery {
  id        String         @id @default(cuid())
  question  String
  answer    String
  grounded  Boolean        @default(false)   // true if DB articles were cited
  ip        String?
  userAgent String?        @map("user_agent")
  createdAt DateTime       @default(now()) @map("created_at")

  citations ChatCitation[]
  @@map("chat_queries")
}

model ChatCitation {
  id            String     @id @default(cuid())
  chatQueryId   String     @map("chat_query_id")
  articleId     String     @map("article_id")
  code          String
  articleNumber String     @map("article_number")
  createdAt     DateTime   @default(now()) @map("created_at")
  @@map("chat_citations")
}

model RateLimit {
  id          String   @id @default(cuid())
  ip          String
  windowStart DateTime @map("window_start")
  count       Int      @default(0)
  @@unique([ip, windowStart], name: "ip_windowStart")
  @@map("rate_limits")
}
```

---

## 6. Key Library Files

### `lib/fastRouter.ts` — Regex classifier (zero API cost)

Runs before any API call. Returns `"UNSAFE" | "SMALLTALK" | "NON_LEGAL" | null`.  
`null` means proceed to retrieval + LLM. Never blocks if legal keywords are detected.

```ts
export type FastRouteResult = "SMALLTALK" | "UNSAFE" | "NON_LEGAL" | null;
export const fastRoute = (question: string): FastRouteResult => { ... }
```

Has extensive LEGAL_HINT_REGEX that always passes through any Moroccan law topic.

### `lib/search.ts` — Retrieval

Three exports used by the chat pipeline:

```ts
// 1. Rule-based topic expansion (no API)
export const getTopicKeywords = (question: string): string[] => { ... }

// 2. Cosine similarity vector search against all stored embeddings
export const retrieveRelevantArticles = async (
  embedding: number[],
  limit = 8
): Promise<RetrievedArticle[]> => { ... }

// 3. Full-text keyword fallback (when vector search returns nothing)
export const keywordFallback = async (
  queries: string[],
  limit = 8
): Promise<RetrievedArticle[]> => { ... }
```

Vector search loads all embeddings from DB and computes cosine similarity in-process (fast enough for ~8k articles at 256 dims).

### `lib/embeddings.ts` — Embedding creation

```ts
export const createEmbedding = async (text: string): Promise<number[]> => {
  // EMBEDDINGS_MODE env controls strategy:
  // "local"    → deterministic hash-based (free, no API key)
  // "deepseek" → DeepSeek embedding API
  // "openai"   → OpenAI text-embedding-3-small
  // "auto"     → try DeepSeek first, fall back to local hash
}
```

All embeddings are L2-normalized before storage. Default dimension: 256.

### `lib/deepseek.ts` — DeepSeek API client

```ts
// Non-streaming (used for admin/analysis)
export const generateDeepSeekResponse = async (
  messages: DeepSeekMessage[],
  modelOverride?: string
): Promise<string> => { ... }

// Streaming generator — yields text chunks as SSE (used by chat)
export async function* streamDeepSeek(
  messages: DeepSeekMessage[],
  modelOverride?: string,
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> { ... }
```

Config: `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL` (default `https://api.deepseek.com`), `DEEPSEEK_MODEL` (default `deepseek-chat`). Temperature: `0.1`, max_tokens: `1200`.

### `lib/adminAuth.ts` — Admin authentication

HMAC-SHA256 stateless tokens — safe on Vercel serverless (no in-memory state).

```ts
// Server-side: verifies httpOnly cookie via HMAC comparison
export async function isAdminAuthenticated(): Promise<boolean>

// Client-side: checks non-httpOnly flag cookie
export function isAdminClient(): boolean

// Client-side: clears flag cookie (httpOnly token cleared via /api/admin/logout)
export function clearAdminToken(): void
```

Session token = `HMAC-SHA256(ADMIN_SECRET, "ai-mizan-admin-session-v1")`. Verified with `crypto.timingSafeEqual`.

### `lib/rateLimit.ts` — Rate limiting

DB-backed: 5 requests per 60-second window per IP. Uses Prisma upsert with `@@unique([ip, windowStart])`.

### `lib/language.ts` — Language detection

```ts
export type SupportedLanguage = "fr" | "en" | "ar" | "darija";
export const detectLanguage = (text: string): SupportedLanguage
export const isRtlLanguage = (language: SupportedLanguage): boolean
```

Detection order: Arabic Unicode script → Darija keywords → English keywords → French keywords → default `fr`.

### `lib/validators.ts` — Zod input validation

```ts
export const chatRequestSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  context:  z.string().max(2000).optional(),
  history:  z.array(historyMessageSchema).max(20).optional(),
  language: z.enum(["en", "fr", "ar", "darija"]).optional(),
});
```

### `lib/crossLangSearch.ts` — EN→AR/FR expansion

Maps ~50 common English legal terms to Arabic and French equivalents for the search page (not used in chat pipeline).

### `lib/i18n.ts` + `lib/i18nData.ts` — Internationalisation

- Server-side: `getLocale()` reads `locale` cookie → `accept-language` header → default `ar`
- `getDictionary(locale)` returns typed translation object
- Locales: `"ar" | "fr" | "en"`

### `lib/lawMetadata.ts` — Static law metadata

Provides `getLawName()`, `getLawShortName()`, `getLawMetadata()` for all 8 codes.  
Data includes official name (ar/fr/en), effective date, source bulletin, version.

---

## 7. API Routes

### `POST /api/chat`

**The main AI pipeline.** Max 2 external API calls total.

**Request body** (`chatRequestSchema`):
```json
{
  "question": "...",
  "language": "ar|fr|en|darija",
  "history": [{ "role": "user|assistant", "content": "..." }],
  "context": "optional extra context"
}
```

**Pipeline:**
```
1. FastRouter (regex, free)
   → UNSAFE/SMALLTALK/NON_LEGAL → instant JSON response (no API calls)
   → null → continue

2. createEmbedding(question) — 1 API call OR free local hash

3. retrieveRelevantArticles(embedding, TOP_K)  ← cosine similarity, DB only
   → if 0 results → keywordFallback([question, ...topicKeywords], TOP_K)

4. streamDeepSeek(messages) — 1 API call, SSE streaming to client
```

**Response (streaming SSE):**
```
data: {"type":"chunk","content":"..."}    ← streamed text chunks
data: {"type":"done","citations":[...],"grounded":true,"question_type":"LEGAL","language":"ar"}
```

**Response (instant JSON, non-streaming):**
```json
{
  "answer": "...",
  "citations": [],
  "grounded": false,
  "question_type": "UNSAFE|SMALLTALK|NON_LEGAL|CLARIFY",
  "language": "ar"
}
```

Rate limit: 5 req/min per IP.

### `GET /api/articles?code=family_code&articleNumber=115&lang=ar`

Returns a single article by code + number + language. Used by chat page to show article detail cards.

### `POST /api/translate`

Translates text using the MyMemory free API. Takes `{ text, from, to }`.

### `POST /api/admin/login`

Takes `{ token: string }` — the raw `ADMIN_SECRET`. Validates with `timingSafeEqual`, then sets two cookies:
- `admin_token` (httpOnly, secure) — HMAC session token for server verification
- `admin_logged_in=1` (non-httpOnly) — client-readable flag

### `POST /api/admin/logout`

Clears both cookies. No body required.

---

## 8. App Pages

### `app/page.tsx` — Home
Server component. Shows hero with search form, stats (total articles, number of codes), recent article updates from DB, and feature highlights.

### `app/chat/page.tsx` — Chat
**Large client component** (~800 lines). Features:
- Multi-turn conversation with full history sent to API
- Real-time SSE streaming rendering
- Conversation history (localStorage)
- Citation cards with article detail modal (fetches from `/api/articles`)
- Response parsing into sections (Summary, Legal Grounds, Rights & Obligations, Next Steps, Citations)
- Language auto-detection per message
- RTL/LTR direction toggle based on response language
- Admin logout button

### `app/chat/layout.tsx` — Chat auth gate
Checks `NEXT_PUBLIC_CHAT_PUBLIC` env var. If false, runs `isAdminAuthenticated()` server-side and redirects to admin page if not logged in.

### `app/laws/page.tsx` — Law codes index
Server component. Shows all 8 law codes as cards with article counts per language.

### `app/laws/search/page.tsx` — Global search
Server component. `?q=` text search or `?article=` number lookup across all codes. Supports `?lang=ar|fr`. Uses `crossLangSearch.ts` for English query expansion.

### `app/laws/[code]/` — Per-code browser
Server component. Browsable article list for a single law code with chapter filtering.

### `app/admin/page.tsx` — Admin dashboard
Protected by `isAdminAuthenticated()`. Shows login form if not authenticated. After login: shows DB stats, seed controls, system health.

### `app/simulators/page.tsx` — Legal simulators
Divorce cost estimator, labor termination calculator, etc. Client-side only, no DB.

---

## 9. Chat System Prompt Format

The AI is instructed to respond in **plain text only** (no Markdown, no asterisks) using this strict format:

```
Summary: [1-2 sentence direct answer]

Legal Grounds:
- [exact article number and what it says]
- ...

Rights & Obligations:
- ...

Next Steps:
1. ...
2. ...

Citations: CODE Art N; CODE Art N
```

Where `CODE` is one of: `family | penal | obligations | civil_procedure | labor_code | commerce_code | urbanism_code`

Every response ends with a legal disclaimer. Temperature is `0.1`.

---

## 10. Security Measures

| Threat | Mitigation |
|--------|-----------|
| Admin brute force | Rate limiting (5/min) on login + timing-safe comparison |
| Session hijacking | HMAC-signed deterministic token, httpOnly+secure cookie |
| Serverless session loss | Stateless HMAC tokens (no in-memory Set) |
| XSS | `X-Content-Type-Options: nosniff`, strict CSP |
| Clickjacking | `X-Frame-Options: DENY`, `frame-ancestors 'none'` |
| MITM | HSTS header (`max-age=63072000; includeSubDomains; preload`) |
| API abuse | DB-backed rate limiting per IP |
| Prompt injection | FastRouter rejects unsafe patterns before LLM call |
| SQL injection | Prisma parameterised queries only |

CSP allows:
- `connect-src`: self, `api.deepseek.com`, Google Fonts CDN
- `font-src`: self, `fonts.gstatic.com`
- `style-src`: self, unsafe-inline, `fonts.googleapis.com`

---

## 11. Internationalisation Details

| Locale | Script | Direction | Default |
|--------|--------|-----------|---------|
| `ar` | Arabic | RTL | ✅ Yes |
| `fr` | Latin | LTR | No |
| `en` | Latin | LTR | No |

- UI locale set by `locale` cookie or `accept-language` header
- Chat supports a 4th dialect: `darija` (Moroccan Arabic, detected from text content, not a UI locale)
- Article content only exists in `ar` and `fr` — `en` UI locale maps to `fr` for content
- Fonts loaded: Cairo (Arabic UI), Noto Serif Arabic (Arabic reading), Source Sans 3 (Latin)

---

## 12. Seeder (`prisma/seed.ts`)

Reads all `*_ar.json` / `*_fr.json` files from `data/laws/<code>/<lang>/` and upserts to DB.

**JSON file format** (produced by `extract_law.py`):
```json
{
  "doc_id": 1,
  "code": "family_code",
  "language": "ar",
  "source": "Bulletin Officiel n° 5184 du 5 février 2004",
  "effective_date": "2004-02-05",
  "version": "2004",
  "pdf_file": "family_code_ar.pdf",
  "extracted_at": "2024-01-01T00:00:00",
  "total_articles": 400,
  "articles": [
    {
      "article_number": "1",
      "content": "...",
      "hierarchy": {
        "book": "الكتاب الأول",
        "chapter": "الباب الأول",
        "section": "الفصل الأول"
      }
    }
  ]
}
```

**Upsert key:** `(code, articleNumber, language, version)` — safe to re-run.

**Env flags:**
- `SEED_SKIP_EMBEDDINGS=1` — skip embedding generation (faster for testing)
- `SEED_BATCH_SIZE=200` — upsert batch size

**Run:** `npx prisma db seed` or `npx tsx prisma/seed.ts`

---

## 13. `next.config.mjs`

```js
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" }
  },
  // Security headers on all routes
  async headers() { ... }
};
```

Build command: `next build --webpack`  
All API routes: `export const runtime = "nodejs";` (required — no Edge runtime)

---

## 14. Known Gaps / Future Work

1. **Family Code (FR)** — French PDF not yet extracted. Only AR version exists.
2. **Criminal Procedure (FR)** — Same issue. Only AR version exists.
3. **Vector search scalability** — Currently loads ALL embeddings from DB per query. Acceptable for ~8k articles at 256 dims, but would need pgvector extension for 50k+ articles.
4. **Embedding dimension mismatch** — If you switch `EMBEDDINGS_MODE` from `local` (256-dim) to `deepseek` (likely 1024-dim), existing embeddings are stale. Re-seed with `npx prisma db seed` after clearing `law_embeddings` table.
5. **No pagination** on article browsers — uses DB `take` limits.
6. **MyMemory translation** — free tier has rate limits; not production-grade for high traffic.

---

## 15. Deployment Checklist

1. Create Supabase project → copy both connection strings
2. Set all env vars in Vercel dashboard (see Section 4)
3. Run `npx prisma migrate deploy` (uses `DIRECT_URL`)
4. Run `npx prisma db seed` (seeds ~8k articles + embeddings)
5. Deploy to Vercel — `postinstall` runs `prisma generate` automatically
6. Verify: `/api/chat` responds, `/laws` shows codes, admin login works

---

*Last updated: April 2026. Project status: production-ready, clean codebase.*
