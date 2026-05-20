---
description: Add a new page with the EN + AR mirror, i18n strings, and sitemap entry.
---

# /new-page — add a new page

Add a page to DealFinder the right way. **Do not skip the Arabic mirror or the i18n step** — that's how the team gets bilingual coverage wrong.

## Required from the user

Before you start, get:

1. **Route path** — e.g. `/about`, `/contact`, `/legal/terms`
2. **Page title** (English) and Arabic translation
3. **Page heading** (English) and Arabic translation
4. **Brief description** — what the page is for

If the user can't supply Arabic translations, propose them and confirm before using.

## Steps

1. **Create the EN page** at `src/app/<route>/page.tsx`. Server component by default. Follow the shape of `src/app/areas/page.tsx` for a listing-style page or `src/app/page.tsx` for the homepage style.

2. **Create the AR mirror** at `src/app/ar/<route>/page.tsx`. Same shape, pass `locale="ar"` where the EN version passes `locale="en"`.

3. **Add UI strings** to `src/lib/i18n.ts`. Namespace the keys (`about.title`, `about.heading`, etc.). Both `en` and `ar` values required.

4. **Use the strings** in the page via `t("about.title", locale)`.

5. **Add to navigation** if appropriate — edit `src/components/site-header.tsx` (and `src/components/mobile-tabbar.tsx` if it should appear in mobile nav).

6. **Add to sitemap** — edit `src/app/sitemap.ts` so the page is indexable.

7. **Smoke test both routes:**
   ```bash
   curl -I http://localhost:3000/<route>
   curl -I http://localhost:3000/ar/<route>
   ```
   Both must return HTTP 200. Open in a browser to confirm layout/RTL looks right.

8. **Ship** with `/ship`.

## Anti-patterns to refuse

- Skipping the AR mirror — "we'll add Arabic later" turns into 404s for half the users.
- Hard-coding English in the page file — strings must go through `src/lib/i18n.ts`.
- Adding the page to nav without adding it to the sitemap — invisible to Google.
- Inventing your own page shape — reuse an existing pattern.

## After shipping

Report to the user:
- The new URLs (EN + AR)
- Anything they should know (e.g. "I added it to mobile nav too — let me know if you don't want that")
