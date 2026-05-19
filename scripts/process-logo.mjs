// Processes the supplied logo (public/logo.png — white mark on transparent)
// into tight-cropped black/white marks + a favicon.
//
// Run: node scripts/process-logo.mjs

import { PNG } from "pngjs";
import fs from "node:fs";

const src = PNG.sync.read(fs.readFileSync("public/logo.png"));
const { width: W, height: H, data } = src;

// 1. bounding box of visible pixels
let minX = W,
  minY = H,
  maxX = -1,
  maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * 4 + 3] > 16) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;

// 2. tight-cropped, recoloured marks
function cropped(rgb) {
  const out = new PNG({ width: cw, height: ch });
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((y + minY) * W + (x + minX)) * 4;
      const di = (y * cw + x) * 4;
      out.data[di] = out.data[di + 1] = out.data[di + 2] = rgb;
      out.data[di + 3] = data[si + 3];
    }
  }
  return out;
}
fs.writeFileSync("public/logo-mark.png", PNG.sync.write(cropped(0)));
fs.writeFileSync("public/logo-mark-white.png", PNG.sync.write(cropped(255)));

// 3. favicon — 512 black square, white mark centred at ~62% width
const S = 512;
const sw = Math.round(S * 0.62);
const scale = sw / cw;
const sh = Math.round(ch * scale);
const fav = new PNG({ width: S, height: S });
for (let i = 0; i < S * S; i++) {
  fav.data[i * 4] = fav.data[i * 4 + 1] = fav.data[i * 4 + 2] = 0;
  fav.data[i * 4 + 3] = 255;
}
const offX = Math.round((S - sw) / 2);
const offY = Math.round((S - sh) / 2);
for (let y = 0; y < sh; y++) {
  for (let x = 0; x < sw; x++) {
    const srcX = minX + Math.min(cw - 1, Math.floor(x / scale));
    const srcY = minY + Math.min(ch - 1, Math.floor(y / scale));
    const a = data[(srcY * W + srcX) * 4 + 3];
    if (a > 16) {
      const di = ((offY + y) * S + (offX + x)) * 4;
      const v = Math.round(255 * (a / 255));
      fav.data[di] = fav.data[di + 1] = fav.data[di + 2] = v;
      fav.data[di + 3] = 255;
    }
  }
}
fs.writeFileSync("src/app/icon.png", PNG.sync.write(fav));

console.log(`source ${W}x${H} -> mark cropped to ${cw}x${ch}; favicon ${S}x${S}`);
