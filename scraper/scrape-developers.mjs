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

async function getJson(url, tries = 6, lang = "en") {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "application/json",
          "accept-language": lang,
        },
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

function cleanFaqs(arr) {
  return (arr || [])
    .map((f) => ({ question: clean(f.question), answer: clean(f.answer) }))
    .filter((f) => f.question && f.answer);
}

// Build a single record that carries BOTH English and Arabic factual fields.
// d_en = nawy detail with Accept-Language: en  (default English)
// d_ar = nawy detail with Accept-Language: ar  (same id, Arabic strings)
function toRecord(d_en, d_ar) {
  return {
    nawy_id: d_en.id,
    name: clean(d_en.name) || null,
    name_ar: clean(d_ar?.name) || null,
    slug_en: d_en.slugEn ?? d_en.slug ?? null,
    slug_ar: d_en.slugAr ?? d_ar?.slugAr ?? null,
    logo_url: d_en.image ?? null,
    min_price: d_en.minPrice ?? null,
    properties_count: d_en.propertiesCount ?? null,
    areas: Array.isArray(d_en.areas)
      ? d_en.areas.map((a) => a.name).filter(Boolean)
      : [],
    areas_ar: Array.isArray(d_ar?.areas)
      ? d_ar.areas.map((a) => a.name).filter(Boolean)
      : [],
    ...facts(d_en.faqs),
    // Arabic leadership: pull the same way from Arabic FAQs (CEO/founder Q).
    leadership_ar: (() => {
      for (const f of d_ar?.faqs || []) {
        const q = (f.question || "").toLowerCase();
        const a = clean(f.answer);
        if (!a) continue;
        // Arabic CEO/founder keywords: مؤسس, صاحب, رئيس
        if (/مؤسس|صاحب|رئيس|ceo|chairman/.test(q) && a.length <= 80) return a;
      }
      return null;
    })(),
    nawy_faqs: cleanFaqs(d_en.faqs),
    nawy_faqs_ar: cleanFaqs(d_ar?.faqs),
    nawy_description: d_en.description ?? null, // raw — reference only
    nawy_description_ar: d_ar?.description ?? null,
    launches_count: Array.isArray(d_en.launches) ? d_en.launches.length : 0,
  };
}

// HEAD-check every logo URL; null the ones nawy doesn't actually serve
// (some developers have no logo — the URL 403s). The UI falls back to a
// letter avatar when logo_url is null.
async function validateLogos(records) {
  let broken = 0;
  const CHUNK = 25;
  for (let i = 0; i < records.length; i += CHUNK) {
    await Promise.all(
      records.slice(i, i + CHUNK).map(async (r) => {
        if (!r.logo_url) return;
        try {
          const res = await fetch(r.logo_url, { method: "HEAD" });
          if (res.status !== 200) {
            r.logo_url = null;
            broken++;
          }
        } catch {
          r.logo_url = null;
          broken++;
        }
      })
    );
  }
  console.log(`  logos: ${records.length - broken} ok, ${broken} nulled`);
}

async function main() {
  console.log(`Scraping ${ids.length} developers...`);
  const results = [];
  const failed = [];
  let done = 0;

  async function worker(queue) {
    for (const id of queue) {
      // fetch EN + AR in parallel
      const [d_en, d_ar] = await Promise.all([
        getJson(`${API}/v1/developers/${id}`, 6, "en"),
        getJson(`${API}/v1/developers/${id}`, 6, "ar"),
      ]);
      done++;
      if (done % 50 === 0) console.log(`  ${done}/${ids.length}`);
      if (d_en === undefined) {
        failed.push(id);
        continue;
      }
      if (d_en === null) continue;
      results.push(toRecord(d_en, d_ar));
      await sleep(40);
    }
  }

  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  ids.forEach((id, i) => chunks[i % CONCURRENCY].push(id));
  await Promise.all(chunks.map(worker));

  if (failed.length) {
    console.log(`Retrying ${failed.length} failed...`);
    for (const id of failed) {
      const [d_en, d_ar] = await Promise.all([
        getJson(`${API}/v1/developers/${id}`, 8, "en"),
        getJson(`${API}/v1/developers/${id}`, 8, "ar"),
      ]);
      if (d_en) results.push(toRecord(d_en, d_ar));
      await sleep(200);
    }
  }

  console.log("Validating logo URLs...");
  await validateLogos(results);

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
