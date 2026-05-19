// Loads scraped JSON (scraper/data/*.json) into Supabase.
//
// Prereq: run supabase/schema.sql in the Supabase SQL editor first.
// Env (set before running):
//   SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=<service role key — Project Settings > API>
//
// Run: node scraper/load-supabase.mjs

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.SUPABASE_URL;
const KEY =
  process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_KEY env vars.");
  process.exit(1);
}
const db = createClient(URL, KEY, { auth: { persistSession: false } });

const DATA = path.join(process.cwd(), "scraper", "data");
const read = (n) =>
  JSON.parse(fs.readFileSync(path.join(DATA, `${n}.json`), "utf8"));

// Clean, URL-safe slug — must match src/lib/data.ts slugify().
const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Drop duplicate nawy_id rows — Postgres upsert rejects dupes in one batch.
function dedupe(rows) {
  const m = new Map();
  for (const r of rows) m.set(r.nawy_id, r);
  return [...m.values()];
}

async function upsertAll(table, rows) {
  rows = dedupe(rows);
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await db.from(table).upsert(slice, {
      onConflict: "nawy_id",
    });
    if (error) {
      console.error(`  ${table} chunk ${i}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`  ${table}: ${rows.length} rows`);
}

async function main() {
  const areas = read("areas").map((a) => ({ ...a, slug: slugify(a.slug) }));
  const developers = read("developers").map((d) => ({
    ...d,
    slug: slugify(d.slug),
  }));
  const compounds = read("compounds").map((c) => ({
    ...c,
    slug: slugify(c.slug),
  }));
  const units = read("units")
    .filter((u) => u.sale_type === "developer_sale")
    .map((u) => ({ ...u, slug: slugify(u.slug) }));

  console.log("Loading into Supabase...");
  await upsertAll("areas", areas);
  await upsertAll("developers", developers);
  await upsertAll("compounds", compounds);
  await upsertAll("units", units);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
