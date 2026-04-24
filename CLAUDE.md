# AI-Mizan — Claude Code Instructions

## Project context

AI-Mizan is a Moroccan legal information platform. The strategy is:
- Free forever for citizens (tools, guides, calculators, law browser, chatbot)
- Monetization via a lawyer marketplace (future phase, not current focus)
- Goal: become the go-to Moroccan legal website, traffic-first approach

Current phase: **pre-deployment**. We are polishing the product to be 
"phenomenon-worthy" before launching. No users yet, so refactoring is safe.

## Tech stack
- Next.js 16 (App Router) on Vercel
- PostgreSQL on Neon (EU Frankfurt), accessed via Prisma 5
- DeepSeek for chat (parked — low priority)
- Tailwind, TypeScript, trilingual AR/FR/EN

## Language conventions
- URLs: French (e.g. /outils/heritage, /lois/famille/article-173)
- Code comments, variable names: English
- UI content: fully translated AR/FR/EN via lib/i18nData.ts
- Commit messages: English, Conventional Commits format

## Working agreement

1. Always work on feature branches, never directly on main.
   Branch naming: feat/short-description, fix/short-description, refactor/short-description.
2. Explain before changing. For any non-trivial edit, describe what you're about to 
   change and why, before making the change.
3. Show diffs for large changes. Don't silently rewrite whole files.
4. Commit in logical units. One logical change per commit.
5. Never commit secrets. Double-check .env is in .gitignore.
6. Ask before destructive operations (DB migrations, file deletions, renames across many files).
7. Test after changes. Run `npm run build` or dev server to verify.

## Commit message format

type(scope): subject

Types: feat, fix, refactor, chore, docs, style, test, perf
Scopes: simulators, laws, chat, home, seo, db, i18n, deploy, infra, analytics

Examples:
- feat(simulators): add individual route for inheritance calculator
- fix(home): correct broken law code links in featured section
- chore(infra): archive legacy static prototype files

## Don't

- Don't deploy or change Vercel settings without explicit user confirmation
- Don't run prisma migrate deploy without showing the migration first
- Don't delete files (only archive them)
- Don't add dependencies without asking
- Don't git push --force ever
- Don't modify i18nData.ts without confirming AR + FR + EN strings

## Do

- Read STATUS_REPORT.md and CODEBASE_CONTEXT.md for current state
- Prefer server components over client components unless interactivity is needed
- Think about Moroccan mobile users first (slow networks, older Android)
- Target French URLs, AR+FR content, proper hreflang

## Current priorities (in order)

1. Foundation setup (this session)
2. Schema evolution — LawArticleVersion, AuditLog, analytics tables
3. URL restructure — individual simulator routes, clean article URLs
4. SEO foundations — sitemap, robots, metadata
5. Homepage redesign — tools-first
6. Inheritance simulator polish + first real guide
7. Iterate content until deployment-ready

## Known quirks

### Worktree duplicate lockfile warning

Next.js may show a warning about a duplicate `package-lock.json` when working
inside a Claude Code worktree (e.g. `.claude/worktrees/cool-chatterjee-690f2c/`).
This is a worktree artifact — the worktree and the main project folder both have
a `package-lock.json`, which confuses Next.js workspace root detection.

The warning disappears when working on the main branch in the regular project
folder. Do not add `outputFileTracingRoot` or `turbopack.root` to `next.config.mjs`
to fix it — doing so breaks the build because `node_modules` lives in the parent
directory, not the worktree.
