# src/app/

Next.js App Router routes. Server components by default. Every EN route has an AR mirror under `ar/`.

```
app/
├── page.tsx              EN homepage (/)
├── layout.tsx            Root layout — locale detection, header/footer/mobile-tabbar
├── globals.css           Tailwind 4 + brand tokens (ink/paper/slate/data/taupe)
├── icon.png              Favicon
├── robots.ts             /robots.txt
├── sitemap.ts            /sitemap.xml (EN + AR URLs)
│
├── areas/
│   ├── page.tsx          /areas
│   └── [slug]/page.tsx   /areas/<slug>
├── compounds/
│   └── [slug]/page.tsx   /compounds/<slug>
├── developers/
│   ├── page.tsx          /developers
│   └── [slug]/page.tsx   /developers/<slug>
├── properties/
│   ├── page.tsx          /properties (filters: type, area, beds, price)
│   └── [slug]/page.tsx   /properties/<slug>
├── new-launches/page.tsx /new-launches
│
└── ar/                   Arabic mirror — same shape, dir="rtl"
    ├── page.tsx          /ar
    ├── areas/...
    ├── compounds/[slug]/...
    ├── developers/...
    ├── properties/...
    └── new-launches/...
```

## Conventions

- **Routes use slugs in URLs**, not ids. Dynamic segments are `[slug]`. The slug column on each table is unique.
- **Server components by default.** Add `"use client"` only when you need state, effects, or browser APIs. Note the reason in a one-line comment.
- **Data fetching happens in the page (server) component** — call functions from `@/lib/data.ts` directly. Don't fetch in the browser.
- **EN + AR mirror.** Adding a page? Add both `app/<route>/page.tsx` and `app/ar/<route>/page.tsx`. Reuse the same components; pass `locale="en"` vs `locale="ar"`.
- **i18n strings live in `@/lib/i18n.ts`.** Use `t(key, locale)` — never hard-code English in components.

## Locale detection

`middleware.ts` (root) sets the `x-pathname` request header. `layout.tsx` reads it via `headers()` and calls `localeFromPath()` from `@/lib/i18n` to set `<html lang dir>`.

## Adding a new page

1. Create `app/<route>/page.tsx`. Server component, async if it fetches data.
2. Create `app/ar/<route>/page.tsx` with the same shape, passing `locale="ar"`.
3. If it lists items by slug, also add `app/<route>/[slug]/page.tsx` and its AR mirror.
4. Add any new UI strings to `@/lib/i18n.ts`.
5. If the new route should appear in the sitemap, update `app/sitemap.ts`.
6. Smoke test: `curl -I http://localhost:3000/<route>` should return 200.
