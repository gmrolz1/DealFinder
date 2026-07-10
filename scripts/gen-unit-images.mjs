// Generate photorealistic 4:3 card images for campaign-landing units using
// Gemini 2.5 Flash Image ("Nano Banana"). Reads GEMINI_API_KEY from
// .env.local (same pattern as gen-area-images.mjs). Writes WebP files to
// public/lp/units/<nawy_id>.webp and prints the UNIT_IMAGE_OVERRIDES lines
// to paste into src/lib/data.ts.
//
//   node scripts/gen-unit-images.mjs
//
// Style rules (match the real developer renders on the landing pages):
// photoreal exterior, golden-hour or clear daylight, no text/logos/watermarks,
// no people in the foreground. Every Gemini image carries an invisible
// SynthID watermark.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// --- load GEMINI_API_KEY from .env.local -----------------------------------
const envText = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
const KEY = (envText.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;
const OUT = path.join(process.cwd(), "public", "lp", "units");

// Units to generate + a scene description grounded in the unit's real facts.
// Add/remove entries as the landing pages change.
const JOBS = [
  {
    id: 266073,
    scene:
      "modern 8-storey residential apartment building in Egypt's New Administrative Capital, white and warm-beige facade with glass balconies, landscaped courtyard with palm trees",
  },
  {
    id: 285363,
    scene:
      "modern two-storey commercial strip mall in Egypt's New Administrative Capital, glass storefronts and stone cladding, wide sidewalk with young trees, clear midday light",
  },
];

const STYLE =
  "Photorealistic real-estate marketing photograph, 35mm full-frame look, sharp detail, clear sky, no people in the foreground, no text, no logos, no watermark, 4:3 aspect ratio.";

async function generate(job) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${job.scene}. ${STYLE}` }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) throw new Error(`${job.id}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`${job.id}: no image in response`);
  const buf = Buffer.from(part.inlineData.data, "base64");
  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${job.id}.webp`);
  await sharp(buf).resize(1200, 900, { fit: "cover" }).webp({ quality: 82 }).toFile(file);
  console.log(`✓ ${file}`);
  console.log(`  ${job.id}: "/lp/units/${job.id}.webp",  // paste into UNIT_IMAGE_OVERRIDES`);
}

for (const job of JOBS) {
  try {
    await generate(job);
  } catch (e) {
    console.error(`✗ ${String(e).slice(0, 200)}`);
  }
}
