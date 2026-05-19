// DealFinder scraper — collects FACTUAL data from nawy's public JSON API.
//
// nawy's frontend talks to listing-api.nawy.com. We page through the same
// endpoints: areas, developers, compounds, properties. Fast — ~430 calls
// total instead of fetching ~1,800 HTML pages.
//
// Endpoints (pageSize max = 50):
//   GET /v1/areas?page&pageSize
//   GET /v1/developers?page&pageSize
//   GET /v1/search/compounds?page&pageSize
//   GET /v1/search/properties?page&pageSize
//
// Output: normalized JSON in scraper/data/. Descriptions are NOT copied;
// only factual template subtitles are kept. Marketing copy is generated
// later (see docs/PLAN.md).
//
// Run:  node scraper/scrape.mjs            (full)
//       node scraper/scrape.mjs --limit 3  (first 3 pages of each — test)

import { writeFile, mkdir } from "node:fs/promises";

const API = "https://listing-api.nawy.com";
const PAGE_SIZE = 50;
const CONCURRENCY = 4;       // gentle — avoid rate limiting
const REQ_DELAY = 120;       // ms between requests per worker
const OUT_DIR = new URL("./data/", import.meta.url);

const args = process.argv.slice(2);
const limitPages = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 7) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
      });
      if (res.ok) return await res.json();
      // 429 / 5xx -> back off longer
      await sleep((res.status === 429 ? 2000 : 800) * (i + 1));
      continue;
    } catch {
      await sleep(800 * (i + 1));
    }
  }
  return null; // give up on this page — caller logs it
}

// Page through an endpoint. Uses `total` when present; otherwise pages
// until a short page is returned. Resilient: a failed page is recorded
// and retried at the end rather than aborting the whole run.
async function fetchAll(label, path) {
  const first = await getJson(`${API}${path}?page=1&pageSize=${PAGE_SIZE}`);
  if (!first) throw new Error(`${label}: first page failed`);

  const hasTotal = typeof first.total === "number";
  let pages = hasTotal ? Math.ceil(first.total / PAGE_SIZE) : Infinity;
  if (limitPages !== Infinity) pages = Math.min(pages, limitPages);
  console.log(
    `${label}: ${hasTotal ? "total " + first.total : "unknown total"}` +
      `, paging (size ${PAGE_SIZE})...`
  );

  const results = [...first.results];
  const failed = [];
  let next = 2;
  let stop = false;

  async function worker() {
    while (!stop && next <= pages) {
      const page = next++;
      const data = await getJson(
        `${API}${path}?page=${page}&pageSize=${PAGE_SIZE}`
      );
      if (data === null) {
        failed.push(page);
      } else {
        results.push(...data.results);
        // no `total` -> stop when a short page signals the end
        if (!hasTotal && data.results.length < PAGE_SIZE) stop = true;
      }
      await sleep(REQ_DELAY);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  // retry failed pages once, sequentially
  for (const page of failed) {
    const data = await getJson(
      `${API}${path}?page=${page}&pageSize=${PAGE_SIZE}`
    );
    if (data) results.push(...data.results);
    else console.warn(`  ${label}: page ${page} permanently failed`);
    await sleep(REQ_DELAY);
  }

  console.log(`  ${label}: collected ${results.length}`);
  return results;
}

// --- field mapping ---------------------------------------------------------
const mapArea = (a) => ({
  nawy_id: a.id,
  name: a.name,
  slug: a.slugEn || a.slug,
  image_url: a.imageUrl || null,
  compounds_count: a.compoundsCount ?? null,
  properties_count: a.propertiesCount ?? null,
});

const mapDeveloper = (d) => ({
  nawy_id: d.id,
  name: d.name,
  slug: d.slugEn || d.slug,
  logo_url: d.image || null,
  min_price: d.minPrice ?? null,
  compounds_count: d.compoundsCount ?? null,
  properties_count: d.propertiesCount ?? null,
});

const mapCompound = (c) => ({
  nawy_id: c.id,
  name: c.name,
  slug: c.slug,
  area_nawy_id: c.areaId ?? null,
  developer_nawy_id: c.developerId ?? null,
  lng: c.coordinates?.[0] ?? null,
  lat: c.coordinates?.[1] ?? null,
  image_url: c.imageUrl || null,
  subtitle: c.subtitle || null, // factual template line
  property_types: (c.propertyTypes || []).map((t) => t.name),
  min_price: c.developerPlan?.minPrice ?? null,
  ready_by: c.developerPlan?.readyBy ?? null,
  // description: generated later — nawy's copy intentionally not stored.
});

const mapUnit = (u) => ({
  nawy_id: u.id,
  slug: u.slug,
  title: u.title,
  subtitle: u.subtitle || null, // factual template line
  property_type: u.propertyType || null,
  compound_nawy_id: u.compound?.id ?? null,
  area_nawy_id: u.area?.id ?? null,
  developer_nawy_id: u.developer?.id ?? null,
  bedrooms: u.numberOfBedrooms ?? null,
  bathrooms: u.numberOfBathrooms ?? null,
  area_sqm: u.unitArea ?? null,
  finishing: u.finishing || null,
  ready_by: u.readyBy || null,
  sale_type: u.saleType || null,
  image_url: u.imageUrl || null,
  price: u.paymentPlan?.minPrice ?? null,
  currency: u.paymentPlan?.currency || "EGP",
  down_payment: u.paymentPlan?.minDownPayment ?? null,
  installment_years: u.paymentPlan?.numberOfInstallmentYears ?? null,
});

// --- run -------------------------------------------------------------------
async function main() {
  const t0 = Date.now();

  const areas = (await fetchAll("areas", "/v1/areas")).map(mapArea);
  const developers = (await fetchAll("developers", "/v1/developers"))
    .map(mapDeveloper);
  const compounds = (await fetchAll("compounds", "/v1/search/compounds"))
    .map(mapCompound);
  const units = (await fetchAll("properties", "/v1/search/properties"))
    .map(mapUnit);

  await mkdir(OUT_DIR, { recursive: true });
  const write = (name, val) =>
    writeFile(new URL(name, OUT_DIR), JSON.stringify(val, null, 2));
  await write("areas.json", areas);
  await write("developers.json", developers);
  await write("compounds.json", compounds);
  await write("units.json", units);

  console.log("\nDone in", ((Date.now() - t0) / 1000).toFixed(1), "s");
  console.log(`  areas:      ${areas.length}`);
  console.log(`  developers: ${developers.length}`);
  console.log(`  compounds:  ${compounds.length}`);
  console.log(`  units:      ${units.length}`);
  console.log("Output written to scraper/data/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
