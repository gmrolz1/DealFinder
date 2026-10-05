// Refreshes scraper/data/{areas,developers,compounds,units}.json — the files the
// public site reads (src/lib/data.ts) — from the Supabase catalogue that the
// inventory desk publishes into (public.* via sync.promote_to_site).
//
//   * units      = public.units still live on Nawy (PRIMARY, matched on the
//                  PUBLIC nawy_id). Units Nawy no longer lists are left out of
//                  the site (they stay in the DB).
//   * compounds  = every compound already on the site ∪ every compound with a
//                  live unit. Developer / area / price come from the DB.
//   * developers / areas = existing ones ∪ any the exported rows point to.
//
// Existing rows keep their curated text: slugs (SEO), Arabic titles and
// subtitles, developer about/FAQs, lat/lng. Only facts are refreshed (price,
// plan, specs, links, counts). New rows get the same templates as
// scripts/build-data-from-nawy.mjs.
//
// Run: node --env-file=.env.local scripts/export-site-from-db.mjs

import fs from "node:fs";
import path from "node:path";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");

const DATA = path.join(process.cwd(), "scraper", "data");

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const PROP_TYPE_AR = {
  Apartment: "شقة",
  Villa: "فيلا",
  Townhouse: "تاون هاوس",
  "Middle Townhouse": "تاون هاوس وسطي",
  "Corner Townhouse": "تاون هاوس ركني",
  Twinhouse: "توين هاوس",
  Penthouse: "بنتهاوس",
  Duplex: "دوبلكس",
  Chalet: "شاليه",
  Studio: "ستوديو",
  Cabin: "كابينة",
  Standalone: "فيلا منفصلة",
  "Standalone Villa": "فيلا منفصلة",
  Loft: "لوفت",
  Office: "مكتب",
  Clinic: "عيادة",
  Retail: "محل تجاري",
  Hotel: "فندق",
};
const propTypeAr = (en) => (en ? PROP_TYPE_AR[en] ?? en : null);

async function fetchAll(table, select, schema = "public") {
  const out = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const r = await fetch(`${URL}/rest/v1/${table}?select=${select}&order=nawy_id`, {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Accept-Profile": schema,
        Range: `${from}-${from + page - 1}`,
      },
    });
    if (!r.ok) throw new Error(`${schema}.${table}: HTTP ${r.status} ${await r.text()}`);
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA, `${name}.json`), "utf8"));

// ── load ────────────────────────────────────────────────────────────────
const [dbAreas, dbDevs, dbComps, dbUnits, nawyUnits] = await Promise.all([
  fetchAll("areas", "nawy_id,name,name_ar,slug,image_url"),
  fetchAll("developers", "nawy_id,name,name_ar,slug,logo_url"),
  fetchAll("compounds", "nawy_id,name,name_ar,slug,area_nawy_id,developer_nawy_id,lat,lng,image_url,subtitle,min_price,ready_by"),
  fetchAll("units", "nawy_id,property_type,compound_nawy_id,area_nawy_id,developer_nawy_id,bedrooms,bathrooms,area_sqm,finishing,image_url,price,down_payment,installment_years"),
  fetchAll("units", "nawy_id,sale_type,ready_by", "nawy"),
]);
const oldAreas = readJson("areas");
const oldDevs = readJson("developers");
const oldComps = readJson("compounds");
const oldUnits = readJson("units");
console.log(
  `DB: ${dbAreas.length} areas · ${dbDevs.length} developers · ${dbComps.length} compounds · ${dbUnits.length} units · nawy ${nawyUnits.length}`
);
console.log(`Site before: ${oldAreas.length} areas · ${oldDevs.length} developers · ${oldComps.length} compounds · ${oldUnits.length} units`);

const byId = (rows) => new Map(rows.map((r) => [r.nawy_id, r]));
const dbAreaById = byId(dbAreas);
const dbDevById = byId(dbDevs);
const dbCompById = byId(dbComps);
const oldAreaById = byId(oldAreas);
const oldDevById = byId(oldDevs);
const oldCompById = byId(oldComps);
const oldUnitById = byId(oldUnits);
const liveNawy = new Map(nawyUnits.filter((n) => n.sale_type === "primary").map((n) => [n.nawy_id, n]));

// ── units: live on Nawy + compound known ────────────────────────────────
const units = [];
let droppedGone = 0;
let droppedNoCompound = 0;
for (const u of dbUnits) {
  const live = liveNawy.get(u.nawy_id);
  if (!live) {
    droppedGone++;
    continue;
  }
  const comp = dbCompById.get(u.compound_nawy_id);
  if (!comp) {
    droppedNoCompound++;
    continue;
  }
  const old = oldUnitById.get(u.nawy_id);
  const ptype = u.property_type ?? null;
  const bd = u.bedrooms ?? null;
  const area = dbAreaById.get(comp.area_nawy_id) ?? null;
  const dev = dbDevById.get(comp.developer_nawy_id) ?? null;
  const oldDev = oldDevById.get(comp.developer_nawy_id);
  const compNameAr = comp.name_ar ?? oldCompById.get(comp.nawy_id)?.name_ar ?? comp.name;
  const areaAr = area ? oldAreaById.get(area.nawy_id)?.name_ar ?? area.name_ar ?? area.name : null;
  const devAr = oldDev?.name_ar ?? dev?.name_ar ?? dev?.name ?? "";
  const ptypeAr = propTypeAr(ptype);

  const fresh = {
    slug: slugify(
      [
        u.nawy_id,
        ptype,
        "for-sale-in",
        comp.name,
        bd != null ? `with-${bd}-bedrooms` : "",
        area ? `in-${area.name}` : "",
        dev ? `by-${dev.name}` : "",
      ]
        .filter(Boolean)
        .join("-")
    ),
    title: [ptype, comp.name].filter(Boolean).join(", ") || `Property ${u.nawy_id}`,
    title_ar: [ptypeAr, compNameAr].filter(Boolean).join("، ") || null,
    subtitle:
      ptype && comp.name
        ? `${ptype} for sale in ${comp.name}` +
          (bd != null ? ` - with ${bd} bedrooms` : "") +
          (area ? ` in ${area.name}` : "") +
          (dev ? ` by ${dev.name}` : "") +
          "."
        : null,
    subtitle_ar:
      ptypeAr && compNameAr
        ? `${ptypeAr} للبيع في ${compNameAr}` +
          (bd != null ? ` - ${bd} غرف نوم` : "") +
          (areaAr ? ` في ${areaAr}` : "") +
          (devAr ? ` من ${devAr}` : "") +
          "."
        : null,
  };

  units.push({
    nawy_id: u.nawy_id,
    slug: old?.slug ?? fresh.slug,
    title: old?.title ?? fresh.title,
    title_ar: old?.title_ar ?? fresh.title_ar,
    subtitle: old?.subtitle ?? fresh.subtitle,
    subtitle_ar: old?.subtitle_ar ?? fresh.subtitle_ar,
    property_type: ptype,
    property_type_ar: ptypeAr,
    compound_nawy_id: comp.nawy_id,
    area_nawy_id: comp.area_nawy_id,
    developer_nawy_id: comp.developer_nawy_id,
    bedrooms: bd,
    bathrooms: u.bathrooms ?? null,
    area_sqm: u.area_sqm ?? null,
    finishing: u.finishing ?? null,
    ready_by: live.ready_by ? new Date(live.ready_by).toISOString() : old?.ready_by ?? null,
    sale_type: "primary",
    image_url: u.image_url ?? old?.image_url ?? null,
    price: u.price ?? null,
    currency: "EGP",
    down_payment: u.down_payment ?? null,
    installment_years: u.installment_years ?? null,
  });
}

// ── compounds: on the site already ∪ with live units ────────────────────
const unitsByComp = new Map();
for (const u of units) {
  if (!unitsByComp.has(u.compound_nawy_id)) unitsByComp.set(u.compound_nawy_id, []);
  unitsByComp.get(u.compound_nawy_id).push(u);
}
const compIds = new Set([...oldComps.map((c) => c.nawy_id), ...unitsByComp.keys()]);
const compounds = [];
for (const id of compIds) {
  const db = dbCompById.get(id);
  const old = oldCompById.get(id);
  const base = db ?? old;
  const cu = unitsByComp.get(id) ?? [];
  const prices = cu.map((u) => u.price).filter((p) => p > 0);
  const ptypes = [...new Set(cu.map((u) => u.property_type).filter(Boolean))];
  const area = dbAreaById.get(db?.area_nawy_id ?? old?.area_nawy_id);
  const dev = dbDevById.get(db?.developer_nawy_id ?? old?.developer_nawy_id);
  const devAr = oldDevById.get(dev?.nawy_id)?.name_ar ?? dev?.name_ar ?? dev?.name;
  const areaAr = area ? oldAreaById.get(area.nawy_id)?.name_ar ?? area.name_ar ?? area.name : null;
  const ptypesOut = ptypes.length ? ptypes : old?.property_types ?? [];
  compounds.push({
    nawy_id: id,
    name: base.name,
    name_ar: old?.name_ar ?? db?.name_ar ?? null,
    slug: old?.slug ?? db?.slug ?? slugify(`${id}-${base.name}`),
    area_nawy_id: db ? db.area_nawy_id : old.area_nawy_id,
    developer_nawy_id: db ? db.developer_nawy_id : old.developer_nawy_id,
    lng: old?.lng ?? db?.lng ?? null,
    lat: old?.lat ?? db?.lat ?? null,
    image_url: old?.image_url ?? db?.image_url ?? null,
    subtitle:
      old?.subtitle ?? db?.subtitle ?? (dev && area ? `Discover ${dev.name}'s Properties in ${area.name}` : null),
    subtitle_ar: old?.subtitle_ar ?? (devAr && areaAr ? `اكتشف عقارات ${devAr} في ${areaAr}` : null),
    property_types: ptypesOut,
    property_types_ar: ptypesOut.map(propTypeAr).filter(Boolean),
    min_price: prices.length ? Math.min(...prices) : db?.min_price ?? old?.min_price ?? null,
    ready_by: old?.ready_by ?? db?.ready_by ?? null,
  });
}

// ── areas + developers: existing ∪ referenced ───────────────────────────
const usedAreaIds = new Set(compounds.map((c) => c.area_nawy_id).filter((x) => x != null));
const usedDevIds = new Set(compounds.map((c) => c.developer_nawy_id).filter((x) => x != null));

const areaUnits = new Map();
const devUnits = new Map();
const devMin = new Map();
for (const u of units) {
  areaUnits.set(u.area_nawy_id, (areaUnits.get(u.area_nawy_id) ?? 0) + 1);
  devUnits.set(u.developer_nawy_id, (devUnits.get(u.developer_nawy_id) ?? 0) + 1);
  if (u.price > 0 && (devMin.get(u.developer_nawy_id) ?? Infinity) > u.price) devMin.set(u.developer_nawy_id, u.price);
}
const areaComps = new Map();
const devComps = new Map();
for (const c of compounds) {
  areaComps.set(c.area_nawy_id, (areaComps.get(c.area_nawy_id) ?? 0) + 1);
  devComps.set(c.developer_nawy_id, (devComps.get(c.developer_nawy_id) ?? 0) + 1);
}

const areas = [];
for (const id of new Set([...oldAreas.map((a) => a.nawy_id), ...usedAreaIds])) {
  const old = oldAreaById.get(id);
  const db = dbAreaById.get(id);
  if (!old && !db) continue;
  areas.push({
    nawy_id: id,
    name: old?.name ?? db.name,
    name_ar: old?.name_ar ?? db?.name_ar ?? null,
    image_url: old?.image_url ?? db?.image_url ?? null,
    compounds_count: areaComps.get(id) ?? 0,
    properties_count: areaUnits.get(id) ?? 0,
    slug: old?.slug ?? db?.slug ?? slugify(db.name),
  });
}

const developers = [];
for (const id of new Set([...oldDevs.map((d) => d.nawy_id), ...usedDevIds])) {
  const old = oldDevById.get(id);
  const db = dbDevById.get(id);
  if (!old && !db) continue;
  const props = devUnits.get(id) ?? 0;
  const comps = devComps.get(id) ?? 0;
  const name = old?.name ?? db.name;
  developers.push({
    ...(old ?? {
      nawy_id: id,
      name,
      name_ar: db.name_ar ?? null,
      slug: db.slug ?? slugify(`${id}-${name}`),
      logo_url: db.logo_url ?? null,
      established_year: null,
      areas: [],
      areas_ar: [],
      about: `${name} is an Egyptian real estate developer.`,
      about_ar: `${db.name_ar ?? name} هي شركة تطوير عقاري مصرية.`,
      faqs: [],
      faqs_ar: [],
      meta_title: `${name} — Projects & Properties for Sale | DealFinder`,
      meta_title_ar: `${db.name_ar ?? name} — مشاريع وعقارات للبيع | DealFinder`,
      meta_description: `Explore properties from ${name}. Compare prices, payment plans and request a callback on DealFinder.`,
      meta_description_ar: `استكشف عقارات ${db.name_ar ?? name}. قارن الأسعار وخطط السداد واطلب اتصالاً على DealFinder.`,
    }),
    logo_url: old?.logo_url ?? db?.logo_url ?? null,
    min_price: devMin.get(id) ?? old?.min_price ?? null,
    compounds_count: comps,
    properties_count: props,
  });
}
developers.sort((a, b) => b.properties_count - a.properties_count);

// ── unique slugs (existing slugs win) ───────────────────────────────────
function uniqueSlugs(rows, oldMap) {
  const seen = new Set();
  const ordered = [...rows].sort((a, b) => Number(oldMap.has(b.nawy_id)) - Number(oldMap.has(a.nawy_id)));
  for (const r of ordered) {
    let s = r.slug || `id-${r.nawy_id}`;
    if (seen.has(s)) s = `${s}-${r.nawy_id}`;
    seen.add(s);
    r.slug = s;
  }
}
uniqueSlugs(areas, oldAreaById);
uniqueSlugs(developers, oldDevById);
uniqueSlugs(compounds, oldCompById);
uniqueSlugs(units, oldUnitById);

// ── write ───────────────────────────────────────────────────────────────
const write = (name, rows) => {
  fs.writeFileSync(path.join(DATA, `${name}.json`), JSON.stringify(rows, null, 1));
  console.log(`  ${name}.json: ${rows.length}`);
};
write("areas", areas);
write("developers", developers);
write("compounds", compounds);
write("units", units);

// ── report ──────────────────────────────────────────────────────────────
const aIds = new Set(areas.map((a) => a.nawy_id));
const dIds = new Set(developers.map((d) => d.nawy_id));
const cIds = new Set(compounds.map((c) => c.nawy_id));
const dang = (arr, ok) => arr.filter((x) => !ok(x)).length;
const kept = units.filter((u) => oldUnitById.has(u.nawy_id)).length;
console.log(`Units: ${kept} kept (still on Nawy) · ${units.length - kept} new · ${oldUnits.length - kept} removed from site`);
console.log(`  skipped: ${droppedGone} no longer on Nawy · ${droppedNoCompound} without a compound`);
console.log("Integrity (all should be 0):");
console.log(`  units→compound:     ${dang(units, (u) => cIds.has(u.compound_nawy_id))}`);
console.log(`  units→area:         ${dang(units, (u) => u.area_nawy_id == null || aIds.has(u.area_nawy_id))}`);
console.log(`  units→developer:    ${dang(units, (u) => u.developer_nawy_id == null || dIds.has(u.developer_nawy_id))}`);
console.log(`  compound→area:      ${dang(compounds, (c) => c.area_nawy_id == null || aIds.has(c.area_nawy_id))}`);
console.log(`  compound→developer: ${dang(compounds, (c) => c.developer_nawy_id == null || dIds.has(c.developer_nawy_id))}`);
console.log("Done.");
