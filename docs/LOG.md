# Build Log

Chronological record of every step taken. Newest at the bottom.

## 2026-05-19

### Step 1 — Environment check
- Node v24.13.0, npm 11.6.2, git 2.53.0 — all OK.
- `E:\web\dealfinder` empty. GitHub repo `gmrolz1/DealFinder` empty (no commits).

### Step 2 — Decided stack & data strategy
- Stack: Next.js + TypeScript + Tailwind + Supabase + Vercel + GitHub.
- Data: scrape nawy factual data; generate own descriptions; developer photos.
- See PLAN.md.

### Step 3 — Scaffolded Next.js app
- `npx create-next-app@latest .` with: TypeScript, Tailwind, App Router,
  ESLint, `src/` dir, import alias `@/*`.

### Step 4 — Created planning docs
- `docs/PLAN.md`, `docs/LOG.md`, `docs/DATA-MODEL.md`, `docs/SETUP.md`.

### Step 5 — Pushed to GitHub
- `git init` (main), initial commit, pushed to `gmrolz1/DealFinder`.

### Step 6 — Reverse-engineered nawy's data source
- No public API auth needed. Every nawy page embeds a `__NEXT_DATA__`
  JSON blob.
- A **compound page** contains the full compound object AND its units
  (`pageProps.availablePropertyTypes[].properties[]`), plus arrays of all
  areas (46) and developers (391).
- Scrape plan: iterate ~1,765 EN compound URLs from the sitemap — one
  request each gets compound + units. No need to hit 37k property pages.

### Step 7 — Built the scraper (`scraper/scrape.mjs`)
- Extracts factual fields only. Descriptions NOT copied — generated later.
- Concurrency 5, 250ms delay (polite). Output: `scraper/data/*.json`.
- Test run (20 compounds): 13 areas, 9 developers, 20 compounds, 753 units.

### Step 8 — Started full scrape
- Running `node scraper/scrape.mjs` over all compounds in the background.

### Step 9 — Found nawy's JSON API (the fast method)
- nawy's frontend calls `listing-api.nawy.com`. Public, no auth. Endpoints:
  - `GET /v1/areas`              — 46 areas
  - `GET /v1/developers`         — paginated (no `total` field)
  - `GET /v1/search/compounds`   — total 1,769
  - `GET /v1/search/properties`  — total 19,016
- Max `pageSize` = 50. Full catalog = ~430 calls instead of ~1,800 HTML
  pages. Returns clean structured JSON with prices & payment plans.

### Step 10 — Rewrote scraper to use the API
- `scraper/scrape.mjs` v2: pages all four endpoints, maps factual fields.
- Hardened after first run: developers endpoint has no `total` (page
  until short page); added 429/5xx backoff, lower concurrency (4),
  per-page retry so one failed page doesn't abort the run.

### Step 11 — Full scrape running
- `node scraper/scrape.mjs` running in background → `scraper/data/*.json`.

### Step 12 — Full scrape completed
- 46 areas, 391 developers, 1,769 compounds, 18,934 properties in 122s.

### Step 13 — Built the MVP UI (reads scraped JSON, no DB yet)
- `src/lib/data.ts` — typed data layer (swap to Supabase later, only file
  that changes). `src/lib/format.ts` — price/number formatting.
- Components: `site-header`, `site-footer`, `property-card`.
- Pages: `/` (hero search, stats, areas, featured, developers, CTA),
  `/properties` (filters: area/type/beds/price/sort + pagination),
  `/properties/[slug]` (gallery, specs, generated overview, lead form,
  similar properties).
- Listing descriptions are generated from facts, not copied.
- All routes smoke-tested → HTTP 200, no errors. `npm run dev` works.

### Step 14 — Filtered out resale & Nawy Now
- Scrape had 3 sale types: resale 12,535 / nawy_now 438 / developer_sale 5,961.
- `data.ts` now exposes only `developer_sale` (primary) units → 5,961.

### Step 15 — Applied Apple HIG ("Liquid Glass") design, mobile-first
- New design tokens in `globals.css`: SF system font, system blue
  (#0071e3), canvas grey (#f5f5f7), hairline borders.
- Frosted sticky header; app-style bottom tab bar on mobile
  (`mobile-tabbar.tsx`, client component).
- Restyled cards, pages — pill buttons, large radii, generous spacing.

### Step 16 — Built out the site structure
- New pages: `/areas`, `/areas/[slug]`, `/developers`,
  `/developers/[slug]`, `/compounds/[slug]`, `/new-launches`.
- New `compound-card` component; `data.ts` extended with per-entity
  counts and slug lookups.
- Bug fixed: orphaned dev servers served stale code (500s); killed all,
  bumped Node heap to 4 GB via `cross-env` in the dev script.
- All routes smoke-tested → HTTP 200, no errors.

### Step 17 — Applied The Deal Maker brand + Material Design
- Loaded the brand system (brand skill): black/white/grey palette,
  Magnetik typeface, glitch signature, square monolith CTAs.
- Magnetik fonts copied to `src/fonts/`, wired via `next/font/local`
  (`src/lib/fonts.ts`).
- New `globals.css` tokens: ink/paper/slate/data/taupe + glitch keyframes.
- Switched design language from Apple HIG to Google Material Design
  patterns (top app bar, bottom navigation, cards, elevation) — skinned
  in the monolith brand.
- Restyled every component and page: dark theme, uppercase Magnetik
  headings, square white CTAs, one glitch headline on the homepage.
- Site name set to "The Deal Maker"; official logo throughout.
- Facebook link added to the footer.
- All routes smoke-tested → HTTP 200, no errors.

### Step 18 — Reverted to DealFinder, bright light theme
- Dropped The Deal Maker name/dark monolith brand per request.
- Bright Google Material light theme: white surfaces, #1a73e8 primary,
  blue-tinted hero, rounded cards with elevation, pill buttons.
- Switched font from Magnetik to Roboto (Google design system).
- Name back to "DealFinder"; logo mark kept (blue). Facebook link kept.
- Restyled every component and page; all routes → HTTP 200.

### Step 19 — Brand kit applied in light layout
- Per request: keep brand palette + Magnetik font + brand concepts,
  but on a light/bright background. Name stays "DealFinder".
- Restored Magnetik (`next/font/local`); brand tokens
  (ink/paper/slate/data/taupe) in a light layout — white background,
  black text, black square CTAs, glitch headline.
- Restyled every component and page; all routes → HTTP 200.

<!-- Next steps logged below as they happen -->

## Next up (blocked on you)
- Run `docs/SETUP.md` steps 1–2 (add Supabase MCP server + authenticate).
- Then the assistant creates DB tables and loads the scraped data.
