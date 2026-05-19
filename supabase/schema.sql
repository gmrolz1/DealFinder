-- DealFinder — Postgres schema (run in Supabase SQL editor)
-- Catalog tables are keyed by nawy_id; leads/saved_searches use uuid.

-- ── areas ──────────────────────────────────────────────────────────────
create table if not exists areas (
  nawy_id          bigint primary key,
  name             text not null,
  slug             text not null unique,
  image_url        text,
  compounds_count  int,
  properties_count int,
  created_at       timestamptz default now()
);

-- ── developers ─────────────────────────────────────────────────────────
create table if not exists developers (
  nawy_id          bigint primary key,
  name             text not null,
  slug             text not null unique,
  logo_url         text,
  min_price        numeric,
  compounds_count  int,
  properties_count int,
  created_at       timestamptz default now()
);

-- ── compounds ──────────────────────────────────────────────────────────
create table if not exists compounds (
  nawy_id           bigint primary key,
  name              text not null,
  slug              text not null unique,
  area_nawy_id      bigint references areas(nawy_id),
  developer_nawy_id bigint references developers(nawy_id),
  lat               numeric,
  lng               numeric,
  image_url         text,
  subtitle          text,
  property_types    text[],
  min_price         numeric,
  ready_by          bigint,
  created_at        timestamptz default now()
);

-- ── units (primary/developer sale only) ────────────────────────────────
create table if not exists units (
  nawy_id           bigint primary key,
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  property_type     text,
  compound_nawy_id  bigint references compounds(nawy_id),
  area_nawy_id      bigint references areas(nawy_id),
  developer_nawy_id bigint references developers(nawy_id),
  bedrooms          int,
  bathrooms         int,
  area_sqm          numeric,
  finishing         text,
  ready_by          text,
  sale_type         text,
  image_url         text,
  price             numeric,
  currency          text default 'EGP',
  down_payment      numeric,
  installment_years numeric,
  created_at        timestamptz default now()
);

-- ── leads (contact-form submissions — the revenue path) ────────────────
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  unit_nawy_id bigint references units(nawy_id),
  name        text not null,
  phone       text not null,
  email       text,
  message     text,
  created_at  timestamptz default now()
);

-- ── indexes for filtered search ────────────────────────────────────────
create index if not exists idx_units_area      on units(area_nawy_id);
create index if not exists idx_units_compound  on units(compound_nawy_id);
create index if not exists idx_units_developer on units(developer_nawy_id);
create index if not exists idx_units_filter    on units(property_type, bedrooms, price);
create index if not exists idx_compounds_area  on compounds(area_nawy_id);

-- ── row level security ─────────────────────────────────────────────────
-- Catalog: public read. Leads: public insert only (no read).
alter table areas      enable row level security;
alter table developers enable row level security;
alter table compounds  enable row level security;
alter table units      enable row level security;
alter table leads      enable row level security;

create policy "public read areas"      on areas      for select using (true);
create policy "public read developers" on developers for select using (true);
create policy "public read compounds"  on compounds  for select using (true);
create policy "public read units"      on units      for select using (true);
create policy "public insert leads"    on leads      for insert with check (true);
