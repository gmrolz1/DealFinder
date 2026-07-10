// One-off: generate area hero images with Nano Banana (Gemini 2.5 Flash Image).
// Reads GEMINI_API_KEY from .env.local. Writes PNGs to public/areas/<slug>.png.
// Run: node scripts/gen-area-images.mjs

import fs from "node:fs";
import path from "node:path";

// --- load GEMINI_API_KEY from .env.local ---------------------------------
const envText = fs.readFileSync(
  path.join(process.cwd(), ".env.local"),
  "utf8"
);
const KEY = (envText.match(/^GEMINI_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) throw new Error("GEMINI_API_KEY not found in .env.local");

const MODEL = "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

const OUT = path.join(process.cwd(), "public", "areas");
fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  "Cinematic photorealistic aerial drone photograph, golden-hour light, " +
  "ultra-detailed, high-end real-estate marketing aesthetic, crisp, no text, " +
  "no watermarks, no logos, no people in focus, vertical 3:4 composition.";

// Prompts written from facts about each Egyptian area — not copied from any source.
const AREAS = [
  ["new-capital-city", "Egypt's New Administrative Capital: a futuristic planned city with a soaring iconic skyscraper, wide green boulevards, modern glass office towers and gardens, vast organized urban grid in the desert."],
  ["new-cairo", "New Cairo, Egypt: upscale gated communities of modern villas and low-rise apartments, palm-lined avenues, manicured landscaping, clubhouses and pools, affluent suburban sprawl."],
  ["al-alamein", "Al Alamein on Egypt's North Coast: gleaming white Mediterranean beachfront high-rise towers beside turquoise sea, marina, sandy beach, luxury coastal resort city."],
  ["mostakbal-city", "Mostakbal City, Egypt: a brand-new sustainable planned suburb, modern residential compounds with green parks, solar-friendly layouts, wide clean roads in the desert outskirts of Cairo."],
  ["6th-of-october-city", "6th of October City, Egypt: an established satellite city west of Cairo with residential compounds, villas, university campuses, green medians and broad avenues."],
  ["ras-el-hekma", "Ras El Hekma, Egypt: pristine Mediterranean coastline with brilliant turquoise lagoon water, white sand beach, low luxury coastal resort villas and a new waterfront development."],
  ["new-zayed", "New Zayed (Sheikh Zayed extension), Egypt: modern upscale villa communities with greenery, contemporary architecture, landscaped streets in the western desert suburbs of Cairo."],
  ["new-heliopolis", "New Heliopolis, Egypt: a modern residential district on Cairo's eastern edge with contemporary apartment compounds, green spaces and organized streets meeting the desert."],
  ["october-gardens", "October Gardens, Egypt: a growing modern residential area near 6th of October with mid-rise apartment compounds, fresh greenery and orderly new housing blocks."],
  ["6th-settlement", "Sixth Settlement in New Cairo, Egypt: premium residential compounds of modern villas and apartments, landscaped gardens, wide avenues, upscale suburban community."],
];

async function gen(slug, scene) {
  const body = {
    contents: [{ parts: [{ text: `${scene} ${STYLE}` }] }],
    generationConfig: { imageConfig: { aspectRatio: "3:4" } },
  };
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${slug}: HTTP ${res.status} — ${t.slice(0, 400)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) {
    throw new Error(`${slug}: no image in response — ${JSON.stringify(json).slice(0, 400)}`);
  }
  const buf = Buffer.from(img.inlineData.data, "base64");
  const file = path.join(OUT, `${slug}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓ ${slug}.png (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const [slug, scene] of AREAS) {
  try {
    await gen(slug, scene);
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}
console.log("Done.");
