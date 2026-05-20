# src/components/

Shared UI components. Imported with `@/components/...` from pages and other components.

| File | What it renders |
|---|---|
| `site-header.tsx` | Top app bar with logo, nav, language switcher (EN ↔ AR). |
| `site-footer.tsx` | Footer with links, Facebook, brand. |
| `mobile-tabbar.tsx` | Bottom tab bar on mobile. **Client component** — uses scroll state. |
| `property-card.tsx` | Unit card — image, price, beds, area, payment plan. Used in `/properties` and on developer/compound/area pages. |
| `compound-card.tsx` | Compound card — image, name, developer, min price. |
| `developers-index.tsx` | The `/developers` listing component (separated for reuse). |
| `developer-detail.tsx` | The `/developers/[slug]` page body — about, FAQs, projects, available homes. |
| `brand-icon.tsx` | The DealFinder mark. |
| `wordmark.tsx` | The DealFinder wordmark. |

## Conventions

- **One component per file.** File name is `kebab-case`, exported name is `PascalCase`.
- **Server component by default.** Add `"use client"` only when needed (state, effects, browser APIs, event handlers). Add a one-line comment explaining why.
- **Accept `locale: Locale` as a prop** when the component renders text. Use `t(key, locale)` from `@/lib/i18n` — never hard-code English.
- **Bilingual content fields** — accept both `name` and `nameAr` (or equivalent), pick based on `locale`.
- **No fetching in components.** Fetch in the page server component, pass props in.
- **Style with Tailwind + brand tokens** (`bg-paper`, `text-ink`, `border-slate`). Don't sprinkle raw hex.

## Adding a new component

1. Decide: shared (here) or page-local (inline in the route's `page.tsx`)? If used by 2+ pages or non-trivial, put it here.
2. File: `kebab-case.tsx`. Export: `PascalCase`.
3. If interactive, mark `"use client"` and explain why in a one-line comment.
4. If it renders user-facing text, accept `locale` and route through `@/lib/i18n`.
