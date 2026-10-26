-- Fixes found on the first live run of sync.merge_propertyhub() (2026-10-09):
-- 1. Only a PERSON's decision is sticky. 'auto:*' closes (e.g. auto:gone when PropertyHub re-issued a
--    unit id) must not stop a big-gap pair from re-opening — 316 pairs were left with no open conflict.
-- 2. Code-overlap guard also passes when most of Nawy's units match (Salt: PH 551, Nawy 49, all 49
--    matched — same code format, PropertyHub simply has more stock).
insert into sync.config (k, v) values ('merge_min_nawy_match', '0.50') on conflict (k) do nothing;

do $$
declare d text; d2 text;
begin
  d := pg_get_functiondef('sync.merge_propertyhub()'::regprocedure);
  d2 := replace(d,
    $a$or ((k.nawy_value->>'price')::numeric = p.nprice and (k.ph_value->>'price')::numeric = p.pprice)))$a$,
    $b$or (coalesce(k.resolution, '') not like 'auto:%' and (k.nawy_value->>'price')::numeric = p.nprice and (k.ph_value->>'price')::numeric = p.pprice)))$b$);
  if d2 = d then raise exception 'sticky fix did not apply'; end if;
  d := d2;
  d2 := replace(d,
    $a$update _proj set ok = (nawy_n = 0 or matched::numeric / ph_n >= min_ov);$a$,
    $b$update _proj set ok = (nawy_n = 0 or matched::numeric / ph_n >= min_ov
                    or (matched >= 5 and matched::numeric / nullif(nawy_n, 0)
                        >= coalesce((select v::numeric from sync.config where k = 'merge_min_nawy_match'), 0.50)));$b$);
  if d2 = d then raise exception 'guard fix did not apply'; end if;
  execute d2;

  d := pg_get_functiondef('public.detect_price_conflicts()'::regprocedure);
  d2 := replace(d,
    $a$where k.field = 'price' and k.match_key = n.mkey and k.resolved_at is not null$a$,
    $b$where k.field = 'price' and k.match_key = n.mkey and k.resolved_at is not null
                        and coalesce(k.resolution, '') not like 'auto:%'$b$);
  if d2 = d then raise exception 'detect fix did not apply'; end if;
  execute d2;
end $$;

-- 3. PropertyHub sends 0 bathrooms when unknown -> store null
do $$
declare d text; d2 text;
begin
  d := pg_get_functiondef('sync.merge_propertyhub()'::regprocedure);
  d2 := replace(d, 'n.bedrooms::int, n.bathrooms::int, n.area,', 'n.bedrooms::int, nullif(n.bathrooms, 0)::int, n.area,');
  if d2 = d then raise exception 'bathrooms fix did not apply'; end if;
  execute d2;
end $$;
update public.units set bathrooms = null where source = 'propertyhub' and bathrooms = 0;

-- 4. PropertyHub's project thumbnail is usually a LOGO. Prefer the catalogue project photo,
--    fall back to the PH thumbnail only when the project has none.
do $$
declare d text; d2 text;
begin
  d := pg_get_functiondef('sync.merge_propertyhub()'::regprocedure);
  d2 := replace(d, 'coalesce(pr.thumbnail_url, c.image_url),', 'coalesce(c.image_url, pr.thumbnail_url),');
  if d2 = d then raise exception 'photo fix (insert) did not apply'; end if;
  d := d2;
  d2 := replace(d, 'image_url = coalesce(excluded.image_url, public.units.image_url),', 'image_url = excluded.image_url,');
  if d2 = d then raise exception 'photo fix (update) did not apply'; end if;
  execute d2;
end $$;
update public.units u set image_url = c.image_url
from public.compounds c
where u.source = 'propertyhub' and c.nawy_id = u.compound_nawy_id and c.image_url is not null
  and u.image_url is distinct from c.image_url;
