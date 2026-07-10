// One-off: downscale the generated area PNGs to a web-friendly size.
// Pure Node using pngjs (already a dependency). Bilinear sampling.
// Run: node scripts/resize-area-images.mjs

import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const DIR = path.join(process.cwd(), "public", "areas");
const TARGET_W = 480; // 2x the 160px card width

function resize(src, tw) {
  const th = Math.round((src.height / src.width) * tw);
  const out = new PNG({ width: tw, height: th });
  for (let y = 0; y < th; y++) {
    const sy = (y / th) * src.height;
    const y0 = Math.floor(sy);
    const y1 = Math.min(y0 + 1, src.height - 1);
    const wy = sy - y0;
    for (let x = 0; x < tw; x++) {
      const sx = (x / tw) * src.width;
      const x0 = Math.floor(sx);
      const x1 = Math.min(x0 + 1, src.width - 1);
      const wx = sx - x0;
      const o = (y * tw + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src.data[(y0 * src.width + x0) * 4 + c];
        const p10 = src.data[(y0 * src.width + x1) * 4 + c];
        const p01 = src.data[(y1 * src.width + x0) * 4 + c];
        const p11 = src.data[(y1 * src.width + x1) * 4 + c];
        const top = p00 * (1 - wx) + p10 * wx;
        const bot = p01 * (1 - wx) + p11 * wx;
        out.data[o + c] = Math.round(top * (1 - wy) + bot * wy);
      }
    }
  }
  return out;
}

for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const p = path.join(DIR, f);
  const before = fs.statSync(p).size;
  const src = PNG.sync.read(fs.readFileSync(p));
  const out = resize(src, TARGET_W);
  const buf = PNG.sync.write(out, { deflateLevel: 9 });
  fs.writeFileSync(p, buf);
  console.log(
    `✓ ${f}  ${out.width}x${out.height}  ${(before / 1024).toFixed(0)}KB → ${(buf.length / 1024).toFixed(0)}KB`
  );
}
console.log("Done.");
