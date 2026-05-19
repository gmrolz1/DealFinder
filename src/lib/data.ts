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
const ALLOWED_SALE_TYPES = new Set(["developer_sale"]);

function loadFile<T>(name: string): T[] {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf8")
    ) as T[];
  } catch {
    return [];
  }
}

// --- types -----------------------------------------------------------------
export type Area = {
  nawy_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  compounds_count: number | null;
  properties_count: number | null;
};

export type Developer = {
  nawy_id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  min_price: number | null;
  compounds_count: number | null;
  properties_count: number | null;
};

export type Compound = {
  nawy_id: number;
  name: string;
  slug: string;
  area_nawy_id: number | null;
  developer_nawy_id: number | null;
  lng: number | null;
  lat: number | null;
  image_url: string | null;
  subtitle: string | null;
  property_types: string[];
  min_price: number | null;
  ready_by: number | null;
};

export type Unit = {
  nawy_id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  property_type: string | null;
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
  areaSlug: string | null;
  compoundName: string | null;
  compoundSlug: string | null;
  developerName: string | null;
};

export type WithCount<T> = T & { available: number };

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
};

let _store: Store | null = null;

function store(): Store {
  if (_store) return _store;

  const areas = loadFile<Area>("areas");
  const developers = loadFile<Developer>("developers");
  const compounds = loadFile<Compound>("compounds");
  const units = loadFile<Unit>("units").filter(
    (u) => u.sale_type != null && ALLOWED_SALE_TYPES.has(u.sale_type)
  );

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
  };
  return _store;
}

function enrich(u: Unit): EnrichedUnit {
  const s = store();
  const compound = u.compound_nawy_id
    ? s.compoundById.get(u.compound_nawy_id)
    : undefined;
  const area = u.area_nawy_id ? s.areaById.get(u.area_nawy_id) : undefined;
  return {
    ...u,
    areaName: area?.name ?? null,
    areaSlug: area?.slug ?? null,
    compoundName: compound?.name ?? null,
    compoundSlug: compound?.slug ?? null,
    developerName: u.developer_nawy_id
      ? s.developerById.get(u.developer_nawy_id)?.name ?? null
      : null,
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

export function getFeaturedUnits(n: number): EnrichedUnit[] {
  return store()
    .units.filter((u) => u.image_url && (u.price ?? 0) > 0)
    .slice(40, 40 + n)
    .map(enrich);
}

export function getNewLaunchUnits(n: number): EnrichedUnit[] {
  return [...store().units]
    .filter((u) => u.image_url && u.ready_by)
    .sort(
      (a, b) =>
        new Date(b.ready_by!).getTime() - new Date(a.ready_by!).getTime()
    )
    .slice(0, n)
    .map(enrich);
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

export function getCompoundsByArea(areaId: number): WithCount<Compound>[] {
  const s = store();
  return s.compounds
    .filter((c) => c.area_nawy_id === areaId)
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
