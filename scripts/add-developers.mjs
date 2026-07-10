// Adds researched (non-Nawy) developers to scraper/data/developers.json.
//
// Input: a JSON file of research records (see research-missing-developers
// workflow output). Each record with found=true and confidence!=low becomes
// a catalog developer with a SYNTHETIC id (9,000,000+) so it can never
// collide with a real Nawy id (max ~589).
//
//   node scripts/add-developers.mjs <records.json>
//
// Idempotent: re-running updates existing synthetic entries by slug instead
// of duplicating. Arabic name/areas/about are filled if the record has them,
// else generated from the English facts.

import fs from "node:fs";
import path from "node:path";

const SYNTH_BASE = 9_000_000;
const DEV_FILE = path.join(process.cwd(), "scraper", "data", "developers.json");

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Minimal EN→AR area dictionary (covers the common Egyptian areas).
const AREA_AR = {
  "new capital": "العاصمة الإدارية الجديدة",
  "new administrative capital": "العاصمة الإدارية الجديدة",
  "new cairo": "القاهرة الجديدة",
  "fifth settlement": "التجمع الخامس",
  "mostakbal city": "مدينة المستقبل",
  "future city": "مدينة المستقبل",
  "sheikh zayed": "الشيخ زايد",
  "new zayed": "زايد الجديدة",
  "6th of october": "السادس من أكتوبر",
  "october": "أكتوبر",
  "north coast": "الساحل الشمالي",
  "ras el hekma": "رأس الحكمة",
  "ain sokhna": "العين السخنة",
  "sokhna": "السخنة",
  "new heliopolis": "هليوبوليس الجديدة",
  "shorouk": "الشروق",
  "el shorouk": "الشروق",
  "madinaty": "مدينتي",
  "capital gardens": "كابيتال جاردنز",
  "mokattam": "المقطم",
  "obour": "العبور",
  "new mansoura": "المنصورة الجديدة",
  "new damietta": "دمياط الجديدة",
  "new alamein": "العلمين الجديدة",
  "alamein": "العلمين",
  "east cairo": "شرق القاهرة",
  "nasr city": "مدينة نصر",
  "red sea": "البحر الأحمر",
};

// Strip a trailing "(…)" parenthetical so the display name + slug stay clean;
// the full legal name / detail lives in the about text.
function cleanName(raw) {
  return (raw || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
}

const arArea = (en) => AREA_AR[(en || "").toLowerCase().trim()] || en;

function main() {
  const src = process.argv[2];
  if (!src) {
    console.error("usage: node scripts/add-developers.mjs <records.json>");
    process.exit(1);
  }
  const parsed = JSON.parse(fs.readFileSync(src, "utf8"));
  const records = Array.isArray(parsed) ? parsed : parsed.records ?? [];
  const devs = JSON.parse(fs.readFileSync(DEV_FILE, "utf8"));

  // Next free synthetic id.
  let nextId =
    Math.max(
      SYNTH_BASE,
      ...devs.filter((d) => d.nawy_id >= SYNTH_BASE).map((d) => d.nawy_id)
    ) + 1;

  const bySlug = new Map(devs.map((d) => [d.slug, d]));
  let added = 0,
    updated = 0,
    skipped = 0;

  for (const r of records) {
    if (!r.found || r.confidence === "low") {
      skipped++;
      console.log(`  skip: ${r.input_name} (found=${r.found}, conf=${r.confidence})`);
      continue;
    }
    const name = cleanName(r.official_name) || r.input_name;
    const nameAr = cleanName(r.official_name_ar) || name;
    const areas = (r.areas ?? []).filter(Boolean).slice(0, 6);
    const areasAr = areas.map(arArea);
    const year = Number.isInteger(r.established_year) && r.established_year > 1900
      ? r.established_year
      : null;

    const est = year ? `, established ${year}` : "";
    const areaTxt = areas.length ? ` across ${areas.join(", ")}` : "";
    const projTxt =
      r.notable_projects?.length
        ? ` Notable projects include ${r.notable_projects.slice(0, 4).join(", ")}.`
        : "";
    const about =
      r.about_en?.trim() ||
      `${name} is an Egyptian real estate developer${est}, active${areaTxt}.${projTxt}`;

    const estAr = year ? `، تأسست عام ${year}` : "";
    const areaTxtAr = areasAr.length ? ` في ${areasAr.join("، ")}` : "";
    const aboutAr = `${nameAr} شركة تطوير عقاري مصرية${estAr}، تعمل${areaTxtAr}.`;

    const slug = `${slugify(name)}`;
    const existing = bySlug.get(slug) ?? bySlug.get(`syn-${slug}`);

    const record = {
      nawy_id: existing?.nawy_id ?? nextId,
      name,
      name_ar: nameAr,
      slug,
      logo_url: null,
      min_price: null,
      compounds_count: null,
      properties_count: null,
      established_year: year,
      areas,
      areas_ar: areasAr,
      about,
      about_ar: aboutAr,
      faqs: [],
      faqs_ar: [],
      meta_title: `${name} — Projects & Prices in Egypt | DealFinder`,
      meta_title_ar: `${nameAr} — المشاريع والأسعار في مصر | DealFinder`,
      meta_description: about.slice(0, 155),
      meta_description_ar: aboutAr.slice(0, 155),
      _source: "researched",
    };

    if (existing) {
      Object.assign(existing, record);
      updated++;
      console.log(`  update: ${name} (#${existing.nawy_id})`);
    } else {
      devs.push(record);
      bySlug.set(slug, record);
      nextId++;
      added++;
      console.log(`  add: ${name} (#${record.nawy_id})${year ? ` est.${year}` : ""}`);
    }
  }

  fs.writeFileSync(DEV_FILE, JSON.stringify(devs, null, 1), "utf8");
  console.log(
    `\ndone — added ${added}, updated ${updated}, skipped ${skipped}. developers.json now has ${devs.length} entries.`
  );
}

main();
