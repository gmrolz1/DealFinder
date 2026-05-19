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
- [ ] Inspect nawy's network requests, map their API
- [ ] Define Postgres schema (see DATA-MODEL.md)
- [ ] Create tables in Supabase
- [ ] Build the scraper (`/scraper`)
- [ ] Run scrape → load areas, developers, compounds, units
- [ ] Generate fresh descriptions

### Phase 2 — Core site
- [ ] Property listing page
- [ ] Search + filters (type, area, price, bedrooms)
- [ ] Compound pages
- [ ] Area pages
- [ ] Developer pages

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
