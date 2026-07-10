// Imports Arabian Estate's listing sheet into scraper/data/arabian-estate.json
// in the EnrichedUnit-compatible shape the campaign components consume.
//
// Source: Google Sheet ("Arabian Estate Database" → Listings tab), exported
// as CSV. By default fetches the live sheet; pass a local CSV path to use a
// downloaded copy instead.
//
//   node scripts/import-arabian-estate.mjs                # fetch from sheet
//   node scripts/import-arabian-estate.mjs path/to.csv    # local file
//
// Mapping notes:
// - nawy_id = 90_000_000 + sheet id — keeps these ids clear of real nawy ids
//   so lead dedupe buckets and unit lookups can't collide with the catalog.
// - slug = "ae-<id>-<slugified-titleEn>" — resolved by client-listings.ts,
//   not the main catalog.
// - installment_years = paymentYears; the card recomputes monthly as
//   price/years/12 which can differ slightly from the sheet's monthlyInst
//   (that column often excludes the down payment) — acceptable for cards.
// - Only rows with active != 0 are exported. Sorted by sortOrder.

import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

const SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/1vKocnYHnuwi6K4sQ5HXtaCtAmLMNflQf0eytqGXB9NA/export?format=csv&gid=1631772012";
const OUT = new URL("../scraper/data/arabian-estate.json", import.meta.url);

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuote = false;
      else field += c;
    } else {
      if (c === '"') inQuote = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") field += c;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const num = (v) => {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

// "area-new-capital" → "New Capital"
function humanizeArea(slug) {
  if (!slug) return null;
  return slug
    .replace(/^area-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function firstImage(raw) {
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length > 0 ? String(arr[0]) : null;
  } catch {
    return raw.startsWith("http") ? raw.split(/[,\s]/)[0] : null;
  }
}

function allImages(raw) {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(String).filter((u) => u.startsWith("http")) : [];
  } catch {
    return raw.startsWith("http") ? [raw.split(/[,\s]/)[0]] : [];
  }
}

async function main() {
  const src = process.argv[2];
  let csv;
  if (src) {
    csv = readFileSync(src, "utf8");
    console.log(`reading ${src}`);
  } else {
    console.log("fetching sheet CSV…");
    const res = await fetch(SHEET_CSV, { redirect: "follow" });
    if (!res.ok) throw new Error(`sheet fetch failed: ${res.status}`);
    csv = await res.text();
  }

  const rows = parseCsv(csv);
  const header = rows[0].map((h) => h.trim());
  const col = Object.fromEntries(header.map((h, i) => [h, i]));
  const get = (r, name) => (r[col[name]] ?? "").trim();

  const out = [];
  let skippedInactive = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 6) continue;
    const active = get(r, "active");
    if (active === "0" || active.toLowerCase() === "false") {
      skippedInactive++;
      continue;
    }
    const id = num(get(r, "id")) ?? i;
    const titleEn = get(r, "titleEn") || get(r, "titleAr") || `Unit ${id}`;
    const compound =
      get(r, "project") || get(r, "projectEn") || get(r, "compoundName") || null;
    const compoundAr = get(r, "projectAr") || compound;
    const developer = get(r, "developer") || get(r, "developerEn") || null;

    out.push({
      nawy_id: 90_000_000 + id,
      slug: `ae-${id}-${slugify(titleEn).slice(0, 60)}`,
      title: titleEn,
      title_ar: get(r, "titleAr") || null,
      subtitle: null,
      subtitle_ar: null,
      property_type: get(r, "unitType") || null,
      property_type_ar: null,
      compound_nawy_id: null,
      area_nawy_id: null,
      developer_nawy_id: null,
      bedrooms: num(get(r, "rooms")),
      bathrooms: num(get(r, "toilets")),
      area_sqm: num(get(r, "area")),
      finishing: get(r, "finishing") || null,
      ready_by: get(r, "delivery") || null,
      sale_type: "primary",
      image_url: firstImage(get(r, "images")),
      images: allImages(get(r, "images")),
      price: num(get(r, "price")),
      currency: "EGP",
      down_payment: num(get(r, "downpayment")),
      installment_years: num(get(r, "paymentYears")),
      // enriched fields
      areaName: humanizeArea(get(r, "areaSlug")) ?? humanizeArea(get(r, "location")),
      areaNameAr: null,
      areaSlug: null,
      compoundName: compound,
      compoundNameAr: compoundAr,
      compoundSlug: null,
      developerName: developer,
      developerNameAr: get(r, "developerAr") || developer,
      // ordering
      _sort: num(get(r, "sortOrder")) ?? 999,
      _featured: get(r, "featured") === "1",
    });
  }

  out.sort((a, b) => (b._featured ? 1 : 0) - (a._featured ? 1 : 0) || a._sort - b._sort);
  for (const u of out) {
    delete u._sort;
    delete u._featured;
  }

  await writeFile(OUT, JSON.stringify(out, null, 1), "utf8");
  console.log(
    `wrote ${out.length} listings → scraper/data/arabian-estate.json (skipped ${skippedInactive} inactive)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
