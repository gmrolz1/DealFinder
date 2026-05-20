# supabase/

Database schema for the Supabase project (`nmrzefvdixmxmhmxojlv`).

| File | Purpose |
|---|---|
| `schema.sql` | Full Postgres schema: tables, indexes, RLS policies. Idempotent — uses `create table if not exists` and `add column if not exists`. |

## First-time setup

1. Open the Supabase SQL editor: https://supabase.com/dashboard/project/nmrzefvdixmxmhmxojlv/sql
2. Paste the contents of `schema.sql`.
3. Run.
4. Verify in the Table Editor: `areas`, `developers`, `compounds`, `units`, `leads` exist with RLS enabled (globe icon).

## Populate with data

After the schema is in place, run the loader from the repo root:

```bash
# Set service role key (fetch from Supabase → Settings → API Keys → Secret keys)
SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co \
SUPABASE_KEY=<service role key> \
node scraper/load-supabase.mjs
```

## Schema reference

See [`docs/DATA-MODEL.md`](../docs/DATA-MODEL.md) for a human-readable walkthrough of each table, indexes, and RLS policies.

## Changing the schema

1. Edit `schema.sql`. Prefer additive changes (`add column if not exists`) so the script stays idempotent.
2. Apply via the Supabase SQL editor.
3. Update the TypeScript types in `src/lib/data.ts` to match.
4. Update `docs/DATA-MODEL.md`.
5. Log the change in `docs/LOG.md`.

This project does not currently use Supabase migrations (`supabase migration new`). If we adopt them, the existing `schema.sql` becomes the baseline migration.

## Row Level Security

Catalog tables (`areas`, `developers`, `compounds`, `units`) are **public-read**. The browser queries them directly with the publishable (anon) key. `leads` is **insert-only** from the public — reads happen via the service role key only.

Don't disable RLS without a discussion — it's the difference between safe and unsafe to ship a key to the browser.
