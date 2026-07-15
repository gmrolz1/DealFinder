// Data access layer.
//
// MVP: data is read from the scraped JSON in scraper/data/. When Supabase
// is connected, only this file changes — pages consume the typed functions.
//
// Only DEVELOPER (primary) units are exposed. Resale and Nawy Now units
// are filtered out at load time.

import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "scraper", "data");
const ALLOWED_SALE_TYPES = new Set(["primary"]);

// Compounds hidden from the entire site. The scraped data is kept intact —
// these are just never served (survives re-scrapes; reversible). Add a
// compound nawy_id here to remove a whole project everywhere at once.
const HIDDEN_COMPOUND_IDS = new Set<number>([
  392, // The Groove (Ain Sokhna)
  488, // Tonino Lamborghini Residences
  542, // Zia Business Complex
]);

function loadFile<T>(name: string): T[] {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf8")
    ) as T[];
  } catch {
    return [];
  }
}

// Clean, URL-safe slug. nawy's raw unit slugs contain spaces and brackets,
// which break routing (~65% of unit pages 404'd without this).
function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- types -----------------------------------------------------------------
export type Area = {
  nawy_id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  image_url: string | null;
  compounds_count: number | null;
  properties_count: number | null;
};

export type Developer = {
  nawy_id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  logo_url: string | null;
  min_price: number | null;
  compounds_count: number | null;
  properties_count: number | null;
  established_year: number | null;
  areas: string[];
  areas_ar: string[];
  about: string | null;
  about_ar: string | null;
  faqs: { q: string; a: string }[];
  faqs_ar: { q: string; a: string }[];
  meta_title: string | null;
  meta_title_ar: string | null;
  meta_description: string | null;
  meta_description_ar: string | null;
};

export type Compound = {
  nawy_id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  area_nawy_id: number | null;
  developer_nawy_id: number | null;
  lng: number | null;
  lat: number | null;
  image_url: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  property_types: string[];
  property_types_ar: string[];
  min_price: number | null;
  ready_by: number | null;
};

export type Unit = {
  nawy_id: number;
  slug: string;
  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;
  property_type: string | null;
  property_type_ar: string | null;
  compound_nawy_id: number | null;
  area_nawy_id: number | null;
  developer_nawy_id: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  finishing: string | null;
  ready_by: string | null;
  sale_type: string | null;
  image_url: string | null;
  price: number | null;
  currency: string;
  down_payment: number | null;
  installment_years: number | null;
};

export type EnrichedUnit = Unit & {
  areaName: string | null;
  areaNameAr: string | null;
  areaSlug: string | null;
  compoundName: string | null;
  compoundNameAr: string | null;
  compoundSlug: string | null;
  developerName: string | null;
  developerNameAr: string | null;
  // Gemini-generated ad titles (scraper/data/usp-titles.json). null when none
  // has been generated for this unit — lib/usp.ts falls back to a template.
  uspTitleEn: string | null;
  uspTitleAr: string | null;
};

export type WithCount<T> = T & { available: number };

// Gemini-generated marketing titles, written by scripts/gen-usp-titles.mjs.
// Keyed by unit nawy_id.
type UspTitle = { en?: string; ar?: string };

function loadUspTitles(): Map<number, UspTitle> {
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, "usp-titles.json"), "utf8")
    ) as Record<string, UspTitle>;
    return new Map(
      Object.entries(raw).map(([k, v]) => [Number(k), v])
    );
  } catch {
    return new Map();
  }
}

// --- in-memory store -------------------------------------------------------
type Store = {
  areas: Area[];
  developers: Developer[];
  compounds: Compound[];
  units: Unit[];
  areaById: Map<number, Area>;
  compoundById: Map<number, Compound>;
  developerById: Map<number, Developer>;
  areaBySlug: Map<string, Area>;
  compoundBySlug: Map<string, Compound>;
  developerBySlug: Map<string, Developer>;
  unitsByArea: Map<number, number>;
  unitsByCompound: Map<number, number>;
  unitsByDeveloper: Map<number, number>;
  uspTitles: Map<number, UspTitle>;
};

// Card-image overrides — swaps a unit's default photo for a stronger render
// of the same project already in the dataset (same CDN, no rehosting). Used
// where the default is a generic landscape / interior / lobby shot that makes
// the campaign card unreadable at grid size.
const UNIT_IMAGE_OVERRIDES: Record<number, string> = {
  // Zomra East studio: default was a golf-course landscape with no building.
  229268:
    "https://s3.eu-central-1.amazonaws.com/prod.images.cooingestate.com/admin/property_image/image/452503/Screenshot_2025-07-21_164050.png",
  // Notion apartment: default was a kitchen interior for a semi-finished unit.
  125867:
    "https://s3.eu-central-1.amazonaws.com/prod.images.cooingestate.com/admin/compound/cover_image/1108/Screenshot_2025-06-01_110747_notion.png",
  // Garnet studio: default was an entrance-lobby shot.
  280181:
    "https://s3.eu-central-1.amazonaws.com/prod.images.cooingestate.com/admin/inventory/brochure_images/Jadeer%20Realestate/garnet/1-Sales_Presentation_17-9-2024_Page_20_Image_0001%202/1-Sales_Presentation_17-9-2024_Page_20_Image_0001%202.jpg",
  // RIVAN 3-bed: default was a living-room shot; aerial compound view reads
  // better next to the sibling RIVAN card.
  278153:
    "https://s3.eu-central-1.amazonaws.com/prod.images.cooingestate.com/admin/compound_image/image/1974/YMI13Qw1t9JnCrK4AEp05DnQC7VlfW.jpg",
};

let _store: Store | null = null;

function store(): Store {
  if (_store) return _store;

  const areas = loadFile<Area>("areas").map((a) => ({
    ...a,
    slug: slugify(a.slug),
  }));
  const developers = loadFile<Developer>("developers").map((d) => ({
    ...d,
    slug: slugify(d.slug),
  }));
  const compounds = loadFile<Compound>("compounds")
    .filter((c) => !HIDDEN_COMPOUND_IDS.has(c.nawy_id))
    .map((c) => ({
      ...c,
      slug: slugify(c.slug),
    }));
  const units = loadFile<Unit>("units")
    .filter((u) => u.sale_type != null && ALLOWED_SALE_TYPES.has(u.sale_type))
    .filter((u) => !HIDDEN_COMPOUND_IDS.has(u.compound_nawy_id ?? -1))
    .map((u) => ({
      ...u,
      slug: slugify(u.slug),
      image_url: UNIT_IMAGE_OVERRIDES[u.nawy_id] ?? u.image_url,
    }));

  const unitsByArea = new Map<number, number>();
  const unitsByCompound = new Map<number, number>();
  const unitsByDeveloper = new Map<number, number>();
  const bump = (m: Map<number, number>, k: number | null) => {
    if (k != null) m.set(k, (m.get(k) ?? 0) + 1);
  };
  for (const u of units) {
    bump(unitsByArea, u.area_nawy_id);
    bump(unitsByCompound, u.compound_nawy_id);
    bump(unitsByDeveloper, u.developer_nawy_id);
  }

  _store = {
    areas,
    developers,
    compounds,
    units,
    areaById: new Map(areas.map((a) => [a.nawy_id, a])),
    compoundById: new Map(compounds.map((c) => [c.nawy_id, c])),
    developerById: new Map(developers.map((d) => [d.nawy_id, d])),
    areaBySlug: new Map(areas.map((a) => [a.slug, a])),
    compoundBySlug: new Map(compounds.map((c) => [c.slug, c])),
    developerBySlug: new Map(developers.map((d) => [d.slug, d])),
    unitsByArea,
    unitsByCompound,
    unitsByDeveloper,
    uspTitles: loadUspTitles(),
  };
  return _store;
}

function enrich(u: Unit): EnrichedUnit {
  const s = store();
  const compound = u.compound_nawy_id
    ? s.compoundById.get(u.compound_nawy_id)
    : undefined;
  const area = u.area_nawy_id ? s.areaById.get(u.area_nawy_id) : undefined;
  const dev = u.developer_nawy_id
    ? s.developerById.get(u.developer_nawy_id)
    : undefined;
  return {
    ...u,
    areaName: area?.name ?? null,
    areaNameAr: area?.name_ar ?? null,
    areaSlug: area?.slug ?? null,
    compoundName: compound?.name ?? null,
    compoundNameAr: compound?.name_ar ?? null,
    compoundSlug: compound?.slug ?? null,
    developerName: dev?.name ?? null,
    developerNameAr: dev?.name_ar ?? null,
    uspTitleEn: s.uspTitles.get(u.nawy_id)?.en ?? null,
    uspTitleAr: s.uspTitles.get(u.nawy_id)?.ar ?? null,
  };
}

// --- stats & home ----------------------------------------------------------
export function getStats() {
  const s = store();
  const activeCompounds = new Set(
    s.units.map((u) => u.compound_nawy_id).filter(Boolean)
  ).size;
  return {
    units: s.units.length,
    compounds: activeCompounds,
    areas: s.unitsByArea.size,
    developers: s.unitsByDeveloper.size,
  };
}

export function getPropertyTypes(): string[] {
  const set = new Set<string>();
  for (const u of store().units) if (u.property_type) set.add(u.property_type);
  return [...set].sort();
}

/** Dedupe a unit list down to one entry per compound — keeps featured /
 * new-launch sections from showing the same project 6 times in a row. */
function uniqueByCompound(list: Unit[]): Unit[] {
  const seen = new Set<number>();
  const out: Unit[] = [];
  for (const u of list) {
    const c = u.compound_nawy_id;
    if (c == null) {
      out.push(u);
      continue;
    }
    if (seen.has(c)) continue;
    seen.add(c);
    out.push(u);
  }
  return out;
}

export function getFeaturedUnits(n: number): EnrichedUnit[] {
  const candidates = store().units.filter(
    (u) => u.image_url && (u.price ?? 0) > 0
  );
  return uniqueByCompound(candidates).slice(40, 40 + n).map(enrich);
}

export function getNewLaunchUnits(n: number): EnrichedUnit[] {
  const sorted = [...store().units]
    .filter((u) => u.image_url && u.ready_by)
    .sort(
      (a, b) =>
        new Date(b.ready_by!).getTime() - new Date(a.ready_by!).getTime()
    );
  return uniqueByCompound(sorted).slice(0, n).map(enrich);
}

// --- areas -----------------------------------------------------------------
export function getAreas(): Area[] {
  return [...store().areas].sort((a, b) => a.name.localeCompare(b.name));
}

export function getAreasWithCounts(): WithCount<Area>[] {
  const s = store();
  return s.areas
    .map((a) => ({ ...a, available: s.unitsByArea.get(a.nawy_id) ?? 0 }))
    .sort((a, b) => b.available - a.available);
}

export function getPopularAreas(n: number): WithCount<Area>[] {
  return getAreasWithCounts()
    .filter((a) => a.available > 0)
    .slice(0, n);
}

export function getAreaBySlug(slug: string): Area | null {
  return store().areaBySlug.get(slug) ?? null;
}

// --- developers ------------------------------------------------------------
export function getDevelopersWithCounts(): WithCount<Developer>[] {
  const s = store();
  return s.developers
    .map((d) => ({ ...d, available: s.unitsByDeveloper.get(d.nawy_id) ?? 0 }))
    .sort((a, b) => b.available - a.available);
}

export function getTopDevelopers(n: number): WithCount<Developer>[] {
  return getDevelopersWithCounts()
    .filter((d) => d.available > 0)
    .slice(0, n);
}

export function getDeveloperBySlug(slug: string): Developer | null {
  return store().developerBySlug.get(slug) ?? null;
}

// --- compounds -------------------------------------------------------------
export function getCompoundBySlug(slug: string): Compound | null {
  return store().compoundBySlug.get(slug) ?? null;
}

export function getCompoundsByArea(
  areaId: number | number[]
): WithCount<Compound>[] {
  const s = store();
  const ids = new Set(Array.isArray(areaId) ? areaId : [areaId]);
  return s.compounds
    .filter((c) => c.area_nawy_id != null && ids.has(c.area_nawy_id))
    .map((c) => ({ ...c, available: s.unitsByCompound.get(c.nawy_id) ?? 0 }))
    .filter((c) => c.available > 0)
    .sort((a, b) => b.available - a.available);
}

export function getCompoundsByDeveloper(devId: number): WithCount<Compound>[] {
  const s = store();
  return s.compounds
    .filter((c) => c.developer_nawy_id === devId)
    .map((c) => ({ ...c, available: s.unitsByCompound.get(c.nawy_id) ?? 0 }))
    .filter((c) => c.available > 0)
    .sort((a, b) => b.available - a.available);
}

export function getAreaName(id: number | null): string | null {
  return id ? store().areaById.get(id)?.name ?? null : null;
}

export function getAreaNameAr(id: number | null): string | null {
  if (!id) return null;
  const a = store().areaById.get(id);
  return a?.name_ar ?? a?.name ?? null;
}

export function getDeveloperOfCompound(c: Compound): Developer | null {
  return c.developer_nawy_id
    ? store().developerById.get(c.developer_nawy_id) ?? null
    : null;
}

// --- units -----------------------------------------------------------------
export function getUnitBySlug(slug: string): EnrichedUnit | null {
  const u = store().units.find((x) => x.slug === slug);
  return u ? enrich(u) : null;
}

export function getUnitsByCompound(compoundId: number): EnrichedUnit[] {
  return store()
    .units.filter((u) => u.compound_nawy_id === compoundId)
    .map(enrich);
}

/** Official per-unit photos dropped into public/units/<nawy_id>/ — lets the
 * team replace a single listing's images with developer-supplied ones without
 * touching code or the dataset. Returns web paths, sorted by filename. */
export function getLocalUnitImages(nawyId: number): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "units", String(nawyId));
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/units/${nawyId}/${f}`);
  } catch {
    return [];
  }
}

/** Best-effort per-unit gallery: official local photos (public/units/<id>/)
 * fully replace the dataset images when present; otherwise the unit's own image
 * first, then a handful of other unit images from the same compound. */
export function getUnitGallery(unit: Unit, max = 8): string[] {
  const local = getLocalUnitImages(unit.nawy_id);
  if (local.length) return local.slice(0, max);
  const own = unit.image_url ? [unit.image_url] : [];
  if (!unit.compound_nawy_id) return own;
  const siblings = store()
    .units.filter(
      (u) =>
        u.compound_nawy_id === unit.compound_nawy_id &&
        u.nawy_id !== unit.nawy_id &&
        u.image_url
    )
    .map((u) => u.image_url as string);
  return Array.from(new Set([...own, ...siblings])).slice(0, max);
}

/** Official photos dropped into public/compounds/<slug>/ — lets the team add
 * developer-supplied renders without touching code. Returns web paths. */
export function getLocalCompoundImages(slug: string): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "compounds", slug);
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => `/compounds/${slug}/${f}`);
  } catch {
    return [];
  }
}

/** Compound-level gallery: official local photos first, then the compound hero
 * image, then the distinct unit/brochure images already in the dataset. No new
 * images are stored — these are the same URLs the property cards already show. */
export function getCompoundGallery(
  compoundId: number,
  slug: string,
  max = 12
): string[] {
  const s = store();
  const compound = s.compoundById.get(compoundId);
  const local = getLocalCompoundImages(slug);
  const hero = compound?.image_url ? [compound.image_url] : [];
  const unitImgs = s.units
    .filter((u) => u.compound_nawy_id === compoundId && u.image_url)
    .map((u) => u.image_url as string);
  return Array.from(new Set([...local, ...hero, ...unitImgs])).slice(0, max);
}

export function getUnitsByDeveloper(devId: number): EnrichedUnit[] {
  return store()
    .units.filter((u) => u.developer_nawy_id === devId)
    .map(enrich);
}

// A "browse by type" group for a developer page: one property type with its
// count, from-price, monthly, a hero image, and a few sample units. Sorted
// by inventory size so the biggest categories lead.
export type UnitTypeGroup = {
  type: string;
  typeAr: string | null;
  count: number;
  minPrice: number | null;
  minMonthly: number | null;
  image: string | null;
  samples: EnrichedUnit[];
};

/** Group a developer's (or any) units by property_type, image-forward. */
export function groupUnitsByType(units: EnrichedUnit[]): UnitTypeGroup[] {
  const byType = new Map<string, EnrichedUnit[]>();
  for (const u of units) {
    const key = u.property_type ?? "Other";
    const arr = byType.get(key);
    if (arr) arr.push(u);
    else byType.set(key, [u]);
  }
  const groups: UnitTypeGroup[] = [];
  for (const [type, list] of byType) {
    const prices = list
      .map((u) => u.price)
      .filter((p): p is number => typeof p === "number" && p > 0);
    const monthlies = list
      .map((u) =>
        u.price && u.installment_years && u.installment_years > 0
          ? Math.round(u.price / u.installment_years / 12)
          : null
      )
      .filter((m): m is number => m != null && m > 0);
    // Prefer a unit that actually has an image for the group hero.
    const withImg = list.find((u) => u.image_url);
    groups.push({
      type,
      typeAr: list.find((u) => u.property_type_ar)?.property_type_ar ?? null,
      count: list.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      minMonthly: monthlies.length ? Math.min(...monthlies) : null,
      image: withImg?.image_url ?? null,
      // Image-first samples for the group's preview strip.
      samples: [...list]
        .sort((a, b) => (b.image_url ? 1 : 0) - (a.image_url ? 1 : 0))
        .slice(0, 8),
    });
  }
  return groups.sort((a, b) => b.count - a.count);
}

/** Convenience: type groups for one developer. */
export function getDeveloperTypeGroups(devId: number): UnitTypeGroup[] {
  return groupUnitsByType(getUnitsByDeveloper(devId));
}

// Drill-down tree for the developer explorer: Type → Bedrooms → Areas.
// Each level carries count + from-price + a representative unit slug (for the
// WhatsApp prefill) so the client component can render without any extra data.
export type AreaBucket = {
  areaId: number | null;
  area: string;
  areaAr: string;
  areaSlug: string | null;
  count: number;
  minPrice: number | null;
  sampleSlug: string | null;
};
export type BedBucket = {
  beds: number; // -1 = studio / unspecified
  count: number;
  minPrice: number | null;
  minMonthly: number | null;
  sampleSlug: string | null;
  areas: AreaBucket[];
};
export type TypeNode = UnitTypeGroup & {
  sampleSlug: string | null;
  beds: BedBucket[];
};

function minPriceOf(list: EnrichedUnit[]): number | null {
  const p = list
    .map((u) => u.price)
    .filter((x): x is number => typeof x === "number" && x > 0);
  return p.length ? Math.min(...p) : null;
}
function minMonthlyOf(list: EnrichedUnit[]): number | null {
  const m = list
    .map((u) =>
      u.price && u.installment_years && u.installment_years > 0
        ? Math.round(u.price / u.installment_years / 12)
        : null
    )
    .filter((x): x is number => x != null && x > 0);
  return m.length ? Math.min(...m) : null;
}
// Cheapest unit that has an image → best CTA / prefill representative.
function repSlug(list: EnrichedUnit[]): string | null {
  const withImg = [...list]
    .filter((u) => u.image_url && (u.price ?? 0) > 0)
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
  return (withImg ?? list.find((u) => u.image_url) ?? list[0])?.slug ?? null;
}

export function getDeveloperTypeTree(devId: number): TypeNode[] {
  const s = store();
  const units = getUnitsByDeveloper(devId);
  const groups = groupUnitsByType(units);
  const byType = new Map<string, EnrichedUnit[]>();
  for (const u of units) {
    const k = u.property_type ?? "Other";
    (byType.get(k) ?? byType.set(k, []).get(k)!).push(u);
  }

  return groups.map((g) => {
    const list = byType.get(g.type) ?? [];
    // group by bedrooms
    const byBed = new Map<number, EnrichedUnit[]>();
    for (const u of list) {
      const b = u.bedrooms != null && u.bedrooms > 0 ? u.bedrooms : -1;
      (byBed.get(b) ?? byBed.set(b, []).get(b)!).push(u);
    }
    const beds: BedBucket[] = [...byBed.entries()]
      .map(([b, blist]) => {
        // group by area within this type+bed
        const byArea = new Map<number, EnrichedUnit[]>();
        for (const u of blist) {
          const a = u.area_nawy_id ?? -1;
          (byArea.get(a) ?? byArea.set(a, []).get(a)!).push(u);
        }
        const areas: AreaBucket[] = [...byArea.entries()]
          .map(([aid, alist]) => {
            const area = aid > 0 ? s.areaById.get(aid) : undefined;
            return {
              areaId: aid > 0 ? aid : null,
              area: area?.name ?? "—",
              areaAr: area?.name_ar ?? area?.name ?? "—",
              areaSlug: area?.slug ?? null,
              count: alist.length,
              minPrice: minPriceOf(alist),
              sampleSlug: repSlug(alist),
            };
          })
          .sort((x, y) => y.count - x.count);
        return {
          beds: b,
          count: blist.length,
          minPrice: minPriceOf(blist),
          minMonthly: minMonthlyOf(blist),
          sampleSlug: repSlug(blist),
          areas,
        };
      })
      // studio/unspecified last, otherwise ascending bedroom count
      .sort((x, y) => (x.beds < 0 ? 99 : x.beds) - (y.beds < 0 ? 99 : y.beds));

    return { ...g, sampleSlug: repSlug(list), beds };
  });
}

export function getSimilarUnits(unit: EnrichedUnit, n: number): EnrichedUnit[] {
  return store()
    .units.filter(
      (u) =>
        u.nawy_id !== unit.nawy_id &&
        u.area_nawy_id === unit.area_nawy_id &&
        u.image_url
    )
    .slice(0, n)
    .map(enrich);
}

// --- area deals (campaign landing) ----------------------------------------

/** Collapse a compound name to its project "family" so phases, strip malls and
 * numbered sisters of one project count together (VILLAGE DE LA CAPITALE-Phase
 * 1/2 → one family; "De joya 2 strip mall" / "De Joya 3" → the De Joya brand). */
function compoundFamily(name: string | null | undefined): string {
  return (name ?? "")
    .toLowerCase()
    .replace(/[-–—_]/g, " ")
    .replace(/\b(?:phase|ph)\s*\d+\b/g, "")
    .replace(/المرحلة\s+\S+/g, "")
    .replace(/\bstrip\s*mall\b/g, "")
    .replace(/\s+\d+\s*$/g, "") // trailing standalone number: "de joya 2" → "de joya"
    .replace(/\s+/g, ""); // collapse spacing variants: "De joya" / "DeJoya"
}

/** Units whose image_url is a dead link (verified 403/404) — never put these
 * on a paid landing page, the card renders as an empty black box. */
const BROKEN_IMAGE_UNIT_IDS = new Set([74151]);

/** Units pulled from the campaign landings at the owner's request.
 * 124148: Madar Mall clinic — was the "cheapest on page" card, but the ads
 * search-term report shows buyers want cheap APARTMENTS, not a 20%-down
 * clinic. */
const CAMPAIGN_EXCLUDED_UNIT_IDS = new Set([124148]);

/** Project families excluded from the campaign landings entirely — without
 * this, removing one Madar Mall unit just lets its near-identical sibling
 * take the slot. */
const CAMPAIGN_EXCLUDED_FAMILY_KEYWORDS = ["madarmall"];

// ── Search-demand signals (Google Ads account 386-792-3119, search-terms
// report 28 May – 9 Jul 2026) ────────────────────────────────────────────────
// What buyers actually type: «ارخص شقق في العاصمة الإدارية» (top category,
// 10k–100k monthly volume, 6 conversions), «استلام فوري» (4 conv, 6.6% CR),
// «شقق رخيصة بالتجمع الخامس», «شقق بمقدم ١٠٠ الف», «شقق تمليك بالتقسيط», and
// by name «كمبوند جاليريا التجمع الخامس» (11% conv rate). The boosts below
// bias the landing-page grid toward that demand.

/** Compound families buyers search for by name (substring match against the
 * normalized family key). */
const SEARCHED_FAMILY_KEYWORDS = ["galleria", "zomra"];

const RESIDENTIAL_TYPES = new Set([
  "apartment",
  "studio",
  "duplex",
  "penthouse",
]);

function readyYearOf(u: Unit): number | null {
  if (!u.ready_by) return null;
  const d = new Date(u.ready_by);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

/** Clinic / office / retail all read as "commercial" to a visitor scanning
 * cards — treat them as one bucket when checking for near-duplicate offers. */
function typeBucket(t: string | null): string {
  const x = (t ?? "").toLowerCase();
  return x === "clinic" || x === "administrative" || x === "office" || x === "retail"
    ? "commercial"
    : x;
}

/** Best-value units in one or more areas for a lead-gen landing page. Ranks by
 * deal strength (low down-payment %, long installment plan) and enforces that
 * every card on the page is visibly distinct:
 *   - never two cards for effectively the same offer (same project family +
 *     type + beds + size, price within 3%) — phases of one launch collapse;
 *   - never two cards sharing the same photo;
 *   - at most 2 cards per project family (so one brand can't flood the grid);
 *   - up to a quarter of the slots reserved for budget units under EGP 3M,
 *     when the area has them, so the page covers more than one budget. */
export function getAreaDeals(
  areaId: number | number[],
  n: number,
  opts: { minPrice?: number; premium?: boolean } = {}
): EnrichedUnit[] {
  // Premium mode (client landings that must NOT surface budget stock): enforce
  // a price floor, and below skip the cheap-price score boosts + the reserved
  // budget slots, so the grid is curated up-market. Default mode is unchanged,
  // so the other landings that call getAreaDeals(area, n) keep their behaviour.
  const minPrice = opts.minPrice ?? 0;
  const premium = opts.premium ?? false;
  const s = store();
  const ids = new Set(Array.isArray(areaId) ? areaId : [areaId]);
  const excludedFamily = (u: Unit) => {
    const fam = compoundFamily(
      (u.compound_nawy_id != null
        ? s.compoundById.get(u.compound_nawy_id)?.name
        : null) ?? u.title
    );
    return CAMPAIGN_EXCLUDED_FAMILY_KEYWORDS.some((k) => fam.includes(k));
  };
  const scored = s.units
    .filter(
      (u) =>
        u.area_nawy_id != null &&
        ids.has(u.area_nawy_id) &&
        u.image_url &&
        !BROKEN_IMAGE_UNIT_IDS.has(u.nawy_id) &&
        !CAMPAIGN_EXCLUDED_UNIT_IDS.has(u.nawy_id) &&
        !excludedFamily(u) &&
        (u.price ?? 0) > 0 &&
        (u.price ?? 0) >= minPrice
    )
    .map((u) => {
      const pct =
        u.down_payment && u.price ? (u.down_payment / u.price) * 100 : null;
      // Deal strength: low down-payment %, long plan.
      let score = 0;
      if (pct != null && pct > 0 && pct <= 10) score += 3;
      else if (pct != null && pct > 0 && pct <= 15) score += 1;
      if ((u.installment_years ?? 0) >= 7) score += 1;
      // Search-demand boosts (see SEARCHED_FAMILY_KEYWORDS block above).
      const residential = RESIDENTIAL_TYPES.has(
        (u.property_type ?? "").toLowerCase()
      );
      // Budget-demand boosts — DEFAULT mode only. Premium landings must not
      // reward cheap stock; the whole point is to keep low-budget leads out.
      if (!premium) {
        if (residential && u.price! <= 3_500_000) score += 2; // «ارخص شقق»
        else if (residential && u.price! <= 4_500_000) score += 1;
        if (u.down_payment && u.down_payment <= 150_000) score += 1; // «مقدم ١٠٠ الف»
      }
      // «استلام فوري»: move-in ready — finished, delivering within a year,
      // and not luxury stock (the demand is affordability, not 30M+ villas).
      const yr = readyYearOf(u);
      const finished = ["finished", "fully_finished", "fully finished", "furnished"].includes(
        (u.finishing ?? "").toLowerCase()
      );
      if (
        finished &&
        yr != null &&
        yr <= new Date().getFullYear() + 1 &&
        u.price! <= 12_000_000
      )
        score += 1;
      const fam = compoundFamily(
        (u.compound_nawy_id != null
          ? s.compoundById.get(u.compound_nawy_id)?.name
          : null) ?? u.title
      );
      // «كمبوند جاليريا» / «زمرة» — searched by name, residential demand only
      // («شقق للبيع كمبوند جاليريا التجمع الخامس», 11% conv rate in the ads
      // account). Budget-search demand, so default mode only. Family cap below
      // still limits each to 2 cards.
      if (
        !premium &&
        residential &&
        SEARCHED_FAMILY_KEYWORDS.some((k) => fam.includes(k))
      )
        score += 5;
      return { u, pct: pct ?? 999, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.pct - b.pct ||
        (a.u.price ?? 0) - (b.u.price ?? 0)
    );

  const usedImages = new Set<string>();
  const perFamily = new Map<string, Unit[]>();
  const picked: Unit[] = [];

  const familyOf = (u: Unit) =>
    compoundFamily(
      (u.compound_nawy_id != null
        ? s.compoundById.get(u.compound_nawy_id)?.name
        : null) ?? u.title
    );

  const accepts = (u: Unit): boolean => {
    if (usedImages.has(u.image_url!)) return false;
    const siblings = perFamily.get(familyOf(u)) ?? [];
    if (siblings.length >= 2) return false;
    for (const p of siblings) {
      const samePrice =
        p.price != null &&
        u.price != null &&
        Math.abs(p.price - u.price) / p.price <= 0.08;
      const sameSize =
        p.area_sqm != null &&
        u.area_sqm != null &&
        Math.abs(p.area_sqm - u.area_sqm) / p.area_sqm <= 0.15;
      if (
        samePrice &&
        sameSize &&
        typeBucket(p.property_type) === typeBucket(u.property_type) &&
        p.bedrooms === u.bedrooms
      )
        return false; // effectively the same offer — one card is enough
    }
    return true;
  };

  const take = (u: Unit) => {
    picked.push(u);
    usedImages.add(u.image_url!);
    const fam = familyOf(u);
    perFamily.set(fam, [...(perFamily.get(fam) ?? []), u]);
  };

  // Pass 1: reserve budget slots (< EGP 3M) so the page isn't all one bracket.
  // Skipped in premium mode — a curated up-market grid deliberately has none.
  if (!premium) {
    const budgetQuota = Math.floor(n / 4);
    let budgetPicked = 0;
    for (const { u } of scored) {
      if (budgetPicked >= budgetQuota) break;
      if ((u.price ?? 0) >= 3_000_000 || !accepts(u)) continue;
      take(u);
      budgetPicked++;
    }
  }

  // Pass 2: fill the rest with the strongest remaining distinct deals.
  for (const { u } of scored) {
    if (picked.length >= n) break;
    if (picked.some((p) => p.nawy_id === u.nawy_id) || !accepts(u)) continue;
    take(u);
  }

  // Present in deal-strength order regardless of which pass picked the unit.
  const rank = new Map(scored.map((x, i) => [x.u.nawy_id, i]));
  picked.sort(
    (a, b) => (rank.get(a.nawy_id) ?? 0) - (rank.get(b.nawy_id) ?? 0)
  );
  return picked.map(enrich);
}

// --- search ----------------------------------------------------------------
export type SearchParams = {
  q?: string;
  type?: string;
  area?: string;
  developer?: string;
  compound?: string;
  beds?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
};

const PER_PAGE = 24;

export function searchUnits(p: SearchParams) {
  let list = store().units;

  if (p.q) {
    const q = p.q.toLowerCase();
    list = list.filter(
      (u) =>
        u.title?.toLowerCase().includes(q) ||
        u.subtitle?.toLowerCase().includes(q)
    );
  }
  if (p.type) list = list.filter((u) => u.property_type === p.type);
  if (p.area) list = list.filter((u) => String(u.area_nawy_id) === p.area);
  if (p.developer)
    list = list.filter((u) => String(u.developer_nawy_id) === p.developer);
  if (p.compound)
    list = list.filter((u) => String(u.compound_nawy_id) === p.compound);
  if (p.beds) {
    const b = parseInt(p.beds, 10);
    list =
      p.beds === "5"
        ? list.filter((u) => (u.bedrooms ?? 0) >= 5)
        : list.filter((u) => u.bedrooms === b);
  }
  if (p.min) list = list.filter((u) => (u.price ?? 0) >= Number(p.min));
  if (p.max) list = list.filter((u) => (u.price ?? Infinity) <= Number(p.max));

  switch (p.sort) {
    case "price-asc":
      list = [...list].sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
      );
      break;
    case "price-desc":
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "area-desc":
      list = [...list].sort((a, b) => (b.area_sqm ?? 0) - (a.area_sqm ?? 0));
      break;
  }

  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(p.page ?? "1", 10) || 1), pages);
  const results = list
    .slice((page - 1) * PER_PAGE, page * PER_PAGE)
    .map(enrich);

  return { results, total, page, pages, perPage: PER_PAGE };
}
