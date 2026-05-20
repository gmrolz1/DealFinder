# Conventions

How we name files, structure code, and write commits. Read this before adding code so the project stays consistent.

---

## File and folder naming

| Kind | Convention | Example |
|---|---|---|
| React component files | `kebab-case.tsx` | `property-card.tsx`, `mobile-tabbar.tsx` |
| Component exports | `PascalCase` | `export function PropertyCard(...)` |
| Library / utility files | `kebab-case.ts` | `data.ts`, `i18n.ts`, `supabase.ts` |
| Hooks (when we add them) | `use-*.ts` | `use-locale.ts` |
| Node scripts (data + tooling) | `kebab-case.mjs` (ESM) | `scrape.mjs`, `process-logo.mjs` |
| Route folders | lowercase, plural where it lists many | `areas/`, `developers/`, `compounds/` |
| Dynamic segments | `[slug]` (we use slugs, not ids, in URLs) | `developers/[slug]` |
| Locale routes | mirror EN under `ar/` | `ar/areas/[slug]` |
| Markdown docs | `UPPERCASE.md` for top-level, `kebab-case.md` for sub-docs | `README.md`, `data-model.md` |
| Asset files | `kebab-case.{png,svg,jpg}` | `logo-mark.png` |

**No spaces in file or folder names.** They break tooling on certain build systems and are awkward to type.

---

## Where new code goes

| You're adding... | Put it in... |
|---|---|
| A new page or route | `src/app/<route>/page.tsx` (and `src/app/ar/<route>/page.tsx` for AR) |
| A reusable UI component | `src/components/<name>.tsx` |
| A utility function (data, formatting, helpers) | `src/lib/<name>.ts` |
| A new UI string | `src/lib/i18n.ts` — add to the `S` object with both `en` and `ar` |
| A data scraping or loading script | `scraper/<name>.mjs` |
| A one-off build / asset helper | `scripts/<name>.mjs` |
| A static asset (logo, svg, image) | `public/<name>.{ext}` |
| Database schema change | `supabase/schema.sql` (and document the change in `docs/LOG.md`) |
| Brand asset (PDF, font, social) | `brand/<category>/<name>` |

If you add a new top-level folder, also add a `README.md` describing what it's for.

---

## Code style

- **TypeScript everywhere.** Avoid `any`. Prefer explicit return types on exported functions.
- **No barrel files** (`index.ts` re-exports) unless there's a strong reason. Import paths should point at the actual source file.
- **Server components by default.** Only add `"use client"` when the component needs browser APIs, state, or event handlers. Note this on the file with a one-line comment if it's not obvious why.
- **Server-side data fetching** — call `src/lib/data.ts` functions directly from server components. Don't fetch in the browser unless absolutely required.
- **Defer to ESLint.** Run `npm run lint` before committing.
- **Comments:** only write a comment when the *why* is non-obvious — a hidden constraint, a workaround, surprising behaviour. Don't explain *what* the code does.

---

## i18n discipline

Every user-facing string must support EN and AR.

- Add the string to `src/lib/i18n.ts` under a namespaced key (`nav.developers`, `lead.exclusive`, etc.).
- Read it with `t("key", locale)` or `tpl("key", locale, { name: ... })`.
- Number formatters: use `src/lib/format.ts` — don't sprinkle `toLocaleString` inline.
- Date / direction: use `dir={isRtl(locale) ? "rtl" : "ltr"}` only on container elements; the root layout handles the document-level direction.

---

## Tailwind + brand tokens

- Use the brand colour tokens defined in `src/app/globals.css`: `bg-paper`, `text-ink`, `border-slate`, `bg-data`, etc. Don't sprinkle raw hex.
- Use the Magnetik typeface via the `--font-magnetik` CSS variable (already wired on `<html>`).
- Mobile-first — start with the unprefixed Tailwind class, add `md:` and `lg:` for larger screens.
- Square / monolithic CTAs — see `brand/BRAND MANUL/` PDFs for visual rules.

---

## Git workflow

| | |
|---|---|
| Default branch | `main` |
| Feature branches | `feature/<short-name>`, `fix/<short-name>` |
| Direct commits to main | OK for tiny doc fixes; otherwise PR |
| Vercel | Auto-deploys `main`. Feature branches get preview URLs on PR. |

### Commit messages

Look at `git log --oneline` for examples — the project uses short, present-tense, lowercase-first messages:

```
Fix language switcher to stay on the same page
Arabic phase 2 — full site coverage + bilingual sitemap
Null out broken developer logos (26 developers without a nawy logo)
Add full dataset, developer landing pages, and fix Vercel deploy
```

**Format:**
- First line: under 70 characters, imperative ("Add X", "Fix Y", "Refactor Z").
- Body (optional): explain *why*, not *what* the diff shows.
- One logical change per commit. If you find yourself writing "and", consider splitting.

### Before committing

1. `npm run lint` passes
2. `npm run build` passes if you changed anything in `src/` or config
3. No secrets in the diff (search for `service_role`, `secret`, `password`, raw tokens)
4. Updated `docs/LOG.md` if the change is structural or behavioural

---

## Things to avoid

| Don't | Why |
|---|---|
| Commit `.env.local` | Contains keys |
| Commit files under `scraper/data/_backup-*` or `/.tmp/` | Big, not needed at runtime, in `.gitignore` |
| Copy nawy's marketing descriptions | Duplicate-content penalty — Google will not rank us |
| Mock the database in tests | We don't have tests yet, but when we do — hit a real (test) database |
| Use `git push --force` on `main` | Rewrites shared history |
| Skip pre-commit hooks (`--no-verify`) | Hooks exist for a reason; fix the underlying issue |
| Bypass Next.js APIs based on training-data assumptions | Next 16 has breaking changes — read `node_modules/next/dist/docs/` first |

---

## When in doubt

- Look for an existing example nearby — most patterns are already used somewhere.
- Read `docs/ARCHITECTURE.md` to understand how the piece you're touching fits in.
- Read `AGENTS.md` if you're using an AI assistant.
- Open a discussion in the PR — easier to course-correct early.
