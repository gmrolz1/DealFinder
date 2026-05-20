# public/

Static assets served at the URL root. Next.js does not process files here — they're returned as-is.

```
public/
├── logo.png             Source brand mark (full colour, on transparent)
├── logo-mark.png        Processed mark — used in the header
├── logo-mark-white.png  White variant for dark backgrounds
├── logo-on-black.jpg    Logo on black background (social, OG image fallback)
├── file.svg             Next.js scaffold icons — unused, consider removing
├── globe.svg            ↑
├── next.svg             ↑
├── vercel.svg           ↑
└── window.svg           ↑
```

## Conventions

- **File names:** `kebab-case`. No spaces, no uppercase, no special chars.
- **Reference from JSX:** `<img src="/logo-mark.png" />` (the leading `/` is the URL root).
- **Don't put data here.** Scraped JSON belongs in `scraper/data/`, not `public/`.
- **Don't put fonts here.** Self-hosted fonts belong in `src/fonts/` and load via `next/font/local`.
- **Don't put environment-specific config here.** It's served to everyone.

## Processing the logo

The logo source is `public/logo.png` (white mark on transparent). To regenerate the cropped black/white marks and favicon:

```bash
node scripts/process-logo.mjs
```

See `scripts/README.md`.

## Brand assets

PDFs, fonts, social-media banners, and other brand source files live in `brand/`, not here. Only files we actually serve over HTTP belong in `public/`.
