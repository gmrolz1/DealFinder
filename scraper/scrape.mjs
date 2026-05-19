// DealFinder scraper — collects FACTUAL data from nawy.com.
//
// Strategy: every nawy page embeds a __NEXT_DATA__ JSON blob. A compound
// page contains the full compound object AND its units (availablePropertyTypes).
// So we iterate compound URLs from the sitemap — one request each.
//
// Output: normalized JSON in scraper/data/. Descriptions are NOT copied;
// they are generated later (see scraper/generate-descriptions.mjs).
//
// Run:  node scraper/scrape.mjs            (full run)
//       node scraper/scrape.mjs --limit 20 (quick test)

import { writeFile, mkdir } from "node:fs/promises";

const SITEMAP_INDEX = "https://www.nawy.com/sitemap.xml";
const CONCURRENCY = 5;          // be polite — low concurrency
const DELAY_MS = 250;           // pause between requests per worker
const OUT_DIR = new URL("./data/", import.meta.url);

const args = process.argv.slice(2);
const limit = args.includes("--limit")
  ? parseInt(args[args.indexOf("--limit") + 1], 10)
  : Infinity;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 DealFinder-scraper" },
      });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch (e) {
      if (i === tries - 1) throw e;
    }
    await sleep(800 * (i + 1));
  }
  return null;
}

function extractNextData(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

// --- 1. collect all EN compound URLs from the sitemap ----------------------
async function getCompoundUrls() {
  const index = await fetchText(SITEMAP_INDEX);
  const childMaps = [...index.matchAll(/<loc>([^<]*compounds[^<]*)<\/loc>/g)]
    .map((m) => m[1]);
  const urls = new Set();
  for (const map of childMaps) {
    const xml = await fetchText(map);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = m[1];
      // EN compound pages only: /compound/slug  (skip /ar/...)
      if (/^https:\/\/www\.nawy\.com\/compound\//.test(u)) urls.add(u);
    }
  }
  return [...urls];
}

// --- 2. normalize one compound page ----------------------------------------
const areas = new Map();
const developers = new Map();
const compounds = [];
const units = [];

function recordArea(id, name, slug) {
  if (id != null && !areas.has(id)) areas.set(id, { id, name, slug });
}
function recordDeveloper(id, name, logo) {
  if (id != null && !developers.has(id))
    developers.set(id, { id, name, logo_url: logo || null });
}

function parseCompoundPage(data) {
  const p = data?.props?.pageProps;
  const c = p?.compound;
  if (!c) return;

  recordArea(c.areaId, c.areaName, c.areaSlug);
  recordDeveloper(c.developerId, c.developerName, c.developerLogoUrl);

  compounds.push({
    nawy_id: c.id,
    name: c.name,
    display_name: c.displayName,
    slug: c.slugEn || c.slug,
    area_nawy_id: c.areaId,
    developer_nawy_id: c.developerId,
    lat: c.lat ?? null,
    lng: c.long ?? null,
    amenities: (c.amenities || []).map((a) => a.name).filter(Boolean),
    properties_count: c.propertiesCount ?? null,
    min_price: c.prices?.resaleStartingPrice ?? null,
    // NOTE: nawy's description intentionally NOT stored — generated later.
    source_meta_title: c.metaTitle || null,
  });

  for (const type of p.availablePropertyTypes || []) {
    for (const u of type.properties || []) {
      units.push({
        nawy_id: u.id,
        name: u.name,
        slug: u.slug,
        compound_nawy_id: c.id,
        property_type: u.property_type?.name || type.name || null,
        bedrooms: u.number_of_bedrooms ?? null,
        bathrooms: u.number_of_bathrooms ?? null,
        min_area_sqm: u.min_unit_area ?? null,
        max_area_sqm: u.max_unit_area ?? null,
        min_price: u.min_price ?? null,
        max_price: u.max_price ?? null,
        currency: u.currency || "EGP",
        finishing: u.finishing || null,
        ready_by: u.min_ready_by || null,
        resale: !!u.resale,
      });
    }
  }
}

// --- 3. run ----------------------------------------------------------------
async function main() {
  console.log("Fetching compound URL list from sitemap...");
  let urls = await getCompoundUrls();
  if (Number.isFinite(limit)) urls = urls.slice(0, limit);
  console.log(`Scraping ${urls.length} compound pages...`);

  let done = 0;
  async function worker(queue) {
    while (queue.length) {
      const url = queue.pop();
      const html = await fetchText(url);
      if (html) {
        const data = extractNextData(html);
        if (data) {
          try {
            parseCompoundPage(data);
          } catch (e) {
            console.warn("parse error", url, e.message);
          }
        }
      }
      done++;
      if (done % 25 === 0) console.log(`  ${done}/${urls.length}`);
      await sleep(DELAY_MS);
    }
  }

  const queue = [...urls];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker(queue))
  );

  await mkdir(OUT_DIR, { recursive: true });
  const write = (name, val) =>
    writeFile(new URL(name, OUT_DIR), JSON.stringify(val, null, 2));

  await write("areas.json", [...areas.values()]);
  await write("developers.json", [...developers.values()]);
  await write("compounds.json", compounds);
  await write("units.json", units);

  console.log("\nDone:");
  console.log(`  areas:      ${areas.size}`);
  console.log(`  developers: ${developers.size}`);
  console.log(`  compounds:  ${compounds.length}`);
  console.log(`  units:      ${units.length}`);
  console.log("Output written to scraper/data/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
