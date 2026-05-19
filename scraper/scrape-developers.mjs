// Scrapes detail records for every nawy developer.
//
// Developer ids come from nawy's sitemap ∪ API listing (scraper/data/
// _dev_ids.json — 518 ids).
//
// Output: scraper/data/developers-full.json — one record per developer with
// FACTUAL fields kept (counts, areas, founding facts, raw FAQ pairs). nawy's
// marketing `description` is kept raw for reference but is NOT used verbatim
// on the site — original copy + Q&A are generated in the build step.
//
// Run: node scraper/scrape-developers.mjs

import fs from "node:fs";
import path from "node:path";

const API = "https://listing-api.nawy.com";
const CONCURRENCY = 6;
const DATA = path.join(process.cwd(), "scraper", "data");
const ids = JSON.parse(fs.readFileSync(path.join(DATA, "_dev_ids.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) =>
  String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

async function getJson(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
      });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
      await sleep((res.status === 429 ? 2000 : 600) * (i + 1));
    } catch {
      await sleep(600 * (i + 1));
    }
  }
  return undefined;
}

// pull factual answers out of the FAQ list
function facts(faqs) {
  const out = {
    established_year: null,
    leadership: null,
    landmark_projects: null,
  };
  for (const f of faqs || []) {
    const q = (f.question || "").toLowerCase();
    const a = clean(f.answer);
    if (!a) continue;
    if (out.established_year == null && /establish|found(ed|ing)?\b/.test(q)) {
      const m = a.match(/\b(19|20)\d{2}\b/);
      if (m) out.established_year = +m[0];
    }
    if (!out.leadership && /\bceo\b|chairman|founder|owner/.test(q))
      out.leadership = a.length <= 80 ? a : null;
    if (!out.landmark_projects && /landmark|notable|famous|key project/.test(q))
      out.landmark_projects = a;
  }
  return out;
}

function toRecord(d) {
  const faqs = (d.faqs || [])
    .map((f) => ({ question: clean(f.question), answer: clean(f.answer) }))
    .filter((f) => f.question && f.answer);
  return {
    nawy_id: d.id,
    name: d.name,
    slug_en: d.slugEn ?? d.slug ?? null,
    slug_ar: d.slugAr ?? null,
    logo_url: d.image ?? null,
    min_price: d.minPrice ?? null,
    properties_count: d.propertiesCount ?? null,
    areas: Array.isArray(d.areas) ? d.areas.map((a) => a.name).filter(Boolean) : [],
    ...facts(d.faqs),
    nawy_faqs: faqs,
    nawy_description: d.description ?? null, // raw — reference only
    launches_count: Array.isArray(d.launches) ? d.launches.length : 0,
  };
}

async function main() {
  console.log(`Scraping ${ids.length} developers...`);
  const results = [];
  const failed = [];
  let done = 0;

  async function worker(queue) {
    for (const id of queue) {
      const d = await getJson(`${API}/v1/developers/${id}`);
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${ids.length}`);
      if (d === undefined) {
        failed.push(id);
        continue;
      }
      if (d === null) continue;
      results.push(toRecord(d));
      await sleep(40);
    }
  }

  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  ids.forEach((id, i) => chunks[i % CONCURRENCY].push(id));
  await Promise.all(chunks.map(worker));

  if (failed.length) {
    console.log(`Retrying ${failed.length} failed...`);
    for (const id of failed) {
      const d = await getJson(`${API}/v1/developers/${id}`, 8);
      if (d) results.push(toRecord(d));
      await sleep(200);
    }
  }

  results.sort((a, b) => a.nawy_id - b.nawy_id);
  fs.writeFileSync(
    path.join(DATA, "developers-full.json"),
    JSON.stringify(results, null, 1)
  );
  console.log(`Done. ${results.length} developers → developers-full.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
