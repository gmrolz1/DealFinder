# Architecture

How data and requests flow through DealFinder. Read this before changing the data layer, the scraper, or routing.

---

## High level

```
┌──────────────┐  scrape  ┌─────────────┐  load  ┌──────────────┐
│ nawy.com API ├─────────►│  JSON files ├───────►│   Supabase   │
│ (public)     │ (1×/day) │ scraper/    │ (1-off)│  (Postgres)  │
└──────────────┘          │ data/       │        └──────┬───────┘
                          └──────┬──────┘               │
                                 │ runtime              │ runtime
                                 │ (current MVP)        │ (target)
                                 ▼                      ▼
                          ┌────────────────────────────────┐
                          │      Next.js (App Router)      │
                          │   src/lib/data.ts  ◄──────────►│
                          │     ↓                          │
                          │   src/app/**  (EN + /ar)       │
                          └───────────────┬────────────────┘
                                          │
                                          ▼
                                  ┌──────────────┐
                                  │   Vercel     │
                                  │  (edge SSR)  │
                                  └──────────────┘
```

Today the runtime data layer reads scraped JSON from `scraper/data/*.json` (bundled into Vercel routes via `next.config.ts → outputFileTracingIncludes`). Supabase is populated and ready; swapping `src/lib/data.ts` to read from Supabase is the next milestone (see `docs/ROADMAP.md` M0).

---

## Repository layout

```
DealFinder/
├── src/                     Application code
│   ├── app/                 Next.js App Router routes
│   │   ├── page.tsx         EN homepage
│   │   ├── layout.tsx       Root layout (locale detection via x-pathname header)
│   │   ├── globals.css      Tailwind 4 + brand tokens
│   │   ├── robots.ts        SEO robots.txt
│   │   ├── sitemap.ts       SEO sitemap (EN + AR URLs)
│   │   ├── areas/           /areas + /areas/[slug]
│   │   ├── compounds/[slug] /compounds/[slug]
│   │   ├── developers/      /developers + /developers/[slug]
│   │   ├── properties/      /properties + /properties/[slug]
│   │   ├── new-launches/
│   │   └── ar/              Arabic mirror — same shape, RTL
│   ├── components/          Shared UI (cards, header, footer, mobile tabbar)
│   ├── fonts/               Magnetik OTF files (brand typeface)
│   └── lib/                 Utilities — data, format, i18n, supabase, fonts
├── public/                  Static assets served at /
├── scraper/                 Live data pipeline (Nawy → JSON → Supabase)
│   ├── scrape.mjs           Pull factual data from nawy's JSON API
│   ├── scrape-developers.mjs   Per-developer detail scrape
│   ├── scrape-compounds-ar.mjs Arabic compound names
│   ├── load-supabase.mjs    Push JSON → Supabase (needs service role key)
│   └── data/                4 JSON files consumed at runtime
├── scripts/                 One-off build helpers
│   ├── build-data-from-nawy.mjs  Assemble final JSON from raw scrape
│   └── process-logo.mjs     Crop/recolour the brand logo into favicons
├── supabase/
│   └── schema.sql           Run this in the Supabase SQL editor first
├── brand/                   The Deal Maker brand assets (PDFs, fonts, social)
├── docs/                    All documentation
├── middleware.ts            Sets `x-pathname` header for locale detection
├── next.config.ts           outputFileTracingIncludes bundles scraper/data/*.json
├── postcss.config.mjs       Tailwind 4 PostCSS plugin
└── tsconfig.json
```

---

## Data flow in detail

### 1. Scrape — nawy → JSON

`scraper/scrape.mjs` pages four public endpoints on `listing-api.nawy.com`:

| Endpoint                       | Pages until empty | What it gives us |
|--------------------------------|-------------------|------------------|
| `/v1/areas`                    | ~1 page           | 46 areas         |
| `/v1/developers`               | ~10 pages         | 391–517 developers |
| `/v1/search/compounds`         | ~36 pages         | 1,769 compounds  |
| `/v1/search/properties`        | ~380 pages        | ~19,000 units (filtered to ~5,961 primary) |

Concurrency 4, 120ms delay per worker, 7× exponential backoff on 429/5xx. Writes to `scraper/data/{areas,developers,compounds,units}.json`.

**Rule:** descriptions are NOT copied from nawy — only factual fields (names, prices, specs, payment plans, coordinates). Marketing copy is generated from facts in the UI to avoid Google duplicate-content penalty.

### 2. Load — JSON → Supabase

`scraper/load-supabase.mjs` reads the four JSON files and upserts into Supabase using the service role key. Requires:

```bash
SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from dashboard — never commit>
```

Slugs are normalized via the same `slugify()` function as `src/lib/data.ts` to keep URLs consistent.

### 3. Runtime — Next.js reads data

**Today (MVP):** `src/lib/data.ts` reads the JSON files at module init, builds typed in-memory stores + lookup maps (`areaById`, `compoundBySlug`, etc.), filters units to `sale_type === "primary"`. All pages call typed functions from this file.

**Target:** swap the `loadFile()` calls in `data.ts` to Supabase queries via `src/lib/supabase.ts`. Routes don't change.

### 4. Render — Next.js → user

- App Router with server components by default.
- `middleware.ts` sets `x-pathname` so the root layout can detect locale.
- `/ar/*` routes mirror the EN tree and use the same data + components, with `dir="rtl"` and Arabic strings from `src/lib/i18n.ts`.
- Vercel runs server components on edge functions; static assets served from CDN.

---

## Locale handling

```
Request → middleware.ts (sets x-pathname header)
         → app/layout.tsx (reads header, picks lang + dir)
         → routes under /ar/* use Arabic, others use English
```

Pages and components accept `locale: "en" | "ar"` and pass it down. UI strings live in `src/lib/i18n.ts` (`t(key, locale)` and `tpl(key, locale, vars)`). Data fields exist in both languages (`name` + `name_ar`, `title` + `title_ar`, etc.).

The language switcher (`src/components/site-header.tsx`) uses `switchLocaleHref()` from `src/lib/i18n.ts` to flip locale while preserving the current path.

---

## Why the architecture works this way

| Decision | Why |
|---|---|
| Scrape JSON, not HTML | Nawy's frontend already talks to a JSON API. ~430 paginated calls vs ~1,800 HTML pages. |
| Generate descriptions, don't copy | Google penalizes duplicate content. Verbatim clone wouldn't rank. |
| Bundle scraper/data/*.json into routes | MVP serves data without a database round-trip — fast cold starts on Vercel. |
| EN + AR as sibling route trees | Simpler than middleware-based locale routing for SEO; each URL is canonical and indexable. |
| RLS public-read on catalog tables | Browser can query Supabase directly with the anon key. `leads` is insert-only (no public read). |
| Magnetik via `next/font/local` | Self-hosted in `src/fonts/`, optimized + preloaded by Next without a Google Fonts round-trip. |

---

## Key files to know

| File | What it does |
|---|---|
| `src/lib/data.ts` | The single data access layer. Swap this to Supabase later. |
| `src/lib/i18n.ts` | UI string dictionary + locale helpers. |
| `src/lib/supabase.ts` | Browser/server Supabase client (anon key). |
| `src/lib/format.ts` | Price / date / number formatters. |
| `src/lib/fonts.ts` | Magnetik typeface wiring. |
| `src/app/layout.tsx` | Root layout — locale detection, header/footer/mobile-tabbar. |
| `src/app/sitemap.ts` | Dynamic sitemap (EN + AR). |
| `middleware.ts` | Sets `x-pathname` so server components see the request path. |
| `next.config.ts` | Bundles JSON data files into Vercel function bundles. |
| `supabase/schema.sql` | Database schema — run once in Supabase SQL editor. |

---

## Future direction

See `docs/ROADMAP.md` for milestones M0–M6. The high-impact next moves:

1. **M0** — Cut over `data.ts` from JSON to Supabase queries.
2. **M2** — Move images off nawy's CDN into Supabase Storage (WebP/AVIF).
3. **M3** — SEO landing pages (`/search/{type}-for-sale-in-{area}` — long-tail Google traffic).
4. **M4** — Deal badges and intent-based search (budget, monthly payment).
