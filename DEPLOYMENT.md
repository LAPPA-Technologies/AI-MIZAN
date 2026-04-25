# AI-Mizan — Vercel + Supabase Deployment Guide

## Prerequisites

- Node.js ≥ 18 and npm installed locally
- A [Supabase](https://supabase.com) account and project
- A [Vercel](https://vercel.com) account
- A [DeepSeek](https://platform.deepseek.com) API key

---

## Step 1 — Set Up Supabase

1. Create a new Supabase project (choose the closest region to your users).
2. In your project dashboard, go to **Settings → Database**.
3. Copy the two connection strings you need:
   - **Pooled URL** (Session mode, port `6543`) → `DATABASE_URL`
   - **Direct URL** (port `5432`) → `DIRECT_URL`
4. The URLs look like:
   ```
   DATABASE_URL = postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL   = postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```

---

## Step 2 — Configure Local Environment

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required values:
| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `ADMIN_SECRET` | Strong random secret (≥ 32 chars). Generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_CHAT_PUBLIC` | `"true"` to allow all users to use AI chat, `"false"` for admin-only |

Optional:
| Variable | Description |
|---|---|
| `EMBEDDINGS_MODE` | `"auto"` (default), `"local"`, or `"deepseek"` |
| `MYMEMORY_EMAIL` | Email for higher MyMemory translation quota |
| `RETRIEVE_TOP_K` | Number of articles to retrieve per query (default: 8) |

---

## Step 3 — Run Database Migrations

Apply all Prisma migrations to your Supabase database:

```bash
npx prisma migrate deploy
```

This uses `DIRECT_URL` for the migration connection (bypasses PgBouncer, required for DDL).

---

## Step 4 — Seed the Database

Load all law articles into the database:

```bash
# Fast seed (no AI embeddings — uses local hash embeddings)
SEED_SKIP_EMBEDDINGS=1 npx prisma db seed

# Full seed with embeddings (requires DEEPSEEK_API_KEY if EMBEDDINGS_MODE=deepseek)
npx prisma db seed
```

> **Note:** The seed is idempotent — running it twice is safe (upserts).
> 
> **Data coverage after seeding:**
> | Law Code | Arabic | French |
> |---|---|---|
> | `family_code` | ✅ ~400 articles | ⚠️ 0 articles (PDF not extracted yet) |
> | `penal_code` | ✅ ~757 articles | ✅ ~611 articles |
> | `obligations_contracts` | ✅ ~1239 articles | ✅ ~1240 articles |
> | `civil_procedure` | ✅ ~470 articles | ✅ ~492 articles |
> | `criminal_procedure` | ✅ ~757 articles | ⚠️ Not available yet |
> | `commerce_code` | ✅ ~794 articles | ✅ ~798 articles |
> | `labor_code` | ✅ ~297 articles | ✅ ~589 articles |
> | `urbanism_code` | ✅ ~93 articles | ✅ ~93 articles |
>
> To add the missing French Family Code data, extract the PDF using the scripts in `data/scripts/` and place the output at `data/laws/family_code/fr/family_code_fr.json`.

---

## Step 5 — Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B — GitHub Integration

1. Push your code to GitHub (ensure `.env` is in `.gitignore` — it already is).
2. In Vercel dashboard: **New Project → Import Git Repository**.
3. Select your repo and configure environment variables (next step).

### Environment Variables in Vercel

In your Vercel project: **Settings → Environment Variables**, add all variables from `.env.example`:

| Variable | Environment |
|---|---|
| `DATABASE_URL` | Production, Preview |
| `DIRECT_URL` | Production, Preview |
| `DEEPSEEK_API_KEY` | Production, Preview |
| `DEEPSEEK_MODEL` | Production, Preview |
| `ADMIN_SECRET` | Production, Preview |
| `NEXT_PUBLIC_CHAT_PUBLIC` | Production, Preview |
| `EMBEDDINGS_MODE` | Production, Preview |
| `LOCAL_EMBEDDINGS_DIM` | Production, Preview |
| `RETRIEVE_TOP_K` | Production, Preview |
| `MYMEMORY_EMAIL` | Production (optional) |

> `NEXT_PUBLIC_*` variables are embedded at build time and sent to the browser. Never prefix sensitive values with `NEXT_PUBLIC_`.

---

## Step 6 — Post-Deployment Checks

1. **Laws page** (`/laws`) — should show all 8 law codes with article counts.
2. **Article browsing** (`/laws/family_code`) — should show hierarchical chapters.
3. **Article search** (`/laws/search?q=...`) — should return relevant articles.
4. **Admin login** (`/admin`) — enter your `ADMIN_SECRET` to enable the AI chat.
5. **AI Chat** (`/chat`) — after admin login (or if `NEXT_PUBLIC_CHAT_PUBLIC=true`).
6. **Translation** (article pages) — test translating an article.

---

## Architecture Notes

### Serverless Compatibility
- All session state is stateless: admin auth uses HMAC-signed cookies (no in-memory sessions).
- Rate limiting uses the database (`rate_limits` table) — safe across multiple function instances.
- Prisma uses a pooled connection (`pgbouncer=true`) to avoid connection exhaustion.

### Function Timeouts
The `/api/chat` route is configured with `maxDuration: 60s` in `vercel.json` (requires Vercel Pro/Team plan for durations > 10s on the free plan).

To stay within the free plan (10s limit), set `EMBEDDINGS_MODE=local` and expect shorter AI responses:
```
# vercel.json — reduce timeout for Hobby plan
# The chat will still work but streaming may be cut at 10s for complex queries
```

### Database Connection Pooling
Supabase's PgBouncer is configured in `DATABASE_URL`. Do not use `directUrl` at runtime — it's only for migrations. The `connection_limit=1` parameter prevents connection pool exhaustion in serverless environments.

---

## Common Issues

| Problem | Solution |
|---|---|
| `Error: DEEPSEEK_API_KEY is not configured` | Add `DEEPSEEK_API_KEY` in Vercel env vars |
| Laws page shows "0 articles" | Run `npx prisma db seed` against your production DB |
| Admin login succeeds but chat is locked | Clear browser cookies and log in again; HMAC token is now session-tied to `ADMIN_SECRET` |
| Arabic fonts not loading | Fixed: CSP now includes `fonts.gstatic.com` |
| `prisma migrate deploy` fails | Use `DIRECT_URL` (not pooled URL) for migrations |
| Function timeout on chat | Reduce context or upgrade to Vercel Pro for 60s functions |
