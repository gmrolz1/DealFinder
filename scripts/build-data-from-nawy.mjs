// Builds scraper/data/{areas,developers,compounds,units}.json from the
// fresh full scrape in "nawy data/" plus the developer detail scrape:
//   - all_compounds.json        → every project (compound)
//   - all_properties.json       → units (PRIMARY only; resale + financing dropped)
//   - scraper/data/developers-full.json → all 517 nawy developers (detail)
//
// Linking strategy:
//   * developers = all 517 from developers-full.json (authority for
//     developer identity — real nawy ids from the sitemap).
//   * compounds  = all_compounds.json ∪ compounds referenced by a primary
//     unit but missing from it. Each compound resolves its developer by
//     real id, else by name, into the 517.
//   * areas      = distinct areas across all compounds.
//   * units INHERIT area_nawy_id + developer_nawy_id from their compound.
//   * developer about/meta copy is GENERATED from factual fields — nawy's
//     marketing description is never used verbatim (duplicate-content rule).
//
// Run: node scripts/build-data-from-nawy.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ND = path.join(ROOT, "nawy data");
const DATA = path.join(ROOT, "scraper", "data");
const BACKUP = path.join(DATA, "_backup-old-scrape");

const SYNTH_AREA = 8_000_000;
const SYNTH_DEV = 9_000_000;

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const norm = (s) => String(s ?? "").trim().toLowerCase();

function readJson(p) {
  let raw = fs.readFileSync(p, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}
const readOpt = (p) => {
  try {
    return readJson(p);
  } catch {
    return [];
  }
};

const allCompounds = readJson(path.join(ND, "all_compounds.json"));
const allProps = readJson(path.join(ND, "all_properties.json"));
const devFull = readOpt(path.join(DATA, "developers-full.json"));
const primary = allProps.filter((u) => u.sale_type === "primary");
console.log(
  `Loaded: ${allCompounds.length} compounds, ${primary.length} primary units, ${devFull.length} developers`
);

const oldComp = new Map(
  readOpt(path.join(BACKUP, "compounds.json")).map((c) => [c.nawy_id, c])
);
const areaIdByName = new Map();
for (const p of primary) {
  if (p.area?.name && p.area?.id != null)
    areaIdByName.set(norm(p.area.name), p.area.id);
}

function planFields(u) {
  const p = (u.payment_plans && u.payment_plans[0]) || null;
  return {
    price: p?.price_in_egp ?? p?.price ?? u.max_price ?? null,
    down_payment: p?.down_payment_value ?? null,
    installment_years: p?.years ?? null,
  };
}

// ── developers — 517 from the detail scrape are the identity authority ─
const devById = new Map(); // nawy_id → working record
const devNameToId = new Map(); // norm(name) → nawy_id
for (const d of devFull) {
  if (d.nawy_id == null) continue;
  devById.set(d.nawy_id, {
    nawy_id: d.nawy_id,
    name: d.name ?? `Developer ${d.nawy_id}`,
    slug: slugify(d.slug_en || `${d.nawy_id}-${d.name}`),
    logo_url: d.logo_url ?? null,
    established_year: d.established_year ?? null,
    leadership: d.leadership ?? null,
    nawy_min_price: d.min_price ?? null,
    nawy_areas: Array.isArray(d.areas) ? d.areas : [],
    // computed below:
    min_price: null,
    compounds_count: 0,
    properties_count: 0,
    areas: [],
    top_projects: [],
  });
  devNameToId.set(norm(d.name), d.nawy_id);
}
let synthDev = SYNTH_DEV;
function resolveDeveloper(devName, devNawyId, devLogo) {
  if (devNawyId != null && devById.has(devNawyId)) return devNawyId;
  const byName = devName ? devNameToId.get(norm(devName)) : undefined;
  if (byName != null) return byName;
  if (!devName) return null;
  // developer not in the 517 — add a minimal record
  const id = devNawyId != null ? devNawyId : synthDev++;
  if (!devById.has(id)) {
    devById.set(id, {
      nawy_id: id,
      name: devName,
      slug: slugify(`${id}-${devName}`),
      logo_url: devLogo ?? null,
      established_year: null,
      leadership: null,
      nawy_min_price: null,
      nawy_areas: [],
      min_price: null,
      compounds_count: 0,
      properties_count: 0,
      areas: [],
      top_projects: [],
    });
    devNameToId.set(norm(devName), id);
  }
  return id;
}

// ── 1. raw compound records (union of all_compounds + orphans) ─────────
const rawComp = new Map();
for (const c of allCompounds) {
  if (c.nawy_id == null) continue;
  rawComp.set(c.nawy_id, {
    nawy_id: c.nawy_id,
    name: c.name ?? `Compound ${c.nawy_id}`,
    devName: c.developer?.name ?? null,
    devNawyId: c.developer?.nawy_id ?? null,
    devLogo: c.developer?.logoPath ?? null,
    areaName: c.area?.name ?? null,
    image: c.image ?? null,
    ptypes: Array.isArray(c.property_types)
      ? c.property_types.map((t) => t.name).filter(Boolean)
      : [],
    minPrice: c.min_price_primary > 0 ? c.min_price_primary : null,
  });
}
let orphanCompounds = 0;
for (const u of primary) {
  const id = u.compound?.nawy_id;
  if (id == null || rawComp.has(id)) continue;
  orphanCompounds++;
  rawComp.set(id, {
    nawy_id: id,
    name: u.compound?.name ?? `Compound ${id}`,
    devName: u.developer?.name ?? null,
    devNawyId: null,
    devLogo: u.developer?.logo_path ?? null,
    areaName: u.area?.name ?? null,
    image: u.image ?? null,
    ptypes: [],
    minPrice: null,
  });
}
console.log(`Compounds: ${rawComp.size} (incl. ${orphanCompounds} orphans)`);

// ── 2. areas — distinct by name ────────────────────────────────────────
const areaByName = new Map();
let synthArea = SYNTH_AREA;
for (const c of rawComp.values()) {
  if (!c.areaName) continue;
  const key = norm(c.areaName);
  if (!areaByName.has(key)) {
    areaByName.set(key, {
      nawy_id: areaIdByName.get(key) ?? synthArea++,
      name: c.areaName,
      image_url: null,
      compounds_count: 0,
      properties_count: 0,
    });
  }
}

// ── 3. finalize compounds — resolve area/developer ids ─────────────────
const compounds = [];
const compById = new Map();
for (const c of rawComp.values()) {
  const area = c.areaName ? areaByName.get(norm(c.areaName)) : null;
  const devId = resolveDeveloper(c.devName, c.devNawyId, c.devLogo);
  const oc = oldComp.get(c.nawy_id);
  const rec = {
    nawy_id: c.nawy_id,
    name: c.name,
    slug: slugify(`${c.nawy_id}-${c.name}`),
    area_nawy_id: area?.nawy_id ?? null,
    developer_nawy_id: devId,
    lng: oc?.lng ?? null,
    lat: oc?.lat ?? null,
    image_url: c.image ?? oc?.image_url ?? null,
    subtitle: oc?.subtitle ?? null,
    property_types: c.ptypes,
    min_price: c.minPrice,
    ready_by: oc?.ready_by ?? null,
  };
  compounds.push(rec);
  compById.set(c.nawy_id, rec);
}

// ── 4. units — primary only, inherit area/developer from compound ──────
const units = [];
const compPriceMin = new Map();
const compUnitCount = new Map();
let unitsNoCompound = 0;
for (const u of primary) {
  const compId = u.compound?.nawy_id ?? null;
  const comp = compId != null ? compById.get(compId) : null;
  if (!comp) {
    unitsNoCompound++;
    continue;
  }
  const ptype = u.property_type?.name ?? null;
  const bd = u.number_of_bedrooms ?? null;
  const { price, down_payment, installment_years } = planFields(u);
  const areaName = u.area?.name ?? comp.name;
  const devName = u.developer?.name ?? "";
  const subtitle =
    ptype && comp.name
      ? `${ptype} for sale in ${comp.name}` +
        (bd != null ? ` - with ${bd} bedrooms` : "") +
        (areaName ? ` in ${areaName}` : "") +
        (devName ? ` by ${devName}` : "") +
        "."
      : null;
  const slug = slugify(
    [
      u.nawy_id,
      ptype,
      "for-sale-in",
      comp.name,
      bd != null ? `with-${bd}-bedrooms` : "",
      areaName ? `in-${areaName}` : "",
      devName ? `by-${devName}` : "",
    ]
      .filter(Boolean)
      .join("-")
  );
  units.push({
    nawy_id: u.nawy_id,
    slug,
    title: [ptype, comp.name].filter(Boolean).join(", ") || `Property ${u.nawy_id}`,
    subtitle,
    property_type: ptype,
    compound_nawy_id: compId,
    area_nawy_id: comp.area_nawy_id,
    developer_nawy_id: comp.developer_nawy_id,
    bedrooms: bd,
    bathrooms: u.number_of_bathrooms ?? null,
    area_sqm: u.unit_area ?? null,
    finishing: u.finishing ?? null,
    ready_by: u.ready_by ?? null,
    sale_type: "primary",
    image_url: u.image ?? null,
    price,
    currency: "EGP",
    down_payment,
    installment_years,
  });
  if (compId != null) {
    compUnitCount.set(compId, (compUnitCount.get(compId) ?? 0) + 1);
    if (price != null) {
      const cur = compPriceMin.get(compId);
      if (cur == null || price < cur) compPriceMin.set(compId, price);
    }
    if (ptype && !comp.property_types.includes(ptype))
      comp.property_types.push(ptype);
  }
}
if (unitsNoCompound)
  console.log(`  ${unitsNoCompound} units skipped (no compound link)`);
for (const c of compounds) {
  if (c.min_price == null) c.min_price = compPriceMin.get(c.nawy_id) ?? null;
}

// ── 5. aggregates ──────────────────────────────────────────────────────
const areaList = [...areaByName.values()];
const devCompSet = new Map();
const areaCompSet = new Map();
const devUnits = new Map();
const areaUnits = new Map();
const devMinPrice = new Map();
const devAreaNames = new Map();
const addSet = (m, k, v) => {
  if (k == null) return;
  if (!m.has(k)) m.set(k, new Set());
  m.get(k).add(v);
};
for (const c of compounds) {
  addSet(devCompSet, c.developer_nawy_id, c.nawy_id);
  addSet(areaCompSet, c.area_nawy_id, c.nawy_id);
  const aName = areaList.find((a) => a.nawy_id === c.area_nawy_id)?.name;
  if (c.developer_nawy_id != null && aName)
    addSet(devAreaNames, c.developer_nawy_id, aName);
}
for (const u of units) {
  if (u.developer_nawy_id != null)
    devUnits.set(u.developer_nawy_id, (devUnits.get(u.developer_nawy_id) ?? 0) + 1);
  if (u.area_nawy_id != null)
    areaUnits.set(u.area_nawy_id, (areaUnits.get(u.area_nawy_id) ?? 0) + 1);
  if (u.developer_nawy_id != null && u.price != null) {
    const cur = devMinPrice.get(u.developer_nawy_id);
    if (cur == null || u.price < cur) devMinPrice.set(u.developer_nawy_id, u.price);
  }
}
for (const a of areaList) {
  a.compounds_count = areaCompSet.get(a.nawy_id)?.size ?? 0;
  a.properties_count = areaUnits.get(a.nawy_id) ?? 0;
  a.slug = slugify(a.name);
}

// top projects per developer — names of their compounds with the most units
const devTopProjects = new Map();
for (const d of devById.values()) {
  const ids = [...(devCompSet.get(d.nawy_id) ?? [])];
  const names = ids
    .map((id) => ({
      name: compById.get(id)?.name,
      units: compUnitCount.get(id) ?? 0,
    }))
    .filter((x) => x.name && x.units > 0)
    .sort((a, b) => b.units - a.units)
    .slice(0, 3)
    .map((x) => x.name);
  devTopProjects.set(d.nawy_id, names);
}

// ── 6. finalize developers — counts + generated about/meta + Q&A ───────
const fmtPrice = (n) =>
  n == null ? null : "EGP " + Math.round(n).toLocaleString("en-US");

// Generate an original Q&A set from factual fields — never copies nawy copy.
function buildFaqs(d) {
  const proj = d.compounds_count;
  const props = d.properties_count;
  const areas = d.areas;
  const faqs = [];

  if (d.established_year)
    faqs.push({
      q: `When was ${d.name} established?`,
      a: `${d.name} was established in ${d.established_year} and is an Egyptian real estate developer.`,
    });
  if (d.leadership)
    faqs.push({
      q: `Who leads ${d.name}?`,
      a: `${d.name} is led by ${d.leadership}.`,
    });
  if (proj > 0)
    faqs.push({
      q: `How many projects does ${d.name} have on DealFinder?`,
      a:
        `${d.name} has ${proj} ${proj === 1 ? "project" : "projects"} listed on ` +
        `DealFinder with ${props.toLocaleString("en-US")} available ` +
        `${props === 1 ? "property" : "properties"} for sale.`,
    });
  else
    faqs.push({
      q: `Does ${d.name} have properties for sale on DealFinder?`,
      a:
        `${d.name} has no primary units listed right now. Register your interest ` +
        `on this page and our team will notify you the moment new projects launch.`,
    });
  if (d.top_projects.length)
    faqs.push({
      q: `What are the main projects by ${d.name}?`,
      a:
        `Notable ${d.name} projects on DealFinder include ` +
        `${d.top_projects.join(", ")}.`,
    });
  if (areas.length)
    faqs.push({
      q: `Where does ${d.name} build in Egypt?`,
      a:
        `${d.name} develops projects in ` +
        `${areas.slice(0, 6).join(", ")}` +
        (areas.length > 6 ? ` and other areas` : "") +
        `.`,
    });
  if (d.min_price)
    faqs.push({
      q: `What is the price of ${d.name} properties?`,
      a:
        `${d.name} properties on DealFinder start from ${fmtPrice(d.min_price)}. ` +
        `Prices vary by project, unit type and payment plan.`,
    });
  faqs.push({
    q: `How can I buy a ${d.name} property?`,
    a:
      `Browse ${d.name}'s listings on DealFinder, compare prices and payment ` +
      `plans, then request a callback — our team handles viewings and booking ` +
      `from start to finish.`,
  });
  return faqs;
}
function buildAbout(d) {
  const proj = d.compounds_count;
  const props = d.properties_count;
  const areas = d.areas;
  const bits = [];
  bits.push(
    `${d.name} is an Egyptian real estate developer` +
      (d.established_year ? `, established in ${d.established_year}` : "") +
      "."
  );
  if (proj > 0) {
    const areaPart =
      areas.length === 1
        ? ` in ${areas[0]}`
        : areas.length > 1
          ? ` across ${areas.slice(0, 4).join(", ")}` +
            (areas.length > 4 ? ` and ${areas.length - 4} more areas` : "")
          : "";
    bits.push(
      `It currently has ${props.toLocaleString("en-US")} ` +
        `${props === 1 ? "property" : "properties"} for sale across ` +
        `${proj} ${proj === 1 ? "project" : "projects"}${areaPart} on DealFinder.`
    );
    if (d.min_price)
      bits.push(`Prices start from ${fmtPrice(d.min_price)}.`);
  } else {
    bits.push(
      `Browse this developer's profile and register your interest to be ` +
        `notified when new ${d.name} units launch.`
    );
  }
  return bits.join(" ");
}
const developers = [];
for (const d of devById.values()) {
  d.compounds_count = devCompSet.get(d.nawy_id)?.size ?? 0;
  d.properties_count = devUnits.get(d.nawy_id) ?? 0;
  d.min_price = devMinPrice.get(d.nawy_id) ?? d.nawy_min_price ?? null;
  const ourAreas = [...(devAreaNames.get(d.nawy_id) ?? [])];
  d.areas = ourAreas.length ? ourAreas : d.nawy_areas;
  d.top_projects = devTopProjects.get(d.nawy_id) ?? [];
  const about = buildAbout(d);
  developers.push({
    nawy_id: d.nawy_id,
    name: d.name,
    slug: d.slug,
    logo_url: d.logo_url,
    min_price: d.min_price,
    compounds_count: d.compounds_count,
    properties_count: d.properties_count,
    established_year: d.established_year,
    areas: d.areas,
    about,
    faqs: buildFaqs(d),
    meta_title: `${d.name} — Projects & Properties for Sale | DealFinder`,
    meta_description:
      d.properties_count > 0
        ? `Explore ${d.properties_count.toLocaleString("en-US")} properties ` +
          `from ${d.name} across ${d.compounds_count} projects. ` +
          `Compare prices, payment plans and request a callback on DealFinder.`
        : `${d.name} developer profile on DealFinder. ` +
          `Register your interest for upcoming projects and new launches.`,
  });
}
developers.sort((a, b) => b.properties_count - a.properties_count);

// ── 7. unique slugs ────────────────────────────────────────────────────
function uniqueSlugs(rows) {
  const seen = new Set();
  for (const r of rows) {
    let s = r.slug || `id-${r.nawy_id}`;
    if (seen.has(s)) s = `${s}-${r.nawy_id}`;
    seen.add(s);
    r.slug = s;
  }
}
uniqueSlugs(areaList);
uniqueSlugs(developers);
uniqueSlugs(compounds);
uniqueSlugs(units);

// ── 8. write ───────────────────────────────────────────────────────────
const write = (name, rows) => {
  fs.writeFileSync(path.join(DATA, `${name}.json`), JSON.stringify(rows, null, 1));
  console.log(`  ${name}.json: ${rows.length}`);
};
write("areas", areaList);
write("developers", developers);
write("compounds", compounds);
write("units", units);

// ── 9. integrity report ────────────────────────────────────────────────
const areaIds = new Set(areaList.map((a) => a.nawy_id));
const devIds = new Set(developers.map((d) => d.nawy_id));
const compIds = new Set(compounds.map((c) => c.nawy_id));
const dang = (arr, ok) => arr.filter((x) => !ok(x)).length;
console.log("Integrity (all should be 0):");
console.log(
  `  units→compound:   ${dang(units, (u) => compIds.has(u.compound_nawy_id))}`
);
console.log(
  `  units→area:       ${dang(units, (u) => u.area_nawy_id == null || areaIds.has(u.area_nawy_id))}`
);
console.log(
  `  units→developer:  ${dang(units, (u) => u.developer_nawy_id == null || devIds.has(u.developer_nawy_id))}`
);
console.log(
  `  compound→area:    ${dang(compounds, (c) => c.area_nawy_id == null || areaIds.has(c.area_nawy_id))}`
);
console.log(
  `  compound→developer:${dang(compounds, (c) => c.developer_nawy_id == null || devIds.has(c.developer_nawy_id))}`
);
const devWithInv = developers.filter((d) => d.properties_count > 0).length;
console.log(
  `Developers: ${developers.length} total, ${devWithInv} with inventory, ${
    developers.length - devWithInv
  } without`
);
console.log("Done.");
