# DealFinder — Growth Roadmap

> Goal: a fast, bilingual, SEO-strong property marketplace built around one
> idea — **finding the deal**. Not "browse listings" — *discover the best
> deal for your budget*.

## The product idea: "Find the deal"

Reframe the whole experience from a listings catalog into a deal-discovery
engine:

- Every unit shows **why it's a deal** — price per m², vs. area average,
  down-payment %, monthly installment, delivery date.
- Buyers search by **intent** (budget, monthly payment they can afford,
  move-in date) — not just by area/type.
- Curated **deal collections** ("Lowest down payment", "Ready to move",
  "Below area average", "Best price per m²").
- One clear, minimal call-to-action per screen.

---

## Milestones & priorities

Priority: **P0** = foundation, do first · **P1** = core value · **P2** = scale.

### M0 · Supabase foundation — P0
Move off the 15 MB in-memory JSON file onto a real database.
- Authenticate Supabase MCP (`docs/SETUP.md` steps 1–2) — *needs you*.
- Schema: `areas`, `developers`, `compounds`, `units`, `unit_images`,
  `leads`, `saved_searches` — with EN **and** AR fields.
- Loader script: scraped JSON → Postgres. Swap `data.ts` to query Supabase.
- **Why first:** unblocks data upgrade, images, i18n, leads, and a real
  Vercel deploy.

### M1 · Data upgrade (deep scrape) — P0
The current data is the *search API* (1 image, basic specs). Go deeper.
- Re-scrape per-compound / per-property detail: full specs, amenities,
  floor plans, **all image URLs**, payment plans, delivery dates,
  coordinates, and **EN + AR** names/slugs.
- Derive **deal signals**: price/m², delta vs. area average, down-payment %,
  installment years → a simple "deal score".
- **Why:** richer data powers better cards, SEO content, and the
  deal-finding angle.

### M2 · Images pipeline — P0/P1
Today images hot-link nawy's CDN — slow, fragile, and not ours.
- Download → store in **Supabase Storage** (or Cloudinary).
- Convert to **WebP/AVIF**, generate multiple sizes + blur placeholders.
- Use `next/image`; add galleries on detail pages.
- **Note:** listing photos are the developers' / nawy's IP — plan to
  replace them with **developer marketing kits** before public launch.
- **Why:** image weight is the #1 Core Web Vitals factor — and CWV is a
  Google ranking signal.

### M3 · SEO structure — P1
- Clean URL structure + canonical URLs; breadcrumbs.
- Per-page metadata (title/description), OpenGraph/Twitter cards.
- **Structured data (JSON-LD):** `RealEstateListing`, `Residence`,
  `BreadcrumbList`, `Organization` — rich results in Google.
- Dynamic `sitemap.xml` + `robots.txt`.
- **SEO landing pages:** `/search/{type}-for-sale-in-{area}` — hundreds of
  long-tail pages (nawy has ~400). Biggest organic-traffic lever.
- Strong internal linking (area ↔ compound ↔ developer ↔ unit).
- **Why:** organic traffic — the core "attract people" goal.

### M4 · Cards, CTA & deal-finding UX — P1
- Redesign property cards: payment-plan-forward, **deal badges**
  ("12% below area avg", "5% down", "Ready 2026").
- **Minimalist CTA discipline:** one primary action per surface
  (`VIEW DEAL`, `REQUEST A CALLBACK`) — no clutter.
- Intent-based search (budget / monthly installment / delivery).
- Deal collections on the homepage; cleaner navigation & filters.
- **Why:** conversion + the brand concept made real.

### M5 · Bilingual EN / AR — P1/P2
- `next-intl` with locale routing (`/` and `/ar`), full **RTL** support.
- Translate UI strings; use AR names/slugs from the M1 data.
- `hreflang` tags — doubles the SEO surface for a bilingual market.
- **Why:** the Egyptian market is bilingual; Arabic is most users' default.

### M6 · SEM & analytics — P2
- GA4 + Google Tag Manager; conversion events (lead, call, WhatsApp).
- Working lead capture → Supabase → notification.
- Paid-campaign landing pages; performance pass (Core Web Vitals green).
- **Why:** measure, then run ads with confidence.

---

## Recommended sequence

```
M0 ─► M1 ─► M2 ─► M3 ─┐
                      ├─► M4  (UX can overlap M3)
                      └─► M5 ─► M6
```

**Do now:** M0 (Supabase) — everything else depends on it.
**Blocked on you:** authenticating the Supabase MCP server.
