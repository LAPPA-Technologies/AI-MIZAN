# AI-Mizan

Moroccan law assistant built with Next.js, Prisma, and PostgreSQL.

## What this app does

- Provides legal-information chat answers grounded in Moroccan law articles.
- Shows citations and article details.
- Lets users browse/search law codes and articles.
- Supports Arabic/French content and translation helpers.

## Tech stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- DeepSeek (chat/completions)
- Optional OpenAI/DeepSeek/local embeddings modes

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy env template and fill values:

```bash
cp .env.example .env
```

3. Run DB migrations and seed:

```bash
npx prisma migrate dev
npm run db:seed
```

4. Start app:

```bash
npm run dev
```

## Deploy on Vercel with Supabase

### 1) Create a Supabase project

- In Supabase, create a new project.
- Go to `Project Settings -> Database`.
- Copy both connection strings:
  - Pooled connection (port `6543`, pooler) for `DATABASE_URL`
  - Direct connection (port `5432`) for `DIRECT_URL`

### 2) Configure Prisma environment variables

Set these in Vercel (Project -> Settings -> Environment Variables):

- `DATABASE_URL` = pooled Supabase URL (with `pgbouncer=true`)
- `DIRECT_URL` = direct Supabase URL
- `DEEPSEEK_API_KEY` = your DeepSeek key
- `DEEPSEEK_MODEL` = `deepseek-chat` (or your selected model)
- `OPENAI_API_KEY` (optional)
- `EMBEDDINGS_MODE` = `auto` (or `local|openai|deepseek`)
- `LOCAL_EMBEDDINGS_DIM` = `256`

### 3) Import project to Vercel

- Push this repository to GitHub/GitLab/Bitbucket.
- In Vercel, create a new project and import the repository.
- Framework preset: Next.js.
- Build command: `npm run build`
- Install command: `npm install`

Note: `prisma generate` is already executed by `postinstall`.

### 4) Run database migrations on Supabase

From your local machine (with production env values in `.env`):

```bash
npx prisma migrate deploy
```

This applies migrations to Supabase using `DIRECT_URL`.

### 5) Seed production data (one-time)

Run once after migrations:

```bash
npm run db:seed
```

You can run this locally with production env vars, or from a trusted CI job.

### 6) Deploy

- Trigger a Vercel deployment from dashboard or push to main branch.
- Open the deployed URL and test:
  - `/api/chat`
  - `/api/articles`
  - chat page and laws pages

## Operational notes

- `app/api/chat/route.ts` is configured for Node.js runtime and extended duration.
- `vercel.json` sets a `maxDuration` for streaming chat responses.
- Keep Supabase credentials server-side only; never expose them in client env vars.

## Disclaimer

This project provides legal information, not legal advice.
