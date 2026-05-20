# scraper/

The live data pipeline: pull data from nawy.com's public JSON API, normalize, write to `data/`, then load into Supabase.

```
scraper/
├── scrape.mjs              Pull factual data from listing-api.nawy.com
├── scrape-developers.mjs   Per-developer detail scrape (logos, established year, areas)
├── scrape-compounds-ar.mjs Arabic compound names + slugs
├── load-supabase.mjs       Upsert scraper/data/*.json → Supabase
└── data/                   Output — 4 JSON files (committed; everything else gitignored)
    ├── areas.json
    ├── developers.json
    ├── compounds.json
    └── units.json
```

## Re-scrape

```bash
node scraper/scrape.mjs                    # full scrape (~2 min)
node scraper/scrape.mjs --limit 3          # smoke test (3 pages of each endpoint)
node scraper/scrape-developers.mjs         # developer detail
node scraper/scrape-compounds-ar.mjs       # AR compound names
```

Concurrency is 4, 120ms delay per worker, 7× exponential backoff on 429/5xx. Gentle on nawy's API.

## Load into Supabase

```bash
# Windows PowerShell
$env:SUPABASE_URL="https://nmrzefvdixmxmhmxojlv.supabase.co"
$env:SUPABASE_KEY="<service role key — fetch from Supabase dashboard, never commit>"
node scraper/load-supabase.mjs

# macOS / Linux
SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co \
SUPABASE_KEY=<service role key> \
node scraper/load-supabase.mjs
```

The loader dedupes by `nawy_id` (Postgres upserts reject in-batch dupes), normalizes slugs with the same `slugify()` used by `src/lib/data.ts`, and upserts in batches of ~500.

## Hard rules

- **Never copy nawy's marketing descriptions.** Only factual fields (names, prices, specs, payment plans, coordinates). Marketing copy is generated in the app from these facts.
- **Throttle politely.** If 429s appear, lower `CONCURRENCY` and raise `REQ_DELAY` in `scrape.mjs`.
- **Never hard-code the service role key.** Read from env. The key never enters the repo.
- **`scraper/data/*.json` are the 4 files the app reads at runtime.** Only those four are committed; everything else under `scraper/data/` (backups, intermediate scrapes, dev-id lists) is git-ignored by `.gitignore`.

## scraper vs scripts

- **`scraper/`** = live data ops (talks to nawy + Supabase).
- **`scripts/`** = one-off build helpers (assemble data from a local raw scrape, process the logo). See `scripts/README.md`.
