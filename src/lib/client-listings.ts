// Client-supplied listings (Arabian Estate sheet import) — separate from the
// nawy catalog in data.ts. Same EnrichedUnit shape so campaign components
// and /api/go consume both interchangeably. ids live at 90M+ so they can
// never collide with real nawy ids.

import fs from "node:fs";
import path from "node:path";
import type { EnrichedUnit } from "./data";

export type ClientListing = EnrichedUnit & { images?: string[] };

let _arabian: ClientListing[] | null = null;

export function getArabianListings(): ClientListing[] {
  if (_arabian) return _arabian;
  try {
    _arabian = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "scraper", "data", "arabian-estate.json"),
        "utf8"
      )
    ) as ClientListing[];
  } catch {
    _arabian = [];
  }
  return _arabian;
}

export function getArabianListingBySlug(slug: string): ClientListing | null {
  return getArabianListings().find((u) => u.slug === slug) ?? null;
}

export function getArabianStats() {
  const list = getArabianListings();
  return {
    units: list.length,
    compounds: new Set(list.map((u) => u.compoundName).filter(Boolean)).size,
    developers: new Set(list.map((u) => u.developerName).filter(Boolean)).size,
  };
}
