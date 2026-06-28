// Minimal static file server for previewing the landing pages.
// Usage: node scripts/static-server.mjs [dir] [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.argv[2] || "landing-pages");
const PORT = Number(process.argv[3] || 5050);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = path.join(DIR, p);
    if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("Not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`Serving ${DIR} on http://localhost:${PORT}`));
