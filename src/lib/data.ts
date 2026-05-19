// Data access layer.
//
// For the MVP, data is read from the scraped JSON in scraper/data/.
// When Supabase is wired up, only this file needs to change — pages and
// components consume the typed functions below, not the raw files.

import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "scraper", "data");

function loadFile<T>(name: string): T[] {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw) as T[];
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
  compoundName: string | null;
  developerName: string | null;
};

// --- in-memory store (cached for the process) ------------------------------
type Store = {
  areas: Area[];
  developers: Developer[];
  compounds: Compound[];
  units: Unit[];
  areaById: Map<number, Area>;
  compoundById: Map<number, Compound>;
  developerById: Map<number, Developer>;
};

let _store: Store | null = null;

function store(): Store {
  if (_store) return _store;
  const areas = loadFile<Area>("areas");
  const developers = loadFile<Developer>("developers");
  const compounds = loadFile<Compound>("compounds");
  const units = loadFile<Unit>("units");
  _store = {
    areas,
    developers,
    compounds,
    units,
    areaById: new Map(areas.map((a) => [a.nawy_id, a])),
    compoundById: new Map(compounds.map((c) => [c.nawy_id, c])),
    developerById: new Map(developers.map((d) => [d.nawy_id, d])),
  };
  return _store;
}

function enrich(u: Unit): EnrichedUnit {
  const s = store();
  return {
    ...u,
    areaName: u.area_nawy_id ? s.areaById.get(u.area_nawy_id)?.name ?? null : null,
    compoundName: u.compound_nawy_id
      ? s.compoundById.get(u.compound_nawy_id)?.name ?? null
      : null,
    developerName: u.developer_nawy_id
      ? s.developerById.get(u.developer_nawy_id)?.name ?? null
      : null,
  };
}

// --- public API ------------------------------------------------------------
export function getAreas(): Area[] {
  return [...store().areas].sort((a, b) => a.name.localeCompare(b.name));
}

export function getStats() {
  const s = store();
  return {
    units: s.units.length,
    compounds: s.compounds.length,
    areas: s.areas.length,
    developers: s.developers.length,
  };
}

export function getPopularAreas(n: number): Area[] {
  return [...store().areas]
    .sort((a, b) => (b.properties_count ?? 0) - (a.properties_count ?? 0))
    .slice(0, n);
}

export function getTopDevelopers(n: number): Developer[] {
  return [...store().developers]
    .sort((a, b) => (b.properties_count ?? 0) - (a.properties_count ?? 0))
    .slice(0, n);
}

export function getPropertyTypes(): string[] {
  const set = new Set<string>();
  for (const u of store().units) if (u.property_type) set.add(u.property_type);
  return [...set].sort();
}

export function getFeaturedUnits(n: number): EnrichedUnit[] {
  return store()
    .units.filter((u) => u.image_url && (u.price ?? 0) > 0)
    .slice(120, 120 + n)
    .map(enrich);
}

export function getUnitBySlug(slug: string): EnrichedUnit | null {
  const u = store().units.find((x) => x.slug === slug);
  return u ? enrich(u) : null;
}

export type SearchParams = {
  q?: string;
  type?: string;
  area?: string;
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
      list = [...list].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
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
