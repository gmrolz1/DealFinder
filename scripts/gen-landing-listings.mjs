// Generate embedded listing data for the standalone landing pages.
// Mirrors getAreaDeals() scoring + conversion.ts calcs. Writes a JS file per
// area that sets window.LISTINGS (loaded via <script src> — works on file://).
// Run: node scripts/gen-landing-listings.mjs

import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "scraper", "data");
const OUT = path.join(process.cwd(), "landing-pages");
const read = (n) => JSON.parse(fs.readFileSync(path.join(DATA, `${n}.json`), "utf8"));

const units = read("units");
const compounds = read("compounds");
const developers = read("developers");
const areas = read("areas");

const compoundById = new Map(compounds.map((c) => [c.nawy_id, c]));
const devById = new Map(developers.map((d) => [d.nawy_id, d]));
const areaById = new Map(areas.map((a) => [a.nawy_id, a]));

const nowYear = 2026;

function downPct(u) {
  if (!u.price || !u.down_payment || u.down_payment <= 0) return null;
  const pct = Math.round((u.down_payment / u.price) * 100);
  return pct > 0 && pct <= 80 ? pct : null;
}
function monthly(u) {
  if (!u.price || !u.installment_years || u.installment_years <= 0) return null;
  return Math.round(u.price / u.installment_years / 12);
}
function compact(n) {
  if (n == null || n <= 0) return null;
  if (n >= 1_000_000) { const m = n / 1_000_000; return `EGP ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`; }
  if (n >= 1000) return `EGP ${Math.round(n / 1000)}K`;
  return `EGP ${n.toLocaleString("en-US")}`;
}
function priceLabel(n) {
  if (!n) return null;
  return `EGP ${Number(n).toLocaleString("en-US")}`;
}
function readyYear(r) {
  if (r == null) return null;
  if (typeof r === "number") { const s = String(r); if (s.length === 8) return s.slice(0, 4); if (s.length === 4) return s; return null; }
  const d = new Date(r); return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
}
function badges(u) {
  const b = [];
  const pct = downPct(u);
  if (pct != null && pct <= 15) b.push({ label: `${pct}% DOWN`, hot: pct <= 5 });
  const y = readyYear(u.ready_by);
  if (y) { const yr = parseInt(y, 10); if (!Number.isNaN(yr) && yr >= nowYear) b.push({ label: yr <= nowYear + 1 ? `READY ${y}` : `DELIVERS ${y}`, hot: false }); }
  return b;
}

function topDeals(areaId, n) {
  const scored = units
    .filter((u) => u.area_nawy_id === areaId && u.image_url && (u.price ?? 0) > 0)
    .map((u) => {
      const pct = u.down_payment && u.price ? (u.down_payment / u.price) * 100 : null;
      let score = 0;
      if (pct != null && pct > 0 && pct <= 10) score += 3;
      else if (pct != null && pct > 0 && pct <= 15) score += 1;
      if ((u.installment_years ?? 0) >= 7) score += 1;
      return { u, pct: pct ?? 999, score };
    })
    .sort((a, b) => b.score - a.score || a.pct - b.pct || (a.u.price ?? 0) - (b.u.price ?? 0));

  const perCompound = new Map();
  const picked = [];
  for (const { u } of scored) {
    const c = u.compound_nawy_id ?? -1;
    const used = perCompound.get(c) ?? 0;
    if (used >= 2) continue;
    perCompound.set(c, used + 1);
    picked.push(u);
    if (picked.length >= n) break;
  }

  return picked.map((u) => {
    const comp = compoundById.get(u.compound_nawy_id);
    const dev = devById.get(u.developer_nawy_id);
    return {
      label: comp?.name ?? u.title ?? "Unit",
      labelAr: comp?.name_ar ?? comp?.name ?? u.title_ar ?? u.title ?? "وحدة",
      type: u.property_type ?? null,
      typeAr: u.property_type_ar ?? u.property_type ?? null,
      developer: dev?.name ?? null,
      developerAr: dev?.name_ar ?? dev?.name ?? null,
      price: priceLabel(u.price),
      bedrooms: u.bedrooms ?? null,
      bathrooms: u.bathrooms ?? null,
      area_sqm: u.area_sqm ?? null,
      down: u.down_payment ? compact(u.down_payment) : null,
      downPct: downPct(u),
      monthly: monthly(u) ? compact(monthly(u)) : null,
      years: u.installment_years ?? null,
      image: u.image_url,
      badges: badges(u),
    };
  });
}

const sets = [
  ["new-capital", 16, "LISTINGS"],
  ["new-cairo", 5, "LISTINGS"],
];

for (const [slug, areaId, varName] of sets) {
  const deals = topDeals(areaId, 9);
  const area = areaById.get(areaId);
  const file = path.join(OUT, `listings-${slug}.js`);
  fs.writeFileSync(
    file,
    `// Auto-generated from the DealFinder dataset. Do not edit by hand.\n` +
      `window.${varName} = ${JSON.stringify({ area: area?.name, areaAr: area?.name_ar, deals }, null, 0)};\n`
  );
  console.log(`✓ listings-${slug}.js — ${deals.length} deals`);
}
console.log("Done.");
