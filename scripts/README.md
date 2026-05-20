# scripts/

One-off build / asset helpers. Not part of the runtime app, not part of the live scrape pipeline.

| File | Purpose |
|---|---|
| `build-data-from-nawy.mjs` | Assemble final `scraper/data/{areas,developers,compounds,units}.json` from a raw local scrape sitting in `nawy data/` plus per-developer detail. One-off — used when re-building the canonical dataset. |
| `process-logo.mjs` | Crop the supplied `public/logo.png` (white mark on transparent) into tight black + white marks and a favicon. Run once when the brand mark changes. |

## When to use scripts/ vs scraper/

| | scraper/ | scripts/ |
|---|---|---|
| Hits the network? | Yes (nawy.com + Supabase) | No |
| Run frequency | Repeatable — re-scrape any time | One-off — when input changes |
| Output | `scraper/data/*.json` + Supabase rows | Built JSON, processed assets |
| Idempotent? | Yes (upserts) | Mostly (overwrites outputs) |

If you find yourself adding a script that hits the network for live data, it belongs in `scraper/`. If it's a local data assembly or asset transform, it belongs here.

## Conventions

- ESM modules (`.mjs`), Node 22+.
- Top-of-file comment block describing what the script does, what it expects to find on disk, and how to run it.
- Idempotent where possible. Print what you changed.
