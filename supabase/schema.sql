-- DealFinder — Postgres schema (run in Supabase SQL editor)
-- Catalog tables are keyed by nawy_id; leads use uuid.
-- *_nawy_id columns are logical references (no FK constraints) — the
-- scraped data has referential gaps; joins are done null-safely in the app.

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
  established_year int,
  areas            text[],
  about            text,           -- generated, not scraped
  faqs             jsonb,          -- generated Q&A: [{q,a}, ...]
  meta_title       text,
  meta_description text,
  created_at       timestamptz default now()
);

-- Adds the developer-landing-page columns to an existing table.
alter table developers add column if not exists established_year int;
alter table developers add column if not exists areas            text[];
alter table developers add column if not exists about            text;
alter table developers add column if not exists faqs             jsonb;
alter table developers add column if not exists meta_title       text;
alter table developers add column if not exists meta_description text;

-- ── compounds ──────────────────────────────────────────────────────────
create table if not exists compounds (
  nawy_id           bigint primary key,
  name              text not null,
  slug              text not null unique,
  area_nawy_id      bigint,
  developer_nawy_id bigint,
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
  compound_nawy_id  bigint,
  area_nawy_id      bigint,
  developer_nawy_id bigint,
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
  unit_nawy_id bigint,
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
-- "public insert leads" policy REMOVED (lead-routing migration below): all
-- lead writes now go through the server-side assign_lead() RPC so rotation
-- and quota accounting can't be bypassed with the shipped anon key.

-- ═══════════════════════════════════════════════════════════════════════
-- LEAD ROUTING — clients, lead assignment, rotation (2026-07)
-- Conversions (WhatsApp/Call clicks, form submits, chat handoffs) are
-- recorded as leads and routed: pinned on a client's own landing page,
-- round-robin (least-counted) on shared marketplace pages. The dashboard
-- adjusts quota / order / active / phone / force_next live.
-- ═══════════════════════════════════════════════════════════════════════

-- ── clients (lead-routing brokers) ──────────────────────────────────────
create table if not exists clients (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,          -- 'map' | 'arabian-estate' | 'elite-homes'
  name           text not null,
  phone          text not null,                 -- E.164; used for both tel: and wa.me
  quota          int  not null default 5 check (quota >= 0),
  active         boolean not null default true,
  rotation_order int  not null default 100,     -- tie-break, lower = earlier
  force_next     boolean not null default false,-- dashboard "next lead goes here"; cleared on use
  landing_path   text,                          -- display hint, pin map lives in code
  created_at     timestamptz not null default now()
);
alter table clients enable row level security;  -- NO policies: service-role only
revoke all on clients from anon, authenticated;

insert into clients (slug, name, phone, quota, rotation_order, landing_path) values
  ('map',            'MAP Real Estate', '+201207171710', 5, 1, '/map'),
  ('arabian-estate', 'Arabian Estate',  '+201000000001', 5, 2, '/arabian-estate'),
  ('elite-homes',    'Elite Homes',     '+201000000002', 5, 3, '/elite-homes')
on conflict (slug) do nothing;

-- ── leads: extend for routing ───────────────────────────────────────────
-- Click-leads carry no name/phone; relax the original NOT NULLs.
alter table leads alter column name  drop not null;
alter table leads alter column phone drop not null;

alter table leads
  add column if not exists client_id   uuid references clients(id),
  add column if not exists source      text not null default 'form',
  add column if not exists status      text not null default 'new',
  add column if not exists pinned      boolean not null default false,
  add column if not exists session_id  text,
  add column if not exists page_path   text,
  add column if not exists locale      text,
  add column if not exists unit_title  text,   -- snapshot; catalog lives in local JSON
  add column if not exists utm         jsonb,  -- first-touch {src,med,cmp,term,cnt,gclid,lp,ts}
  add column if not exists gclid       text,
  add column if not exists meta        jsonb;  -- {sources:[...]} click-channel history

alter table leads drop constraint if exists leads_source_chk;
alter table leads add constraint leads_source_chk
  check (source in ('form','whatsapp','call','chat'));
alter table leads drop constraint if exists leads_status_chk;
alter table leads add constraint leads_status_chk
  check (status in ('new','contacted','junk'));

create index if not exists idx_leads_dedupe  on leads (session_id, created_at desc);
create index if not exists idx_leads_counted on leads (client_id) where status <> 'junk';
create index if not exists idx_leads_created on leads (created_at desc);

drop policy if exists "public insert leads" on leads;

-- ── rotation view — the ONE definition of "counted" ────────────────────
create or replace view client_rotation
with (security_invoker = on) as
select c.*, coalesce(lc.counted, 0) as counted_leads
from clients c
left join lateral (
  select count(*)::int as counted
  from leads l where l.client_id = c.id and l.status <> 'junk'
) lc on true;
revoke all on client_rotation from anon, authenticated;

-- ── atomic lead assignment ──────────────────────────────────────────────
-- One advisory lock serializes dedupe + rotation pick + insert. Rotation
-- state is computed (never stored) so junk-marking self-heals the counts.
create or replace function assign_lead(
  p_session_id   text,
  p_source       text,
  p_pinned_slug  text    default null,
  p_unit_nawy_id bigint  default null,
  p_unit_title   text    default null,
  p_page_path    text    default null,
  p_locale       text    default null,
  p_name         text    default null,
  p_phone        text    default null,
  p_email        text    default null,
  p_message      text    default null,
  p_utm          jsonb   default null,
  p_gclid        text    default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_lead   leads%rowtype;
  v_client clients%rowtype;
  v_pinned boolean := false;
begin
  if p_source not in ('form','whatsapp','call','chat') then
    raise exception 'invalid source: %', p_source;
  end if;

  -- Global critical section (xact-scoped: auto-released, pooling-safe).
  perform pg_advisory_xact_lock(hashtext('assign_lead'));

  -- 24h dedupe: same session + same unit bucket, ANY source. A follow-up
  -- form submit upgrades the click-lead instead of burning a second slot,
  -- and both channels resolve to the SAME client's number.
  if p_session_id is not null then
    select * into v_lead from leads l
    where l.session_id = p_session_id
      and coalesce(l.unit_nawy_id, -1) = coalesce(p_unit_nawy_id, -1)
      and l.created_at > now() - interval '24 hours'
    order by l.created_at desc limit 1;

    if found then
      update leads set
        name    = coalesce(leads.name,  p_name),
        phone   = coalesce(leads.phone, p_phone),
        email   = coalesce(leads.email, p_email),
        message = coalesce(leads.message, p_message),
        meta    = coalesce(leads.meta,'{}'::jsonb) || jsonb_build_object('sources',
                    coalesce(leads.meta->'sources', to_jsonb(array[leads.source]))
                    || to_jsonb(p_source))
      where id = v_lead.id;

      if v_lead.client_id is not null then
        select * into v_client from clients where id = v_lead.client_id;
      end if;
      return jsonb_build_object('lead_id', v_lead.id, 'deduped', true,
        'client', case when v_client.id is null then null else jsonb_build_object(
          'slug', v_client.slug, 'name', v_client.name, 'phone', v_client.phone) end);
    end if;
  end if;

  -- Pinned: a client's own landing traffic is always theirs (even over quota).
  if p_pinned_slug is not null then
    select * into v_client from clients where slug = p_pinned_slug and active;
    v_pinned := found;
  end if;

  -- Rotation: force_next first, then least counted, tie-break rotation_order.
  if v_client.id is null then
    select c.* into v_client
    from clients c join client_rotation cr on cr.id = c.id
    where c.active and cr.counted_leads < c.quota
    order by c.force_next desc, cr.counted_leads asc, c.rotation_order asc, c.id asc
    limit 1;                       -- no row → overflow: client_id stays null

    if v_client.id is not null and v_client.force_next then
      update clients set force_next = false where id = v_client.id;
    end if;
  end if;

  insert into leads (unit_nawy_id, name, phone, email, message, client_id,
    source, status, pinned, session_id, page_path, locale, unit_title, utm, gclid, meta)
  values (p_unit_nawy_id, p_name, p_phone, p_email, p_message, v_client.id,
    p_source, 'new', v_pinned, p_session_id, p_page_path, p_locale, p_unit_title,
    p_utm, p_gclid, jsonb_build_object('sources', to_jsonb(array[p_source])))
  returning * into v_lead;

  return jsonb_build_object('lead_id', v_lead.id, 'deduped', false,
    'client', case when v_client.id is null then null else jsonb_build_object(
      'slug', v_client.slug, 'name', v_client.name, 'phone', v_client.phone) end);
end $$;

-- Lock the RPC down: server (service role) only — otherwise anyone holding
-- the shipped anon key could drain quotas via PostgREST /rpc.
revoke execute on function assign_lead(text,text,text,bigint,text,text,text,text,text,text,text,jsonb,text)
  from public, anon, authenticated;
grant execute on function assign_lead(text,text,text,bigint,text,text,text,text,text,text,text,jsonb,text)
  to service_role;

-- ── ad spend (Google Ads API pull — Phase 7, table only) ────────────────
create table if not exists ad_spend (
  id           uuid primary key default gen_random_uuid(),
  day          date not null,
  source       text not null default 'google_ads',
  campaign_id  text,
  campaign     text,
  spend        numeric,
  currency     text default 'EGP',
  clicks       int,
  impressions  int,
  fetched_at   timestamptz not null default now(),
  unique (day, campaign_id, source)
);
alter table ad_spend enable row level security;
revoke all on ad_spend from anon, authenticated;
