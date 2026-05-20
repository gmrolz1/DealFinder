# Pull Request

## What this PR does

<!-- 1-3 sentences. What problem does it solve? -->

## How to test it

<!-- Steps a reviewer can run. Include URLs (preview deploy is automatic from Vercel). -->

- [ ] Open `/<route>` and confirm `<expected behaviour>`
- [ ] Open `/ar/<route>` and confirm the Arabic mirror works
- [ ] (If data changed) check Supabase Table Editor for the new rows

## Checklist

Before requesting review, confirm each item:

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No secrets in the diff (no `.env.local`, no service role keys, no PATs)
- [ ] Every new EN page has a matching `/ar/<route>` mirror
- [ ] Every new user-facing string is in `src/lib/i18n.ts` with both `en` and `ar` values
- [ ] No nawy.com marketing copy was copied verbatim (descriptions are generated from facts)
- [ ] If schema changed: `supabase/schema.sql` updated + `docs/DATA-MODEL.md` updated
- [ ] If dependencies changed: discussed with the team first
- [ ] Folder conventions followed — see `docs/CONVENTIONS.md` and the per-folder `README.md`

## Anything reviewers should know

<!-- Surprising decisions, things you tried that didn't work, follow-ups for later. -->

## Screenshots (if UI changed)

<!-- Before / after for visual changes. Include both EN and AR if relevant. -->
