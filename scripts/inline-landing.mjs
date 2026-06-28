// Make the standalone landing pages fully self-contained: inline the listings
// data and embed the hero image as a data URI, so each .html renders on its own
// (preview panels, file:// double-click, any host) with no sibling files.
// Run after gen-landing-listings.mjs. Run: node scripts/inline-landing.mjs

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "landing-pages");

const pages = [
  { html: "new-capital.html", js: "listings-new-capital.js", png: "new-capital.png", hero: "new-capital.webp" },
  { html: "new-cairo.html", js: "listings-new-cairo.js", png: "new-cairo.png", hero: "new-cairo.webp" },
];

for (const p of pages) {
  const htmlPath = path.join(DIR, p.html);
  let html = fs.readFileSync(htmlPath, "utf8");

  // 1) Inline listings JS (replace external <script src> or a prior inline block)
  const jsContent = fs.readFileSync(path.join(DIR, p.js), "utf8");
  const inlineBlock = `<script id="listings-data">\n${jsContent}\n</script>`;
  const extRef = new RegExp(`<script src="${p.js.replace(/[.]/g, "\\.")}"></script>`);
  if (extRef.test(html)) {
    html = html.replace(extRef, inlineBlock);
  } else {
    html = html.replace(
      /<script id="listings-data">[\s\S]*?<\/script>/,
      inlineBlock
    );
  }

  // 2) Keep the hero as an EXTERNAL optimized WebP (small page; works on file://
  //    and when hosted). Normalize any png ref or prior inlined data URI to it.
  const heroRef = `url("${p.hero}")`;
  html = html
    .replace(new RegExp(`url\\("${p.png}"\\)`.replace(/[.]/g, "\\.")), heroRef)
    .replace(/url\("data:image\/(?:png|webp);base64,[^"]*"\)/, heroRef);

  fs.writeFileSync(htmlPath, html);
  console.log(`✓ ${p.html} — inlined listings + hero (${(html.length / 1024).toFixed(0)} KB)`);
}
console.log("Done.");
