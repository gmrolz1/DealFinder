# Google Ads landing pages (standalone)

Self-contained landing pages for paid traffic. **Not part of the Next.js site** —
each is a single HTML file plus one hero image. Built mobile-first for the lowest
possible CPL: one goal (get the lead), WhatsApp + tap-to-call as the primary
action, and a 2-tap form that opens WhatsApp prefilled (no backend required).

Design: **Luxury** (dark theme, gold accents, serif headings).

Each page is **~32 KB** of HTML + one **~90 KB WebP** hero. The listings are
**inlined** into the HTML (so the page works even when opened as a local file),
and the hero is an external WebP (keeps the page lean and fast on mobile).

## Files

To ship a page you need **two files**: the HTML and its `.webp` hero.

| Ship these | Ad group |
|---|---|
| `new-capital.html` + `new-capital.webp` | New Administrative Capital |
| `new-cairo.html` + `new-cairo.webp` | New Cairo |

`index.html` is a simple chooser linking both. The `*.png` and `listings-*.js`
files are **build sources only** — not needed at runtime.

## Real listings

Each page shows 9 real top deals (price, payment plan, beds/baths/m², photos)
pulled from the DealFinder dataset, scored the same way the live site scores its
"Best Deals". Listing photos hotlink the same developer CDN URLs the live site
already uses.

To rebuild after the dataset changes:

```
node scripts/gen-landing-listings.mjs   # refresh listings-*.js from the dataset
node scripts/inline-landing.mjs         # inline listings + point hero at the .webp
```

To regenerate the hero images (needs sharp): re-run the area-image generator,
then `node scripts/inline-landing.mjs`.

## Language

- Default is **Arabic (RTL)** — best converting for the Egyptian market.
- Append `?lang=en` to serve **English (LTR)** for English ad groups
  (e.g. `new-cairo.html?lang=en`). There's also a manual toggle in the header.
- Point each ad group at the matching URL + `?lang=` for tight message match
  (message match = higher Quality Score = lower CPC = lower CPL).

## Conversion tracking — configured

These pages fire the **WhatsApp / Call Lead** conversion for the
**"the deal makers"** account (386-792-3119):

- Conversion ID: `AW-18195355585`
- `send_to` label: `AW-18195355585/NMfzCPzfrMUcEMGvnORD`

A conversion fires on every WhatsApp tap, every call tap, and every form submit.
This is the same conversion action fired by the React app
(`src/components/analytics/conversion-tracking.tsx`), so counts stay consistent
across the static landing pages and the main site.

## Contact number

The advisor number is `+201207171710` (matches the in-site campaign config).
To change it, edit `PHONE` / `WA` near the bottom `<script>` of each file.

## Hosting

These are static files — host anywhere:
- Drop the `landing-pages/` folder on any static host (Vercel, Netlify, Cloudflare
  Pages, GitHub Pages, or your own server).
- Or test locally by opening the `.html` directly in a browser.

> Important: a Google Ad must point at a **hosted URL** — you can't run an ad on a
> local file. Host the folder, then point each ad group at
> `…/new-capital.html` or `…/new-cairo.html` (add `?lang=en` for English groups).
