# Team Playbook — recipes for common tasks

Step-by-step recipes for everything the team does often. Follow these instead of inventing your own approach — consistency keeps the project sane.

**For AI assistants:** when a teammate asks for one of these tasks, follow the recipe step-by-step. Don't skip steps. If the recipe doesn't fit, ask the teammate before deviating.

---

## 1. Add a new page

Example: "I want a `/about` page."

1. **Create the EN page:** `src/app/about/page.tsx` — server component by default.
2. **Create the AR mirror:** `src/app/ar/about/page.tsx` — same shape, `locale="ar"`.
3. **Add UI strings to `src/lib/i18n.ts`:**
   ```ts
   "about.title": { en: "About DealFinder", ar: "عن ديل فايندر" },
   "about.heading": { en: "...", ar: "..." },
   ```
4. **Use the strings** with `t("about.title", locale)`.
5. **Add to navigation** if it should appear in the header — edit `src/components/site-header.tsx`.
6. **Add to sitemap** if it should be indexed — edit `src/app/sitemap.ts`.
7. **Verify both routes return 200:**
   ```bash
   curl -I http://localhost:3000/about
   curl -I http://localhost:3000/ar/about
   ```
8. Ship with `/ship`.

---

## 2. Update copy on an existing page

1. **Find the string** — search for the current English text in `src/`.
2. **If it's hard-coded** in a component file, move it to `src/lib/i18n.ts` first (one English string, one Arabic). Then read it via `t(key, locale)`.
3. **If it's already in `i18n.ts`**, edit both `en` and `ar` values.
4. **Local check:** open the page in both locales (`/<route>` and `/ar/<route>`) — confirm both show the new copy.
5. Ship with `/ship`.

**Rule:** never change English copy without also updating the Arabic. If the teammate doesn't speak Arabic, propose a translation and confirm before shipping.

---

## 3. Change a brand colour or token

1. **Find the token** in `src/app/globals.css` — `bg-paper`, `text-ink`, `border-slate`, `bg-data`, `text-taupe`.
2. **Change the value.** That's the only place — don't sprinkle raw hex anywhere else.
3. **Visually confirm** by running `npm run dev` and clicking through 5–10 pages — header, footer, property cards, developer pages, both locales.
4. **Update `brand/README.md`** if the change is permanent (record the new value).
5. Ship with `/ship`.

If the change is bigger than a single token (new typeface, full palette swap), **stop and discuss with the team** — that's a brand decision, not a code change.

---

## 4. Refresh data from nawy

Two ways:

### Light refresh (scrape only, app keeps reading from existing JSON)

```bash
node scraper/scrape.mjs            # full scrape (~2 min)
node scraper/scrape.mjs --limit 3  # smoke test first
```

Output overwrites `scraper/data/{areas,developers,compounds,units}.json`. App picks up the new data on next dev/build.

Run `npm run build` to confirm no broken types after the new data lands. Ship with `/ship`.

### Full refresh (scrape + load into Supabase)

Requires the Supabase **service role** key (fetch from Supabase → Project Settings → API Keys → Secret keys → reveal — never commit).

```bash
# 1. Scrape
node scraper/scrape.mjs

# 2. Load (Windows PowerShell)
$env:SUPABASE_URL="https://nmrzefvdixmxmhmxojlv.supabase.co"
$env:SUPABASE_KEY="<paste service role key, then clear the env after>"
node scraper/load-supabase.mjs

# or macOS/Linux
SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co \
SUPABASE_KEY=<service role key> \
node scraper/load-supabase.mjs
```

Verify in the Supabase dashboard (Table Editor) that `units`, `compounds`, `developers`, `areas` updated. Run `/ship` to push any JSON changes.

---

## 5. Fix a broken page / "the site is broken"

Before doing anything, narrow it down:

1. **Where is it broken?** `npm run dev` (local), production (`deal-finder-nu.vercel.app`), or the build (`npm run build`)?
2. **What URL?** Get the exact path.
3. **What's the error?**
   - In dev: check the terminal where `npm run dev` is running.
   - In production: check Vercel → Deployments → latest → Runtime Logs.
   - In build: paste the build error.

Then check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) — most common failures are listed there.

If it's a new failure, fix the root cause (don't just patch the symptom), confirm with `npm run build`, and ship.

---

## 6. Add a new developer / area / compound

The scraper populates these from nawy. To add one manually:

1. **Decide where:** is this a one-off override, or should the scraper pick it up next run?
2. **One-off:** add the row to Supabase via the SQL editor or Table Editor. Use a `nawy_id` outside the scraper's range (8,000,000+ for areas, 9,000,000+ for developers — see `scripts/build-data-from-nawy.mjs`).
3. **Permanent:** if nawy has this developer/area/compound and the scraper missed it, debug the scraper instead of adding manually. Manual rows drift the moment we re-scrape.
4. **Update slug** to match the URL convention (lowercase, hyphenated). Use the `slugify()` function from `src/lib/data.ts`.
5. **Verify** the new entity shows up at its expected URL.

---

## 7. Pre-ship check (always before pushing)

This is exactly what `/ship` does — run it instead. But the manual steps:

```bash
npm run lint           # must pass
npm run build          # must pass
git status             # check what you're about to commit
git diff --cached      # final review of staged changes
```

**Scan the diff for:**
- Any `.env.local` or `SUPABASE_SERVICE_ROLE_KEY` (= block)
- Any TODOs you forgot to resolve
- Any unintended file (e.g. `.DS_Store`, build artifacts)
- Any hard-coded English strings in new components (should be in i18n.ts)

If clean: commit and push. Vercel auto-deploys main.

---

## 8. Roll back a bad deploy

Vercel's "Instant Rollback" is one click and zero risk.

1. Go to [Vercel → deal-finder → Deployments](https://vercel.com/thedealmakerxyz-5599s-projects/deal-finder/deployments).
2. Find the last known-good deployment.
3. Click ⋯ → **Promote to Production**.
4. Production switches over in seconds.

Then fix the bug locally, ship the fix. Don't try to `git revert` and push in a hurry — rollback first, fix calmly.

---

## 9. Run a database query

Two safe ways:

### Browser (read-only, via Supabase dashboard)

[Supabase SQL Editor](https://supabase.com/dashboard/project/nmrzefvdixmxmhmxojlv/sql). Run `select * from units limit 10` etc. Read queries are safe.

### Code (read or write, gated by RLS)

```ts
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from("units")
  .select("nawy_id, title, price")
  .limit(10);
```

**Never** put the service role key in client-side code. The anon key is RLS-gated (catalog: public-read; leads: insert-only).

---

## 10. Submit a PR

DealFinder uses trunk-based development with optional PRs:

- **Tiny doc fixes:** OK to commit straight to `main` (use `/ship`).
- **Anything else:** branch, push, open a PR. The PR template walks you through the checks.

```bash
git checkout -b fix/short-description
# ...make changes, /ship will commit + push...
gh pr create --fill            # or open via the GitHub UI
```

Vercel auto-creates a preview deploy on the PR — share that URL for review.

---

## When the recipe doesn't fit

If your task doesn't match a recipe above, **ask before improvising**. The team would rather have a 30-second clarifying question than discover next week that the wrong file was edited.
