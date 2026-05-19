# DealFinder — Master Plan

> A real-estate marketplace for the Egyptian market (MVP).
> Repo: https://github.com/gmrolz1/DealFinder

## Stack

| Layer        | Choice                          |
|--------------|---------------------------------|
| Language     | TypeScript                      |
| Framework    | Next.js (App Router) + React    |
| Styling      | Tailwind CSS + shadcn/ui        |
| Database     | Supabase (Postgres)             |
| Auth         | Supabase Auth                   |
| Storage      | Supabase Storage                |
| Hosting      | Vercel                          |
| Versioning   | GitHub (gmrolz1/DealFinder)     |
| i18n         | next-intl (EN now, AR later)    |

Supabase project ref: `nmrzefvdixmxmhmxojlv`

## Data strategy

Seed the database by scraping nawy.com's public network API.

- **Scrape (factual):** areas, developers, compounds, units — names, slugs,
  locations, coordinates, prices, unit specs, bedrooms, area (sqm),
  amenities, payment plans, delivery dates, relationships.
- **Generate, do NOT copy:** listing descriptions are auto-written from the
  factual fields. Reason: Google penalizes duplicate scraped content — a
  verbatim clone will not rank.
- **Photos:** sourced from developer marketing kits, not rehosted from
  nawy's CDN (copyright + hotlink-blocking risk).

## Phases

### Phase 0 — Setup  ✅ in progress
- [x] Scaffold Next.js app
- [x] Write planning docs
- [ ] Git init + first push to GitHub
- [ ] Connect Supabase MCP server + authenticate (see SETUP.md)
- [ ] Connect repo to Vercel

### Phase 1 — Database
- [x] Inspect nawy's network requests, map their API
- [x] Build the scraper (`/scraper`) — uses listing-api.nawy.com
- [x] Run scrape → 46 areas, 391 devs, 1,769 compounds, 18,934 units
- [ ] Define Postgres schema (see DATA-MODEL.md)
- [ ] Create tables in Supabase  ← needs Supabase MCP authenticated
- [ ] Loader script: scraped JSON → Supabase
- [ ] Generate fresh descriptions (done live in UI for now)

### Phase 2 — Core site
- [x] Property listing page + search/filters (type, area, price, bedrooms)
- [x] Property detail page
- [x] Homepage (Apple HIG design, mobile-first)
- [x] Compound pages (`/compounds/[slug]`)
- [x] Area index + area pages (`/areas`, `/areas/[slug]`)
- [x] Developer index + developer pages (`/developers`, `/developers/[slug]`)
- [x] New launches page
- [x] Data filtered to primary units only (no resale / Nawy Now)
- [ ] Static pages (about, contact, terms) — pending
- [ ] Search landing pages (SEO) — pending

### Phase 3 — Business
- [ ] Lead/contact form → Supabase
- [ ] Admin: add/edit listings
- [ ] SEO: sitemap, metadata, structured data

### Phase 4 — Polish & launch
- [ ] Arabic (RTL) via next-intl
- [ ] Maps (Mapbox)
- [ ] Deploy to production

## Out of scope for MVP
User accounts/favorites, finance products, mortgage tools, agent CRM.
