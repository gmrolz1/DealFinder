// Re-theme both landing pages to the Deal Finder brand palette
// (white/black/grey, taupe micro-accents) and remove all WhatsApp green —
// CTAs become black/white per brand CTA discipline.
// Run: node scripts/retheme-landing.mjs

import fs from "node:fs";

const BRAND = `[data-theme="brand"]{
    --bg:#ffffff; --fg:#000000; --muted:#474747; --line:#d9d9d9;
    --card-bg:#ffffff; --card-fg:#000000; --accent:#000000; --accent-fg:#ffffff;
    --taupe:#6f5e57; --display:900; --tt:uppercase; --radius:0px; --shadow:none;
    --hero-ov:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.82));
    --font:"Segoe UI",Tahoma,system-ui,Arial,sans-serif;
  }`;

for (const f of ["landing-pages/new-capital.html", "landing-pages/new-cairo.html"]) {
  let h = fs.readFileSync(f, "utf8");
  // 1) active theme -> brand
  h = h.replace('data-theme="luxury">', 'data-theme="brand">');
  // 2) remove WhatsApp green -> black button / white text
  h = h.replace(/:root\{ --wa:#25d366; --wa-fg:#062b16; \}/, ":root{ --wa:#000000; --wa-fg:#ffffff; }");
  // 3) hero highlight -> white marker box, black text (on-brand, readable on photo)
  h = h.replace(/h1 \.hl\{color:var\(--accent\)\}/, "h1 .hl{background:#fff;color:#000;padding:0 .12em}");
  // 4) sticky Call -> white (Call) vs black (WhatsApp) for clear distinction
  h = h.replace(/\.sticky \.s-call\{background:#0e0e0e;color:#fff\}/, ".sticky .s-call{background:#fff;color:#000;border-inline-start:1px solid #d9d9d9}");
  // 5) active theme block -> Deal Finder brand palette
  if (h.includes('[data-theme="brand"]{')) {
    h = h.replace(/\[data-theme="brand"\]\{[^}]*\}/, BRAND);
  } else {
    h = h.replace(/\[data-theme="luxury"\]\{[^}]*\}/, BRAND);
  }
  fs.writeFileSync(f, h);
  console.log("✓ rethemed", f);
}
console.log("Done.");
