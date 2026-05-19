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

<!-- Next steps logged below as they happen -->

## Next up (blocked on you)
- Run `docs/SETUP.md` steps 1–2 (add Supabase MCP server + authenticate).
- Then the assistant creates DB tables and loads the scraped data.
