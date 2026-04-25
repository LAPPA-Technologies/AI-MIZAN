# AI-Mizan Status Report
*Generated: April 2026 — from live source code audit*

---

## 1. Simulators

**Location:** `app/simulators/page.tsx` (899 lines, single file, client component)  
**URL:** `/simulators`

All simulators live in one page as expanding accordion cards. There is no router-level URL per simulator — they all share `/simulators`. The page header dynamically counts 6 "available" and 1 "coming soon" tools.

---

### 1.1 Net Salary Calculator (`salary`)
**What it solves:** Calculates Moroccan take-home pay after CNSS, AMO, and IR deductions.  
**State:** Fully working.  
**Inputs:**
- Monthly gross salary (MAD)

**Outputs:**
- CNSS deduction
- AMO deduction
- IR (income tax) monthly deduction
- Total deductions
- Net taxable income (monthly)
- Net salary (MAD)

**Law references:** CGI Art. 73 (IR brackets 2023/2024), CNSS rate 4.48%, AMO rate 2.26%, professional expense cap 2,500 MAD/month  
**Languages:** Responds in current locale but uses `dict` keys for labels — all 3 locales covered  
**Mobile:** Yes — `flex-col sm:flex-row` layout  
**Lawyer CTA:** No  
**Bugs/UX:** IR brackets hardcoded to 2023/2024 — no indication of tax year, will silently be wrong when rates change. No handling of special regimes (civil servants, agricultural workers).

---

### 1.2 Rent Deposit Calculator (`rent`)
**What it solves:** Calculates the maximum legal deposit and required notice period for a rental property.  
**State:** Fully working.  
**Inputs:**
- Monthly rent amount (MAD)

**Outputs:**
- Maximum legal deposit (always 2× monthly rent)
- Notice period (2 months if rent ≤ 4,000 MAD, 3 months if > 4,000 MAD)

**Law references:** Loi 67-12  
**Languages:** All 3 locales  
**Mobile:** Yes  
**Lawyer CTA:** No  
**Bugs/UX:** The 4,000 MAD threshold for notice period is hardcoded; no source citation confirming this exact figure in the code comment. Output is very sparse — only 2 fields shown.

---

### 1.3 Severance Pay Calculator (`severance`)
**What it solves:** Calculates the legal severance indemnity (indemnité de licenciement) for an unfairly dismissed employee.  
**State:** Fully working.  
**Inputs:**
- Monthly gross salary (MAD)
- Years of service

**Outputs:**
- Total severance amount (MAD)
- Total compensable hours (informational)

**Law references:** Labor Code Art. 52-53. Brackets: 96h/yr (0–5 yrs), 144h/yr (6–10), 192h/yr (11–15), 240h/yr (16+). Hourly rate = gross / 191.  
**Languages:** All 3 locales  
**Mobile:** Yes — 3-column grid on SM+  
**Lawyer CTA:** No  
**Bugs/UX:** Does not distinguish between unjustified dismissal (Art. 52) and mutual agreement. Does not calculate the separate notice period indemnity or the indemnité de préavis. Fractional years accepted (step 0.5) but brackets snap to whole-year math.

---

### 1.4 Notary Fees Calculator (`notary`)
**What it solves:** Estimates the total fees to budget for a Moroccan real estate purchase (registration tax, stamp tax, land conservation, notary honoraires).  
**State:** Fully working.  
**Inputs:**
- Property sale price (MAD)

**Outputs:**
- Registration tax (4%)
- Stamp duty (1.5%)
- Land conservation fee (1%)
- Notary honoraires (max of 1% or 2,500 MAD)
- Total

**Law references:** No specific article cited in comments — rates described as "Registration 4%, stamp 1.5%, conservation 1%, notary ~1% (min 2500)".  
**Languages:** All 3 locales  
**Mobile:** Yes  
**Lawyer CTA:** No  
**Bugs/UX:** Notary honoraires formula is simplified (1% flat). Actual notary scale in Morocco is degressive (higher rates for lower brackets). Does not handle TPI (taxe professionnelle) or municipality taxes. No indication of first-time buyer exemptions.

---

### 1.5 Auto-Entrepreneur Tax Calculator (`autoent`)
**What it solves:** Checks whether an auto-entrepreneur qualifies under Loi 114-13 and estimates annual flat tax.  
**State:** Fully working.  
**Inputs:**
- Annual revenue (MAD)
- Activity type: Commerce/Industry (select) or Service/Liberal (select)

**Outputs:**
- Eligibility status (yes/no)
- Revenue ceiling for the chosen type
- Estimated annual flat tax (1% or 2%)

**Law references:** Loi 114-13. Commerce ceiling 500,000 MAD @ 1%. Service ceiling 200,000 MAD @ 2%.  
**Languages:** All 3 locales  
**Mobile:** Yes  
**Lawyer CTA:** No  
**Bugs/UX:** Does not address CNSS contributions (auto-entrepreneurs still owe social contributions). Does not warn that the auto-entrepreneur regime changed in the 2025 Finance Law (new ceilings/rates). No output for what happens if you exceed the ceiling.

---

### 1.6 Divorce Simulator (`divorce`)
**State:** ⚠️ NOT IMPLEMENTED — "Coming Soon" badge only.  
The card renders with a "Coming Soon" label. The `SIM_CARDS` array has `ready: false`. No `<DivorceCalc />` component exists anywhere in the file. Clicking it does nothing.

---

### 1.7 Islamic Inheritance Calculator (`inheritance`)
**What it solves:** Distributes a Moroccan estate across heirs according to the Moudawana Faraid rules (Islamic inheritance shares).  
**State:** Fully working — most complex simulator. Implements `aul` (proportional reduction when shares exceed estate), `radd` (redistribution of remainder), and `hajb` (blocking rules).  
**Inputs (15 fields):**
- Estate value (MAD)
- Husband (0 or 1)
- Wife (number)
- Son (number)
- Daughter (number)
- Father (0 or 1)
- Mother (0 or 1)
- Paternal grandfather (0 or 1)
- Paternal grandmother (0 or 1)
- Maternal grandmother (0 or 1)
- Full brothers (number)
- Full sisters (number)
- Paternal half-brothers (number)
- Paternal half-sisters (number)
- Uterine siblings (number)

**Outputs per heir (per person):**
- Fraction of estate (e.g. "1/4")
- Total MAD amount
- Per-person MAD amount
- Blocking note if hajb applies

**Law references:** Moudawana Art. 325–393  
**Languages:** Labels shown in `ar` / `fr` / `en` depending on locale  
**Mobile:** Yes  
**Lawyer CTA:** No  
**Bugs/UX:** Does not handle grandchildren (son's children), maternal grandfather, or distant agnates (`'asaba` beyond father/son). Does not implement `nasab` (filiation) edge cases. No handling of debts being deducted first from the estate. Fractional amounts shown with 2 decimal places but not rounded to whole dirhams. No "total" row at the bottom showing full estate redistribution check.

---

### Global Simulator Notes
- **No individual URLs** — all simulators at `/simulators` with no deep-link per tool
- **No "contact a lawyer" CTA** on any simulator
- **No save/share result feature** — results disappear on close
- **Language detection** is partially broken: the available-tools count reads `d.simSalaryCalculate` value to guess locale ("احسب" = AR, "Calculer" = FR) — this is a hack, not real locale detection
- **No print/PDF output** for calculator results (unlike the documents section which has PDF export)

---

## 2. Homepage (`app/page.tsx`)

**Line count:** 281 lines. Server component.  
**URL:** `/`

### Sections in order (top to bottom):

1. **Hero** — Full-width gradient banner (green-700 → emerald-900). Contains:
   - Tagline badge ("Moroccan Law Engine")
   - H1 title (from i18n `heroTitlePrimary` / `heroTitleSecondary`)
   - Subtitle paragraph
   - Inline search form → submits to `/laws?q=`
   - Two CTAs: "Browse Laws" → `/laws`, "Simulators" → `/simulators`
   - Stats panel (total articles count live from DB, number of codes)
   - "How it works" 3-step explainer

2. **DisclaimerBanner** — Legal disclaimer text strip

3. **AI Chat CTA** — Green gradient section pushing users to `/chat`. Primary CTA button.

4. **Quick Topics** — 4 icon+text cards linking to:
   - 🏠 Rent → `/guides#housing`
   - 💼 Work → `/guides#employment`
   - 👨‍👩‍👧 Family → `/guides#family`
   - 🚗 Accidents → `/laws/penal/articles` ← **BROKEN LINK** (code is `penal_code`, not `penal`)

5. **Useful Legal Tools** — 3 cards linking to `/simulators` (inheritance, salary, severance). All three link to the same `/simulators` URL with no deep-link.

6. **Featured Codes** — 4 cards:
   - Family Code → `/laws/family` ← **BROKEN LINK** (should be `/laws/family_code`)
   - Penal Code → `/laws/penal` ← **BROKEN LINK** (should be `/laws/penal_code`)
   - DOC → `/laws/obligations` ← **BROKEN LINK** (should be `/laws/obligations_contracts`)
   - Civil Procedure → `/laws/civil_procedure` ← **correct**

7. **Services Teaser** — 3 cards: Courts Directory → `/services#courts`, Legal Resources → `/services#resources`, Emergency Contacts → `/services#contacts`

8. **Latest Updates** — DB-driven: 3 most recently updated `LawArticle` rows. Each links to the correct per-article URL.

**Primary CTA:** Chat (`/chat`) in section 3.  
**What it promotes:** Chat + Laws (roughly equal billing), with a secondary push toward simulators.  
**Mobile:** Responsive — hero switches from 2-column to single column below `lg`. Card grids use `sm:grid-cols-2 lg:grid-cols-4`.  
**Placeholder content:** None — all sections use DB data or i18n strings.  
**TODO comments:** None.  
**Critical bugs:** 3 broken law code links in the "Featured Codes" section (family, penal, obligations).

---

## 3. Services Section (`app/services/`)

### 3.1 Services Index (`/services`)
**File:** `app/services/page.tsx` — server component, ~120 lines.  
Contains three sections:
1. Court system explainer (5 court type cards — static text only, no links to `/services/courts`)
2. Legal resources (6 external links: Barreau du Maroc, Bulletin Officiel, Ministère de la Justice, Adala, CNDH, Médiateur du Royaume)
3. Emergency contacts (6 Moroccan phone numbers: Police 19, Gendarmerie 177, Pompiers 15, Femmes hotline, Children protection, Anti-corruption)

### 3.2 Courts Directory (`/services/courts`)
**File:** `app/services/courts/page.tsx` (277 lines, client component)  
**State:** Partially working — UI is complete, data is a stub.

**What it does:** Filterable/searchable directory of Moroccan courts. Filters: court type, region, text search. Groups results by city.

**Data source:** `data/courts.ts` — a hardcoded TypeScript array. Comment in the file: *"Small sample dataset — add or replace with authoritative source later."*  
**Actual data:** Only **4 courts** in 3 regions (`casablanca_settat`, `rabat_sale`, `fes_meknes`):
- `casablanca_tribunal_1` — Tribunal de première instance de Casablanca
- `rabat_tribunal_1` — Tribunal de première instance de Rabat
- `casablanca_commerce` — Tribunal de commerce de Casablanca
- `fes_appel` — Cour d'appel de Fès

Morocco has 70+ courts. This covers ~5% of them. The 3 defined regions cover only 3 of Morocco's 12 administrative regions. The filter UI works but is useless at current data volume.

**Individual court pages (`/services/courts/[id]`):** Fully built — shows address, phone, fax, email, map link, nearby courts. Works for the 4 existing entries.  
**No database** — no DB table for courts, no admin interface to add them.  
**Languages:** All 3 (court names/addresses are hardcoded trilingual objects)

### 3.3 Documents (`/services/documents`)
**File:** `app/services/documents/page.tsx` (224 lines, client component) + `app/services/documents/[slug]/page.tsx`  
**State:** Fully working pipeline — form fill → preview → PDF download / WhatsApp share.

**Document templates available** (from `lib/forms/formConfigs.ts`, 871 lines):
1. `custody-request` — Child Custody Request (Moudawana Art. 163-186) — category: `family`
2. `lease-contract` — Lease Contract (Loi 67-12) — category: `civil`
3. `power-of-attorney` — Power of Attorney — category: `civil`
4. `divorce-petition` — Divorce Petition (Moudawana) — category: `family`
5. `criminal-complaint` — Criminal Complaint — category: `criminal`
(Additional templates likely exist beyond the 20 visible matches — file is 871 lines)

**Generation method:** `html2pdf.js` rendering a DOM-built document. `jsPDF` is also in dependencies but `PDFGenerator.ts` uses html2pdf for PDF, separate `downloadAsTxt()` for plain text.

**Languages:** All 3 (ar/fr/en). `previewLang` selector lets user switch language of the generated document.

**Download options:** PDF download, TXT download, WhatsApp share (URL-encoded text to `wa.me`)

**Captures user info:** No — form data is local state only. Not saved to DB. No email capture. Ref number is randomly generated client-side.

**Issues:** WhatsApp sharing sends the full document text as a URL — truncated at 65k chars. For complex documents this will silently truncate. No server-side record of documents generated.

---

## 4. Guides Section (`app/guides/`)

**File:** `app/guides/page.tsx` (178 lines, server component)  
**URL:** `/guides` — single page, no individual guide sub-pages

**Guides currently published (all hardcoded, all on one page):**

| # | Topic | Icon | Laws referenced | Steps |
|---|-------|------|-----------------|-------|
| 1 | Wrongful dismissal | 💼 | `obligations_contracts` | 4 |
| 2 | Tenant rights | 🏠 | `civil_procedure` | 4 |
| 3 | Family law basics | 👨‍👩‍👧 | `family_code` | 4 |
| 4 | Criminal procedures | ⚖️ | `penal_code` | 4 |
| 5 | Contracts and obligations | 📜 | `obligations_contracts` | 4 |

**Average length per guide:** ~4 bullet steps + 1 intro sentence. Very short — these are orientation cards, not full guides.

**Languages:** All i18n-driven (ar/fr/en). Each step pulls from `dict` keys.

**Individual guide URLs/slugs:** None — no `/guides/[slug]` route. The "Quick Topics" links on the homepage use fragment anchors (`/guides#employment`, `/guides#housing`, `/guides#family`) but there are no corresponding `id` attributes on the guide cards in the current `guides/page.tsx`. These anchors do not work.

**DB-driven:** No — all content hardcoded in `i18nData.ts` and `page.tsx`.

**SEO:** None specific to guides. No `generateMetadata`. No structured data (Schema.org `HowTo`, `Article`). No meta descriptions per guide. The page inherits the root layout's generic metadata.

**CTA per guide:** Each card has a "View related articles" link to the law code's article browser.

---

## 5. Law Browser (`app/laws/`)

### URL structure

| URL | What it shows |
|-----|---------------|
| `/laws` | Index of all 8 law codes with article counts per language |
| `/laws/[code]` | Hierarchical chapter browser for one code |
| `/laws/[code]/articles` | Paginated article list with text search + chapter filter |
| `/laws/[code]/articles/[articleNumber]` | **Does not exist as a dedicated route** — the articles page accepts `?article=N` as a search param, not a path segment |
| `/laws/search?q=...` | Cross-code text search |

**Public permalink per article:** Yes — functionally: `/laws/[code]/articles?article=[number]&lang=ar` — but this is a query string, not a clean path. There is no `/laws/family_code/article-173` style slug route. Deep-linking works but is ugly and exposes implementation.

**SEO metadata on article pages:** None. No `generateMetadata` export in any `app/laws/` file. Articles have no `<title>`, no meta description, no canonical tag, no hreflang. The root layout's generic metadata applies to all article pages.

**Related articles:** Not implemented. No "related" or "see also" links on any article page.

**Contextual chatbot or simulator links:** Not implemented. Article pages do not surface chat or simulators.

**Search page capabilities** (`/laws/search`):
- Text search across all 8 codes simultaneously
- Article number lookup (`?article=N`)
- Language filter (AR / FR)
- English queries are expanded via `lib/crossLangSearch.ts` (EN → AR/FR keyword mapping for ~50 terms)
- Strips Arabic diacritics before matching
- Results paginated: `take: 30` hardcoded

---

## 6. Chatbot (`app/chat/`, `app/api/chat/`)

**State:** Working. No known broken functionality.

**Architecture confirms:**
- FastRouter (regex) → rejects UNSAFE / SMALLTALK / NON_LEGAL without API calls
- Embedding (local hash by default) → vector search → keyword fallback
- DeepSeek streaming with SSE to client
- Multi-turn history (last 20 messages sent to API)
- Conversation persistence via localStorage
- Chat is admin-only by default (`NEXT_PUBLIC_CHAT_PUBLIC=false`)

**Known limitations:**
- No average latency measurement in code (no timing instrumentation)
- Rate limit is 5 requests/60 seconds per IP — very tight for demo use
- Chat history stored in localStorage — lost on browser clear, not tied to account
- `app/chat/layout.tsx` uses `ChatAccessGate` (client component) for auth — there is no server-side redirect, meaning the chat page HTML is publicly served and the gate is enforced client-side only

**Chat page line count:** ~2,300 lines — largest file in the codebase.

---

## 7. Traffic & Analytics

**Analytics installed:** None. No Google Analytics, Plausible, PostHog, Vercel Analytics, or any tracking script found in `app/layout.tsx`, `app/page.tsx`, or any other file.

**Current numbers:** Unknown — no instrumentation.

**Google Search Console:** No submission confirmed. No `verification` meta tag found in layout.

**Bing Webmaster Tools:** Not set up.

**Sitemap:** Not implemented. No `app/sitemap.ts`, no `public/sitemap.xml`. Next.js is not auto-generating one.

**robots.txt:** No `app/robots.ts`, no `public/robots.txt`. Next.js default applies (allows all crawlers, no sitemap reference).

**Summary:** The site is effectively invisible to search engines. No tracking, no sitemap, no GSC, no robots.txt.

---

## 8. Deployment & Costs

**Live domain:** Not confirmed in codebase. No domain configuration found in `vercel.json` (file exists in repo — check its content for domain config).

**Vercel plan:** Unknown — not in codebase. `vercel.json` exists.

**Supabase plan:** Unknown. Uses pooled connection (port 6543), which requires at minimum the free tier.

**DeepSeek spend:** Unknown — depends on `EMBEDDINGS_MODE` and chat usage.
- If `EMBEDDINGS_MODE=local` (default): zero embedding cost
- Chat: DeepSeek `deepseek-chat`, max 1,200 tokens/response. Rate limit is 5 req/min/IP but no global cap configured.

**Env vars in production:** Per `.env.example`, these are required:
- `DATABASE_URL` (pooled Supabase)
- `DIRECT_URL` (direct Supabase, migrations only)
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_CHAT_PUBLIC`
Optional: `OPENAI_API_KEY`, `MYMEMORY_EMAIL`, `EMBEDDINGS_MODE`, `RETRIEVE_TOP_K`

**CDN/Morocco latency:** Vercel Edge Network has no POP in Morocco. Nearest POPs are likely Paris (CDG) or Amsterdam. Expect 80–150ms base latency from Casablanca/Rabat. The API routes (`/api/chat`) add DB round-trips to Supabase (EU region). Total chat response start: 200–400ms before first token.

---

## 9. Mobile Experience

**Responsive:** Yes — Tailwind breakpoints used throughout (`sm:`, `lg:`). The app is usable on mobile.

**PWA:** Not implemented. No `manifest.json` in `/public`. No service worker. No `<link rel="manifest">` in layout. Cannot be installed as an app.

**Navigation:**
- `components/MobileNav.tsx` exists — mobile hamburger drawer
- `components/Header.tsx` uses MobileNav on small screens
- No bottom navigation bar (desktop nav pattern only)

**Pages with potential mobile issues:**
- **Chat page** (`/chat`): Very large client component (~2,300 lines). Sidebar conversation list + main panel — likely collapses on mobile, but complex state management could cause layout thrash.
- **Simulators page**: Accordion expand triggers `sm:col-span-2 lg:col-span-3` span — the expanded card takes full width on mobile which is correct, but the inheritance calculator has a 15-field form that may be cramped.
- **Courts page**: Search + filter bar + city-grouped results — functional on mobile.

**RTL support:** Correct — `dir="rtl"` applied at `<html>` level when locale is `ar`.

---

## 10. Sharing & Virality Features

**WhatsApp "Share" button:** Yes — but **only on document output pages** (`/services/documents/[slug]`). Implemented in `components/forms/PDFGenerator.ts` → `shareViaWhatsApp()`. Opens `wa.me/?text=...` with URL-encoded document text. Not present on any other page.

**Copy to clipboard:** Yes — but **only in the chat page**, on individual AI responses. No "copy link" to an article or conversation.

**Export as PDF:** Yes — chat conversations (PDF via html2pdf + jsPDF fallback, `downloadAsTxt` also available). Document forms (PDF via html2pdf). No PDF export on law articles.

**Open Graph images per page:** None. `app/layout.tsx` sets a global OG tag (`openGraph.title`, `openGraph.description`, `openGraph.type: "website"`) with no per-page image. No `opengraph-image.png` in any route folder.

**Referral/social features:** None.

**Share article link:** Not implemented. No "copy article URL" button on article pages.

---

## 11. Content Inventory

| Content type | Count | Notes |
|---|---|---|
| Simulators (working) | 6 | All in single page |
| Simulators (stub) | 1 | `divorce` — no implementation |
| Guides | 5 | Single page, very short |
| Document templates | 5+ | `formConfigs.ts` is 871 lines; likely 7–10 total |
| Blog posts | 0 | No blog, no CMS |
| Law articles (DB) | ~8,630 | Approximate sum across 8 codes |

**Content language breakdown:**
- AR only: `family_code` (400), `criminal_procedure` (757)
- AR + FR: all other 6 codes (~7,473 total articles)
- EN: zero law articles — UI only

**CMS:** None. All UI content is hardcoded in `lib/i18nData.ts` or `.tsx` files. Adding a new guide or modifying a guide step requires a code deploy.

**Blog:** No `app/blog/` route. No `app/articles/` route (distinct from law articles). No blog-style content.

---

## 12. Known Issues & TODOs

### Broken links (confirmed in source)

| File | Line | Broken href | Should be |
|------|------|-------------|-----------|
| `app/page.tsx` | ~225 | `/laws/family` | `/laws/family_code` |
| `app/page.tsx` | ~226 | `/laws/penal` | `/laws/penal_code` |
| `app/page.tsx` | ~227 | `/laws/obligations` | `/laws/obligations_contracts` |
| `app/page.tsx` | ~166 | `/laws/penal/articles` | `/laws/penal_code/articles` |
| `app/guides/page.tsx` | fragments | `/guides#employment`, `/guides#housing`, `/guides#family` | No matching `id=` attributes on guide cards |

### Stub data

| File | Issue |
|------|-------|
| `data/courts.ts` | Comment: *"Small sample dataset — add or replace with authoritative source later."* Only 4 courts defined. |
| `lib/i18nData.ts:128` | `"A plain-language summary is coming soon."` — referenced somewhere in UI but not traced to a visible element |

### Features wired but incomplete

| Feature | State |
|---------|-------|
| Divorce simulator | Card exists, `ready: false`, no component |
| Article permalinks | Functional but ugly (`?article=N` query param, not a route segment) |
| Guides deep-links | Homepage anchors (`#housing`, `#employment`) have no targets |
| Chat auth (server-side) | `ChatAccessGate` is a client component — server renders full HTML before gate check |

### `lib/i18nData.ts` strings referencing unbuilt features

- `simComingSoon: "Coming soon"` — used in simulators badge
- `comingSoon: "Coming Soon"` — referenced in i18n but not traced to a visible page element

### No TODO/FIXME/HACK comments in source

None found via grep across `app/**` and `lib/**`. The only textual signal is the `data/courts.ts` comment and the `i18nData.ts` "coming soon" string.

---

## 13. Components Available for Reuse

| Component | File | What it does | Typical usage |
|-----------|------|--------------|---------------|
| `Container` | `components/Container.tsx` | Max-width wrapper with horizontal padding | Wraps every page's main content |
| `Footer` | `components/Footer.tsx` | Site footer with nav links | Bottom of every page |
| `Header` | `components/Header.tsx` | Site header, language switcher, mobile nav | Root layout |
| `MobileNav` | `components/MobileNav.tsx` | Hamburger drawer with nav links | Used inside Header |
| `DisclaimerBanner` | `components/DisclaimerBanner.tsx` | Orange/amber strip with disclaimer text | Homepage and chat |
| `LanguageDropdown` | `components/LanguageDropdown.tsx` | Cookie-setting language picker | Used in Header |
| `TranslateButton` | `components/TranslateButton.tsx` | Calls `/api/translate` to translate a block of text | Used on article pages |
| `ChatAccessGate` | `components/ChatAccessGate.tsx` | Client-side auth gate checking `admin_logged_in` cookie | Chat layout |
| `FormBuilder` | `components/forms/FormBuilder.tsx` | Multi-step form renderer driven by a `DocumentFormConfig` | Document pages |
| `DocumentPreview` | `components/forms/DocumentPreview.tsx` | Renders filled form as a styled document preview | Document pages after form completion |
| `PDFGenerator` | `components/forms/PDFGenerator.ts` | `generatePDF()`, `downloadAsTxt()`, `shareViaWhatsApp()` | Document output page |

**Reuse notes for simulator/tool development:**
- `FormBuilder` + `DocumentPreview` + `PDFGenerator` are a complete form-to-PDF pipeline reusable for any new tool that needs document generation
- `Container`, `Footer`, `DisclaimerBanner` are trivially composable
- There is no generic "result card" or "calculator output row" component — the `Row` helper function inside `simulators/page.tsx` is file-local and would need to be extracted if building new calculators in separate files
