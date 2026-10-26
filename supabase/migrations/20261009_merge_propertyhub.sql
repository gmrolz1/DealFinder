-- Merge PropertyHub into the catalogue (Omar, 2026-10-09: "do the merge", option A).
--
-- Nawy stays the base. Publish (public.promote_to_site) now runs sync.merge_propertyhub()
-- right after the Nawy promote:
--   * PropertyHub project -> catalogue compound by name (sync.ph_compound_map; locked rows = manual).
--   * Same unit on both (same compound + same unit code):
--       price gap <= merge_auto_pct (10%)  -> the newer source wins (PH price written, price_source='propertyhub')
--       price gap  > merge_auto_pct        -> Nawy price stays, a conflict waits in sync.conflicts
--       a human decision (sync.price_overrides / resolved conflict with the same prices) is never redone
--   * Unit only on PropertyHub -> added to public.units (source='propertyhub', id 93xxxxxxxx from
--     sync.ph_unit_ids) when the compound has no live Nawy units OR >= merge_min_code_overlap (20%)
--     of its PH unit codes match Nawy codes. Below that the two sites write codes differently and
--     adding them would duplicate the project (Talala: 879 PH vs 872 Nawy, 0 shared codes).
--   * public.units.live = what is on sale now (Nawy: listed PRIMARY on Nawy; PH: in the last merge).
--     PH units that disappear are set live=false and logged in sync.changes, never deleted.
-- Also fixes inv_resolve_conflicts / inv_conflicts (they looked units up by Nawy's INTERNAL id),
-- and closes public.promote_to_site to anon/authenticated.

-- ── 0. backups ─────────────────────────────────────────────────────────────
create table if not exists sync.bak_20261009_units as select * from public.units;
create table if not exists sync.bak_20261009_conflicts as select * from sync.conflicts;
create table if not exists sync.bak_20261009_price_overrides as select * from sync.price_overrides;
create table if not exists sync.bak_20261009_compounds as select * from public.compounds;
alter table sync.bak_20261009_units enable row level security;
alter table sync.bak_20261009_conflicts enable row level security;
alter table sync.bak_20261009_price_overrides enable row level security;
alter table sync.bak_20261009_compounds enable row level security;

-- ── 1. catalogue columns ───────────────────────────────────────────────────
alter table public.units
  add column if not exists source text not null default 'nawy',
  add column if not exists ph_unit_id text,
  add column if not exists price_source text,
  add column if not exists live boolean not null default true;
create unique index if not exists units_ph_unit_id_key on public.units (ph_unit_id) where ph_unit_id is not null;
create index if not exists idx_units_live_compound on public.units (compound_nawy_id) where live;
comment on column public.units.source is 'nawy | propertyhub — who listed the unit';
comment on column public.units.price_source is 'nawy | propertyhub (auto, newer within merge_auto_pct) | desk (human decision)';
comment on column public.units.live is 'on sale now: Nawy rows = listed PRIMARY on Nawy; PH rows = in the last merge. Set by sync.merge_propertyhub()';

-- Nawy rows: same rule the site and compound_profile used until now
update public.units u set live = x.l
from (select u2.nawy_id,
             exists (select 1 from nawy.units n where n.nawy_id = u2.nawy_id and n.sale_type = 'primary') l
      from public.units u2) x
where x.nawy_id = u.nawy_id and u.live is distinct from x.l;

-- ── 2. id map + project map + settings ─────────────────────────────────────
create sequence if not exists sync.ph_unit_id_seq start 9300000000;
create table if not exists sync.ph_unit_ids (
  ph_unit_id text primary key,
  unit_id bigint not null unique default nextval('sync.ph_unit_id_seq'),
  created_at timestamptz not null default now()
);
create table if not exists sync.ph_compound_map (
  ph_project_id text primary key,
  ph_project_name text,
  compound_nawy_id bigint,
  method text not null,               -- name | name_multi | none | manual
  locked boolean not null default false, -- true = set by a person, the merge never overwrites it
  ph_units int, matched int, nawy_units int, code_overlap numeric, merge_ok boolean,
  updated_at timestamptz not null default now()
);
alter table sync.ph_unit_ids enable row level security;
alter table sync.ph_compound_map enable row level security;
revoke all on sync.ph_unit_ids, sync.ph_compound_map from anon, authenticated;
revoke all on sequence sync.ph_unit_id_seq from anon, authenticated;

insert into sync.config (k, v) values ('merge_auto_pct', '0.10'), ('merge_min_code_overlap', '0.20')
on conflict (k) do nothing;

-- ── 3. the merge ───────────────────────────────────────────────────────────
create or replace function sync.merge_propertyhub()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'sync', 'pg_temp'
as $fn$
declare
  t0 timestamptz := clock_timestamp();
  pct numeric := coalesce((select v::numeric from sync.config where k = 'merge_auto_pct'), 0.10);
  min_ov numeric := coalesce((select v::numeric from sync.config where k = 'merge_min_code_overlap'), 0.20);
  run_id bigint;
  n_ph int; n_pairs int; n_same int; n_auto_ph int; n_auto_nawy int; n_review int; n_overridden int;
  n_closed int; n_closed_gone int; n_opened int; n_added int; n_updated int; n_off int;
  n_proj_ok int; n_proj_skip int; n_units_skip int; n_unmapped int;
begin
  if not exists (select 1 from propertyhub.units limit 1) then
    return jsonb_build_object('skipped', 'propertyhub mirror is empty');
  end if;

  insert into sync.runs (source, started_at, status) values ('ph_merge', t0, 'running') returning id into run_id;

  -- 1. PH project -> catalogue compound (by normalised name; duplicates -> the one with most units)
  with nm as (
    select public.norm_key(c.name) k, c.nawy_id cid,
           (select count(*) from public.units u where u.compound_nawy_id = c.nawy_id) uc,
           count(*) over (partition by public.norm_key(c.name)) n
    from public.compounds c),
  pick as (select distinct on (k) k, cid, n from nm order by k, uc desc, cid)
  insert into sync.ph_compound_map as m (ph_project_id, ph_project_name, compound_nawy_id, method, updated_at)
  select p.id, p.name, pick.cid,
         case when pick.cid is null then 'none' when pick.n > 1 then 'name_multi' else 'name' end, now()
  from propertyhub.projects p
  left join pick on pick.k = public.norm_key(p.name)
  on conflict (ph_project_id) do update
    set ph_project_name = excluded.ph_project_name, compound_nawy_id = excluded.compound_nawy_id,
        method = excluded.method, updated_at = now()
  where not m.locked;

  -- 2. PH units we can place: real availabilities with a code and a price, one per compound+code (newest)
  drop table if exists _ph;
  create temp table _ph on commit drop as
  select distinct on (m.compound_nawy_id, public.norm_key(u.apartment_code))
         u.id ph_id, m.compound_nawy_id cid, public.norm_key(u.apartment_code) code, u.apartment_code,
         u.project_id, u.price_total_min price, coalesce(u.created_at_source, u.last_seen_at) ph_at,
         u.unit_type, u.finishing_specs, u.bedrooms, u.bathrooms, u.area_general_min area,
         u.area_garden_min garden, u.delivery_date_months dm
  from propertyhub.units u
  join sync.ph_compound_map m on m.ph_project_id = u.project_id and m.compound_nawy_id is not null
  where u.data_type = 'availability' and coalesce(u.apartment_code, '') <> ''
    and u.price_total_min > 0 and not coalesce(u.hidden, false)
  order by m.compound_nawy_id, public.norm_key(u.apartment_code), coalesce(u.created_at_source, u.last_seen_at) desc nulls last;
  get diagnostics n_ph = row_count;
  create index on _ph (cid, code);

  select count(*) into n_unmapped
  from propertyhub.units u
  join sync.ph_compound_map m on m.ph_project_id = u.project_id and m.compound_nawy_id is null
  where u.data_type = 'availability';

  -- 3. Nawy live flag + live Nawy units with a code
  update public.units u set live = x.l
  from (select u2.nawy_id,
               exists (select 1 from nawy.units n where n.nawy_id = u2.nawy_id and n.sale_type = 'primary') l
        from public.units u2 where u2.source = 'nawy') x
  where x.nawy_id = u.nawy_id and u.live is distinct from x.l;

  drop table if exists _nw;
  create temp table _nw on commit drop as
  select u.nawy_id, n.id internal_id, u.compound_nawy_id cid, public.norm_key(u.unit_code) code,
         n.price nprice, n.last_inventory_update n_at, u.area_sqm,
         public.norm_key(n.compound_name || '|' || coalesce(n.unit_id, '')) mkey
  from public.units u
  join nawy.units n on n.nawy_id = u.nawy_id and n.sale_type = 'primary'
  where u.source = 'nawy' and coalesce(u.unit_code, '') <> '';
  create index on _nw (cid, code);

  -- 4. the same unit on both sites
  drop table if exists _pair;
  create temp table _pair on commit drop as
  select w.nawy_id, w.internal_id, w.mkey, w.nprice, w.n_at, w.area_sqm,
         p.ph_id, p.price pprice, p.ph_at,
         case when coalesce(w.nprice, 0) <= 0 then null
              else abs(w.nprice - p.price) / greatest(w.nprice, p.price) end diff,
         (p.ph_at is not null and (w.n_at is null or p.ph_at > w.n_at)) ph_newer,
         exists (select 1 from sync.price_overrides o where o.unit_id = w.internal_id) has_override
  from _nw w join _ph p on p.cid = w.cid and p.code = w.code;
  get diagnostics n_pairs = row_count;

  -- price_source for every live Nawy row (promote already wrote the Nawy / override price this run)
  update public.units u set price_source = case when o.unit_id is not null then 'desk' else 'nawy' end
  from nawy.units n left join sync.price_overrides o on o.unit_id = n.id
  where u.source = 'nawy' and n.nawy_id = u.nawy_id
    and u.price_source is distinct from case when o.unit_id is not null then 'desk' else 'nawy' end;

  select count(*) filter (where not has_override and coalesce(diff, 0) = 0),
         count(*) filter (where not has_override and diff > 0 and diff <= pct and ph_newer),
         count(*) filter (where not has_override and diff > 0 and diff <= pct and not ph_newer),
         count(*) filter (where not has_override and diff > pct),
         count(*) filter (where has_override)
    into n_same, n_auto_ph, n_auto_nawy, n_review, n_overridden
  from _pair;

  -- small gap + PH newer -> PH price
  update public.units u
     set price = p.pprice, price_source = 'propertyhub',
         price_per_meter = case when u.area_sqm > 0 then round(p.pprice / u.area_sqm) else u.price_per_meter end
  from _pair p
  where u.nawy_id = p.nawy_id and not p.has_override and p.diff > 0 and p.diff <= pct and p.ph_newer;

  -- open conflicts the rule just decided -> closed
  with cl as (
    update sync.conflicts k
       set resolved_at = now(), resolved_by = 'merge',
           resolution = case when p.ph_newer then 'auto:propertyhub' else 'auto:nawy' end
    from _pair p
    where k.resolved_at is null and k.field = 'price'
      and k.nawy_unit_id = p.internal_id and k.ph_unit_id = p.ph_id
      and (p.diff is null or p.diff <= pct)
    returning 1)
  select count(*) into n_closed from cl;

  -- open conflicts whose unit left either site -> closed
  with cl as (
    update sync.conflicts k set resolved_at = now(), resolved_by = 'merge', resolution = 'auto:gone'
    where k.resolved_at is null and k.field = 'price'
      and (not exists (select 1 from nawy.units n where n.id = k.nawy_unit_id)
           or not exists (select 1 from propertyhub.units pu where pu.id = k.ph_unit_id))
    returning 1)
  select count(*) into n_closed_gone from cl;

  -- big gap -> one open conflict, unless a person already decided on these exact prices
  with ins as (
    insert into sync.conflicts (match_key, nawy_unit_id, ph_unit_id, field, nawy_value, ph_value)
    select distinct on (p.mkey) p.mkey, p.internal_id, p.ph_id, 'price',
           jsonb_build_object('price', p.nprice), jsonb_build_object('price', p.pprice)
    from _pair p
    where p.diff > pct and not p.has_override
      and not exists (
        select 1 from sync.conflicts k
        where k.field = 'price' and k.match_key = p.mkey
          and (k.resolved_at is null
               or ((k.nawy_value->>'price')::numeric = p.nprice and (k.ph_value->>'price')::numeric = p.pprice)))
    order by p.mkey, p.diff desc
    on conflict (match_key, field) where resolved_at is null do nothing
    returning 1)
  select count(*) into n_opened from ins;

  -- 5. per-compound code overlap -> may we add PH-only units here?
  drop table if exists _proj;
  create temp table _proj on commit drop as
  select p.cid,
         count(*) ph_n,
         count(*) filter (where exists (select 1 from _nw w where w.cid = p.cid and w.code = p.code)) matched,
         (select count(*) from public.units u where u.compound_nawy_id = p.cid and u.source = 'nawy' and u.live) nawy_n
  from _ph p group by p.cid;
  alter table _proj add column ok boolean;
  update _proj set ok = (nawy_n = 0 or matched::numeric / ph_n >= min_ov);

  update sync.ph_compound_map m
     set ph_units = j.ph_n, matched = j.matched, nawy_units = j.nawy_n,
         code_overlap = round(j.matched::numeric / nullif(j.ph_n, 0), 3), merge_ok = j.ok
  from _proj j where j.cid = m.compound_nawy_id;
  update sync.ph_compound_map set ph_units = null, matched = null, nawy_units = null, code_overlap = null, merge_ok = null
  where compound_nawy_id is null or compound_nawy_id not in (select cid from _proj);

  select count(*) filter (where ok), count(*) filter (where not ok),
         coalesce(sum(ph_n - matched) filter (where not ok), 0)
    into n_proj_ok, n_proj_skip, n_units_skip
  from _proj;

  -- 6. PH-only units -> catalogue
  drop table if exists _new;
  create temp table _new on commit drop as
  select p.* from _ph p join _proj j on j.cid = p.cid and j.ok
  where not exists (select 1 from _nw w where w.cid = p.cid and w.code = p.code);

  insert into sync.ph_unit_ids (ph_unit_id) select ph_id from _new on conflict (ph_unit_id) do nothing;

  with up as (
    insert into public.units (nawy_id, slug, title, subtitle, property_type, compound_nawy_id, area_nawy_id,
      developer_nawy_id, bedrooms, bathrooms, area_sqm, finishing, ready_by, sale_type, image_url, price,
      currency, unit_code, garden_area, delivery_date, price_per_meter, inventory_updated_at,
      source, ph_unit_id, price_source, live)
    select i.unit_id,
           public.slugify(c.name) || '-' || i.unit_id,
           c.name || ' — ' || n.apartment_code,
           initcap(n.unit_type),
           case
             when n.unit_type in ('apartment') then 'Apartment'
             when n.unit_type in ('chalet') then 'Chalet'
             when n.unit_type in ('standalone', 's villa', 'i villa', 'villa', 'twin villa') then 'Villa'
             when n.unit_type like 'townhouse%' then 'Townhouse'
             when n.unit_type in ('twinhouse', 'twin house') then 'Twinhouse'
             when n.unit_type = 'duplex' then 'Duplex'
             when n.unit_type = 'penthouse' then 'Penthouse'
             when n.unit_type in ('shop', 'retail', 'kiosk') then 'Retail'
             when n.unit_type in ('office', 'administrative') then 'Administrative'
             when n.unit_type in ('clinic', 'medical', 'pharmacy') then 'Medical'
             when n.unit_type = 'studio' then 'Studio'
             when n.unit_type = 'cabin' then 'Cabin'
             when n.unit_type = 'loft' then 'Loft'
             else initcap(n.unit_type)
           end,
           c.nawy_id, c.area_nawy_id, c.developer_nawy_id,
           n.bedrooms::int, n.bathrooms::int, n.area,
           case
             when n.finishing_specs like 'fully finished%' then 'finished'
             when n.finishing_specs = 'core and shell' then 'not_finished'
             when n.finishing_specs = 'semi finished' then 'semi_finished'
             when n.finishing_specs = 'flexi' then 'flexi_finished'
             when n.finishing_specs = 'fully furnished' then 'furnished'
             else n.finishing_specs
           end,
           case when n.dm between 0 and 240 and n.ph_at is not null
                then to_char(n.ph_at + make_interval(months => n.dm::int), 'YYYY') end,
           'primary',
           coalesce(pr.thumbnail_url, c.image_url),
           n.price, 'EGP', n.apartment_code, nullif(n.garden, 0),
           case when n.dm between 0 and 240 and n.ph_at is not null
                then (n.ph_at + make_interval(months => n.dm::int))::date end,
           case when n.area > 0 then round(n.price / n.area) end,
           n.ph_at, 'propertyhub', n.ph_id, 'propertyhub', true
    from _new n
    join sync.ph_unit_ids i on i.ph_unit_id = n.ph_id
    join public.compounds c on c.nawy_id = n.cid
    left join propertyhub.projects pr on pr.id = n.project_id
    on conflict (nawy_id) do update set
      title = excluded.title, subtitle = excluded.subtitle, property_type = excluded.property_type,
      compound_nawy_id = excluded.compound_nawy_id, area_nawy_id = excluded.area_nawy_id,
      developer_nawy_id = excluded.developer_nawy_id, bedrooms = excluded.bedrooms,
      bathrooms = excluded.bathrooms, area_sqm = excluded.area_sqm, finishing = excluded.finishing,
      ready_by = excluded.ready_by, image_url = coalesce(excluded.image_url, public.units.image_url),
      price = excluded.price, unit_code = excluded.unit_code, garden_area = excluded.garden_area,
      delivery_date = excluded.delivery_date, price_per_meter = excluded.price_per_meter,
      inventory_updated_at = excluded.inventory_updated_at, price_source = 'propertyhub', live = true
    where public.units.source = 'propertyhub'
    returning (xmax = 0) inserted, nawy_id, ph_unit_id)
  , logged as (
    insert into sync.changes (run_id, source, entity_type, entity_id, action, after, changed_at)
    select run_id, 'ph_merge', 'unit', nawy_id::text, 'added', jsonb_build_object('ph_unit_id', ph_unit_id), now()
    from up where inserted
    returning 1)
  select count(*) filter (where inserted), count(*) filter (where not inserted)
    into n_added, n_updated
  from up;

  -- PH units no longer placeable -> off the market (kept, logged)
  with off as (
    update public.units u set live = false
    where u.source = 'propertyhub' and u.live
      and not exists (select 1 from _new n where n.ph_id = u.ph_unit_id)
    returning u.nawy_id, u.ph_unit_id)
  , logged as (
    insert into sync.changes (run_id, source, entity_type, entity_id, action, before, changed_at)
    select run_id, 'ph_merge', 'unit', nawy_id::text, 'removed', jsonb_build_object('ph_unit_id', ph_unit_id), now()
    from off returning 1)
  select count(*) into n_off from off;

  -- 7. counts on what is on sale now
  update public.developers set properties_count = 0 where true;
  update public.areas set properties_count = 0 where true;
  update public.developers d set properties_count = s.cnt, min_price = s.mp
  from (select developer_nawy_id, count(*) cnt, min(price) filter (where price > 0) mp
        from public.units where live and developer_nawy_id is not null group by 1) s
  where d.nawy_id = s.developer_nawy_id;
  update public.areas a set properties_count = s.cnt
  from (select area_nawy_id, count(*) cnt from public.units where live and area_nawy_id is not null group by 1) s
  where a.nawy_id = s.area_nawy_id;
  update public.compounds c set min_price = s.mp
  from (select compound_nawy_id, min(price) mp from public.units where live and price > 0 group by 1) s
  where c.nawy_id = s.compound_nawy_id and c.min_price is null;

  update sync.runs set finished_at = now(), status = 'ok',
         duration_ms = extract(milliseconds from clock_timestamp() - t0)::int,
         rows_seen = n_ph, rows_added = n_added, rows_removed = n_off, rows_changed = n_auto_ph,
         notes = format('pairs %s · same %s · PH price %s · Nawy kept %s · review %s (new %s) · desk %s · added %s · off %s · projects ok %s / skipped %s (%s units) · unmapped units %s',
                        n_pairs, n_same, n_auto_ph, n_auto_nawy, n_review, n_opened, n_overridden,
                        n_added, n_off, n_proj_ok, n_proj_skip, n_units_skip, n_unmapped)
  where id = run_id;

  return jsonb_build_object(
    'run_id', run_id, 'ph_units_placeable', n_ph, 'pairs', n_pairs, 'same_price', n_same,
    'auto_propertyhub_price', n_auto_ph, 'auto_nawy_kept', n_auto_nawy, 'review', n_review,
    'conflicts_opened', n_opened, 'conflicts_closed', n_closed, 'conflicts_closed_gone', n_closed_gone,
    'desk_decided', n_overridden, 'ph_units_added', n_added, 'ph_units_updated', n_updated,
    'ph_units_off_market', n_off, 'projects_merged', n_proj_ok, 'projects_skipped_code_mismatch', n_proj_skip,
    'units_skipped_code_mismatch', n_units_skip, 'ph_units_unmapped', n_unmapped, 'auto_pct', pct,
    'duration_ms', extract(milliseconds from clock_timestamp() - t0)::int);
exception when others then
  update sync.runs set finished_at = now(), status = 'failed', notes = left(sqlerrm, 400) where id = run_id;
  raise;
end
$fn$;
revoke all on function sync.merge_propertyhub() from public, anon, authenticated;
grant execute on function sync.merge_propertyhub() to service_role;

-- ── 4. publish = Nawy promote + PropertyHub merge (server keys only) ──────
create or replace function public.promote_to_site()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'sync', 'pg_temp'
as $fn$
declare r jsonb;
begin
  r := sync.promote_to_site();
  return r || jsonb_build_object('merge', sync.merge_propertyhub());
end
$fn$;
revoke all on function public.promote_to_site() from public, anon, authenticated;
grant execute on function public.promote_to_site() to service_role;

-- ── 5. conflict decisions (one core, two doors) ────────────────────────────
-- Fix: units were looked up by the conflict's nawy_unit_id = Nawy INTERNAL id; the catalogue
-- key is the PUBLIC nawy_id (see the 28-Sep incident). Overrides stay keyed on the internal id
-- because promote_to_site matches them on nawy.units.id.
create or replace function sync.resolve_conflicts_core(p_ids bigint[], p_pick text, p_by text default '')
returns jsonb
language plpgsql
security definer
set search_path to ''
as $fn$
declare r record; chosen text; new_price numeric; old_price numeric; n int := 0; moved int := 0;
begin
  if p_pick not in ('suggested', 'nawy', 'propertyhub', 'keep') then raise exception 'bad pick'; end if;
  for r in
    select k.*, (k.nawy_value->>'price')::numeric np, (k.ph_value->>'price')::numeric pp,
           nu.nawy_id pub_id, nu.last_inventory_update nu_at,
           coalesce(pu.created_at_source, pu.last_seen_at) pu_at, nu.price staging
    from sync.conflicts k
    left join nawy.units nu on nu.id = k.nawy_unit_id
    left join propertyhub.units pu on pu.id = k.ph_unit_id
    where k.id = any (p_ids) and k.resolved_at is null and k.field = 'price'
  loop
    chosen := case p_pick
      when 'suggested' then case when r.pu_at is not null and (r.nu_at is null or r.pu_at > r.nu_at)
                                 then 'propertyhub' else 'nawy' end
      else p_pick end;
    if chosen <> 'keep' and r.pub_id is not null then
      new_price := case when chosen = 'propertyhub' then r.pp else r.np end;
      select price into old_price from public.units where nawy_id = r.pub_id;
      if found and new_price is not null then
        update public.units
           set price = new_price, price_source = 'desk',
               price_per_meter = case when area_sqm > 0 then round(new_price / area_sqm) else price_per_meter end
         where nawy_id = r.pub_id;
        if old_price is distinct from new_price then
          insert into sync.changes (source, entity_type, entity_id, action, field, before, after, changed_at, checked_at, checked_by, check_result)
          values ('desk', 'unit', r.pub_id::text, 'changed', 'price', jsonb_build_object('price', old_price),
                  jsonb_build_object('price', new_price, 'conflict_id', r.id, 'from', chosen), now(), now(), p_by, 'ok');
          moved := moved + 1;
        end if;
      end if;
      insert into sync.price_overrides (unit_id, price, staging_price, source, conflict_id, set_at, set_by)
      values (r.nawy_unit_id, new_price, r.staging, chosen, r.id, now(), coalesce(nullif(p_by, ''), 'desk'))
      on conflict (unit_id) do update set price = excluded.price, staging_price = excluded.staging_price,
        source = excluded.source, conflict_id = excluded.conflict_id, set_at = now(), set_by = excluded.set_by;
    end if;
    update sync.conflicts set resolved_at = now(), resolution = chosen, resolved_by = coalesce(nullif(p_by, ''), 'desk')
     where id = r.id;
    n := n + 1;
  end loop;
  return jsonb_build_object('resolved', n, 'prices_written', moved);
end
$fn$;
revoke all on function sync.resolve_conflicts_core(bigint[], text, text) from public, anon, authenticated;

-- door 1: the desk channel (x-df-key header), unchanged signature
create or replace function public.inv_resolve_conflicts(p_ids bigint[], p_pick text, p_by text default ''::text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $fn$
begin
  if not public.inv_desk_ok() then raise exception 'not allowed'; end if;
  return sync.resolve_conflicts_core(p_ids, p_pick, p_by);
end
$fn$;

-- door 2: server code with the service key (DealFinder /inventory/conflicts)
create or replace function public.resolve_price_conflicts(p_ids bigint[], p_pick text, p_by text default '')
returns jsonb
language sql
security definer
set search_path to ''
as $fn$ select sync.resolve_conflicts_core(p_ids, p_pick, p_by) $fn$;
revoke all on function public.resolve_price_conflicts(bigint[], text, text) from public, anon, authenticated;
grant execute on function public.resolve_price_conflicts(bigint[], text, text) to service_role;

-- inv_conflicts: same internal-vs-public id fix on the catalogue join
create or replace function public.inv_conflicts(p_band text default 'all'::text, p_q text default null::text,
                                                p_limit integer default 50, p_offset integer default 0)
returns jsonb
language plpgsql
stable security definer
set search_path to ''
as $fn$
declare rows jsonb; total int;
begin
  if not public.inv_desk_ok() then raise exception 'not allowed'; end if;
  with base as (
    select k.id, k.match_key, k.nawy_unit_id unit_id, k.ph_unit_id, k.detected_at,
           (k.nawy_value->>'price')::numeric nawy_price, (k.ph_value->>'price')::numeric ph_price,
           round(abs((k.nawy_value->>'price')::numeric - (k.ph_value->>'price')::numeric) * 100
             / nullif(greatest((k.nawy_value->>'price')::numeric, (k.ph_value->>'price')::numeric), 0), 1) pct,
           n.last_inventory_update nawy_updated, coalesce(p.created_at_source, p.last_seen_at) ph_updated,
           coalesce(u.title, n.compound_name || ' — ' || n.unit_id) title, coalesce(cp.name, n.compound_name) compound,
           cp.nawy_id compound_id, u.price catalogue_price, coalesce(u.property_type, n.property_type) property_type,
           coalesce(u.bedrooms, n.bedrooms::int) bedrooms, coalesce(u.area_sqm, n.unit_area) area_sqm
    from sync.conflicts k
    left join nawy.units n on n.id = k.nawy_unit_id
    left join propertyhub.units p on p.id = k.ph_unit_id
    left join public.units u on u.nawy_id = n.nawy_id
    left join public.compounds cp on cp.nawy_id = u.compound_nawy_id
    where k.resolved_at is null and k.field = 'price'
  ), picked as (
    select b.*,
      case when b.ph_updated is not null and (b.nawy_updated is null or b.ph_updated > b.nawy_updated)
           then 'propertyhub' else 'nawy' end pick
    from base b
  ), f as (
    select * from picked
    where (p_band = 'all' or (p_band = 'mid' and pct <= 15) or (p_band = 'big' and pct > 15))
      and (p_q is null or p_q = '' or title ilike '%' || p_q || '%' or compound ilike '%' || p_q || '%')
  )
  select (select count(*) from f),
         coalesce((select jsonb_agg(to_jsonb(x)) from (select * from f order by pct desc, id desc
                   limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)) x), '[]'::jsonb)
    into total, rows;
  return jsonb_build_object('total', total, 'rows', rows);
end
$fn$;

-- PropertyHub sync step: flag only gaps above merge_auto_pct, and never re-open a decided pair
create or replace function public.detect_price_conflicts()
returns integer
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $fn$
declare
  n int;
  pct numeric := coalesce((select v::numeric from sync.config where k = 'merge_auto_pct'), 0.10);
begin
  with n_units as (
    select id as nawy_unit_id, price,
           public.norm_key(compound_name || '|' || coalesce(unit_id, '')) as mkey
    from nawy.units
    where unit_id is not null and unit_id <> '' and price is not null and sale_type = 'primary'
  ),
  p_units as (
    select u.id as ph_unit_id, u.price_total_min as price,
           public.norm_key(proj.name || '|' || coalesce(u.apartment_code, '')) as mkey
    from propertyhub.units u
    left join propertyhub.projects proj on proj.id = u.project_id
    where u.apartment_code is not null and u.apartment_code <> '' and u.price_total_min is not null
  ),
  candidates as (
    select n.mkey, n.nawy_unit_id, p.ph_unit_id, n.price as nprice, p.price as pprice
    from n_units n
    join p_units p on n.mkey = p.mkey
    where n.price <> p.price
      and abs(n.price - p.price) / greatest(n.price, p.price) > pct
      and not exists (select 1 from sync.price_overrides o where o.unit_id = n.nawy_unit_id)
      and not exists (select 1 from sync.conflicts k
                      where k.field = 'price' and k.match_key = n.mkey and k.resolved_at is not null
                        and (k.nawy_value->>'price')::numeric = n.price
                        and (k.ph_value->>'price')::numeric = p.price)
  ),
  inserted as (
    insert into sync.conflicts (match_key, nawy_unit_id, ph_unit_id, field, nawy_value, ph_value)
    select distinct on (mkey) mkey, nawy_unit_id, ph_unit_id, 'price',
           jsonb_build_object('price', nprice), jsonb_build_object('price', pprice)
    from candidates
    order by mkey
    on conflict (match_key, field) where resolved_at is null do nothing
    returning 1
  )
  select count(*) into n from inserted;
  return n;
end
$fn$;

-- ── 6. project pages show what is on sale now, PH units included ───────────
create or replace function public.compound_units(p_slug text)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $fn$
  select coalesce(jsonb_agg(jsonb_build_object(
      'nawy_id', u.nawy_id,
      'code', nullif(u.unit_code, ''),
      'type', u.property_type,
      'subtype', u.subtitle,
      'beds', u.bedrooms,
      'baths', u.bathrooms,
      'area', u.area_sqm,
      'garden', u.garden_area,
      'floor', u.floor_number,
      'finishing', u.finishing,
      'delivery', coalesce(to_char(u.delivery_date, 'YYYY-MM-DD'), u.ready_by),
      'price', u.price,
      'ppm', coalesce(u.price_per_meter, case when u.area_sqm > 0 then round(u.price / u.area_sqm) end),
      'down', case when d.v > 100 and u.price > 0 then round(d.v / u.price * 100, 2) else d.v end,
      'years', coalesce((u.payment_plans->0->>'years')::numeric, u.installment_years),
      'plans', coalesce(u.payment_plans_count, jsonb_array_length(coalesce(u.payment_plans, '[]'::jsonb))),
      'image', u.image_url,
      'updated', u.inventory_updated_at,
      'source', u.source
    ) order by u.price nulls last), '[]'::jsonb)
  from public.units u
  join public.compounds c on c.nawy_id = u.compound_nawy_id
  cross join lateral (select coalesce((u.payment_plans->0->>'down_payment')::numeric, u.down_payment) as v) d
  where c.slug = p_slug and coalesce(u.price, 0) > 0 and u.live;
$fn$;

create or replace function public.compound_profile(p_slug text)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $fn$
  with c as (
    select * from public.compounds where slug = p_slug limit 1
  ),
  live as (
    select u.* from public.units u
    where u.compound_nawy_id = (select nawy_id from c) and u.live
  ),
  ustats as (
    select
      count(*) as unit_count,
      min(price) filter (where price > 0) as min_price,
      max(price) as max_price,
      round(avg(price) filter (where price > 0)) as avg_price,
      round(avg(down_payment) filter (where down_payment > 0 and down_payment <= 100)) as avg_down_payment,
      max(installment_years) as max_installment_years,
      jsonb_object_agg(coalesce(nullif(property_type,''),'Other'), pt_count)
        filter (where property_type is not null) as by_type,
      jsonb_object_agg(coalesce(bedrooms, 0)::text, bed_count)
        filter (where bedrooms is not null) as by_bedrooms
    from (
      select property_type, bedrooms, price, down_payment, installment_years,
             count(*) over (partition by property_type) as pt_count,
             count(*) over (partition by bedrooms) as bed_count
      from live
    ) s
  ),
  usample as (
    select coalesce(jsonb_agg(x order by (x->>'price')::numeric asc), '[]'::jsonb) as units from (
      select jsonb_build_object(
        'nawy_id', u.nawy_id, 'title', u.title, 'property_type', u.property_type,
        'bedrooms', u.bedrooms, 'bathrooms', u.bathrooms, 'area_sqm', u.area_sqm,
        'finishing', u.finishing, 'price', u.price, 'down_payment', u.down_payment,
        'installment_years', u.installment_years, 'image_url', u.image_url, 'slug', u.slug
      ) as x
      from live u
      where u.price > 0
      order by u.price asc
      limit 8
    ) t
  )
  select case when (select nawy_id from c) is null then null else jsonb_build_object(
    'compound', to_jsonb((select c from c c)),
    'developer', (select to_jsonb(d) from public.developers d where d.nawy_id = (select developer_nawy_id from c)),
    'area', (select to_jsonb(a) from public.areas a where a.nawy_id = (select area_nawy_id from c)),
    'stats', (select to_jsonb(ustats) from ustats),
    'sample_units', (select units from usample),
    'brochures', (select coalesce(jsonb_agg(jsonb_build_object('title', b.title, 'url', b.public_url, 'bytes', b.bytes) order by b.source_created_at nulls last, b.title), '[]'::jsonb)
                  from public.compound_brochures b where b.compound_nawy_id = (select nawy_id from c))
  ) end;
$fn$;
