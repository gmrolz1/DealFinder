# Data Model

Postgres schema reference. The source of truth is [`supabase/schema.sql`](../supabase/schema.sql) — run that in the Supabase SQL editor to create the tables. This doc is the human-readable companion.

Hierarchy: **Area → Developer → Compound → Unit (property)**

Catalog tables are keyed by `nawy_id` (integer from nawy.com — gives us idempotent upserts). `leads` uses uuid. The `*_nawy_id` foreign-reference columns are **not** FK-constrained because the scraped data has referential gaps; joins are done null-safely in the app.

---

## `areas`

```sql
nawy_id          bigint primary key
name             text not null
slug             text not null unique
image_url        text
compounds_count  int
properties_count int
created_at       timestamptz default now()
```

46 rows. The `slug` is normalized by `slugify()` (lowercase, hyphens, no special chars) — both the loader and `src/lib/data.ts` apply the same function to keep URLs consistent.

---

## `developers`

```sql
nawy_id          bigint primary key
name             text not null
slug             text not null unique
logo_url         text
min_price        numeric
compounds_count  int
properties_count int
established_year int
areas            text[]
about            text          -- generated, not scraped
faqs             jsonb         -- generated: [{q, a}, ...]
meta_title       text
meta_description text
created_at       timestamptz default now()
```

~517 rows. The `about`, `faqs`, `meta_title`, `meta_description` columns are **generated** from factual fields (not copied from nawy) — they power developer landing pages. The original schema added these via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so applying `schema.sql` is idempotent.

---

## `compounds`

```sql
nawy_id           bigint primary key
name              text not null
slug              text not null unique
area_nawy_id      bigint        -- logical ref → areas.nawy_id (no FK)
developer_nawy_id bigint        -- logical ref → developers.nawy_id (no FK)
lat               numeric
lng               numeric
image_url         text
subtitle          text
property_types    text[]
min_price         numeric
ready_by          bigint        -- e.g. 20291231 (YYYYMMDD as int)
created_at        timestamptz default now()
```

1,769 rows. `ready_by` is nawy's quirky format — see `formatReadyBy()` in `src/lib/format.ts`.

---

## `units` (primary / developer sale only)

```sql
nawy_id           bigint primary key
slug              text not null unique
title             text not null
subtitle          text
property_type     text          -- apartment, villa, townhouse, chalet...
compound_nawy_id  bigint        -- logical ref → compounds.nawy_id
area_nawy_id      bigint        -- logical ref → areas.nawy_id
developer_nawy_id bigint        -- logical ref → developers.nawy_id
bedrooms          int
bathrooms         int
area_sqm          numeric
finishing         text
ready_by          text
sale_type         text          -- 'primary' only (resale + nawy_now filtered out)
image_url         text
price             numeric
currency          text default 'EGP'
down_payment      numeric
installment_years numeric
created_at        timestamptz default now()
```

~5,961 rows (filtered from ~19,000 scraped — resale and Nawy Now units are dropped).

---

## `leads` (the revenue path)

```sql
id          uuid primary key default gen_random_uuid()
unit_nawy_id bigint
name        text not null
phone       text not null
email       text
message     text
created_at  timestamptz default now()
```

Insert-only from the browser (RLS policy below). Reads happen via the service role key only.

---

## Indexes

```sql
idx_units_area      on units(area_nawy_id)
idx_units_compound  on units(compound_nawy_id)
idx_units_developer on units(developer_nawy_id)
idx_units_filter    on units(property_type, bedrooms, price)   -- filtered search
idx_compounds_area  on compounds(area_nawy_id)
```

---

## Row Level Security

All tables have RLS enabled. Catalog tables are public-read; `leads` is public-insert only (no public read).

```sql
create policy "public read areas"      on areas      for select using (true);
create policy "public read developers" on developers for select using (true);
create policy "public read compounds"  on compounds  for select using (true);
create policy "public read units"      on units      for select using (true);
create policy "public insert leads"    on leads      for insert with check (true);
```

This means the browser can query catalog data directly with the publishable (anon) key. The service role key is only needed by the loader (`scraper/load-supabase.mjs`).

---

## TypeScript types

The app-side mirror lives in [`src/lib/data.ts`](../src/lib/data.ts) as `Area`, `Developer`, `Compound`, `Unit`, plus `EnrichedUnit` (a `Unit` joined with its area/compound/developer names).

If you change the schema, update **both**:

1. `supabase/schema.sql`
2. The types in `src/lib/data.ts`

And log the change in [`docs/LOG.md`](LOG.md).

---

## Bilingual fields

The Postgres schema currently stores EN values only. AR translations live in `scraper/data/{compounds,developers}.json` (as `name_ar`, `subtitle_ar`, etc.) and are exposed via the TypeScript types. Migrating these into Postgres is part of milestone M0/M1 in [ROADMAP.md](ROADMAP.md).
