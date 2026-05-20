# src/lib/

Utility modules. Each file has one clear responsibility.

| File | Purpose |
|---|---|
| `data.ts` | **The data access layer.** Reads `scraper/data/*.json`, builds typed in-memory stores + lookup maps, exposes the typed query functions used by every page. Will be swapped to Supabase queries (only this file changes). |
| `supabase.ts` | Browser/server-safe Supabase client (anon key — RLS gated). Use this when reading from Supabase directly. |
| `i18n.ts` | EN/AR string dictionary + locale helpers (`localeFromPath`, `localizedPath`, `switchLocaleHref`, `t`, `tpl`). |
| `format.ts` | Display formatters — `formatPrice`, `formatFull`, `formatNumber`, `formatReadyBy`. |
| `fonts.ts` | Wires Magnetik OTF files (`src/fonts/*.otf`) via `next/font/local`. Don't import OTF files anywhere else. |

## Rules

- **No React in this folder.** Utilities are framework-agnostic where possible (only `fonts.ts` imports Next.js helpers).
- **Pages and components consume `lib/*` — never the reverse.** `lib/` does not import from `components/` or `app/`.
- **Add types here** for shared domain models (`Area`, `Developer`, `Compound`, `Unit`, `EnrichedUnit`). They live in `data.ts` today.

## Adding a new utility

1. Single-purpose file. If you're tempted to add a second responsibility, make a second file.
2. Name it `kebab-case.ts`.
3. Export named functions / types. Avoid default exports.
4. If it adds a new UI string, that string goes in `i18n.ts` (not in the utility).
