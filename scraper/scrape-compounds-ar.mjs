// Scrapes Arabic compound names + subtitles via nawy's compound search API
// (paged with Accept-Language: ar). Output: scraper/data/compounds-ar.json
// — a map nawy_id → { name_ar, subtitle_ar }.
//
// Run: node scraper/scrape-compounds-ar.mjs

import fs from "node:fs";
import path from "node:path";

const API = "https://listing-api.nawy.com";
const PAGE_SIZE = 50;
const CONCURRENCY = 4;
const DATA = path.join(process.cwd(), "scraper", "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "application/json",
          "accept-language": "ar",
        },
      });
      if (res.ok) return await res.json();
      await sleep((res.status === 429 ? 2000 : 600) * (i + 1));
    } catch {
      await sleep(600 * (i + 1));
    }
  }
  return null;
}

async function main() {
  const first = await getJson(
    `${API}/v1/search/compounds?page=1&pageSize=${PAGE_SIZE}`
  );
  if (!first) throw new Error("first page failed");
  const total = first.total ?? first.results.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  console.log(`Scraping ${total} compounds across ${pages} pages...`);

  const records = first.results.map((r) => ({
    nawy_id: r.id,
    name_ar: r.name,
    subtitle_ar: r.subtitle ?? null,
    area_name_ar: r.areaName ?? null,
    developer_name_ar: r.developerName ?? null,
  }));

  const pageNums = [];
  for (let p = 2; p <= pages; p++) pageNums.push(p);

  async function worker(queue) {
    for (const p of queue) {
      const d = await getJson(
        `${API}/v1/search/compounds?page=${p}&pageSize=${PAGE_SIZE}`
      );
      if (d?.results) {
        for (const r of d.results) {
          records.push({
            nawy_id: r.id,
            name_ar: r.name,
            subtitle_ar: r.subtitle ?? null,
            area_name_ar: r.areaName ?? null,
            developer_name_ar: r.developerName ?? null,
          });
        }
      }
      await sleep(80);
    }
  }
  const chunks = Array.from({ length: CONCURRENCY }, () => []);
  pageNums.forEach((p, i) => chunks[i % CONCURRENCY].push(p));
  await Promise.all(chunks.map(worker));

  // dedupe + sort
  const m = new Map();
  for (const r of records) m.set(r.nawy_id, r);
  const out = [...m.values()].sort((a, b) => a.nawy_id - b.nawy_id);
  fs.writeFileSync(
    path.join(DATA, "compounds-ar.json"),
    JSON.stringify(out, null, 1)
  );
  console.log(`Done. ${out.length} compounds → compounds-ar.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
