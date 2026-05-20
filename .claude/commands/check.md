---
description: Read-only health check — lint, build, secret scan, locale parity. Reports without changing anything.
---

# /check — project health check

Run a non-destructive sanity check. **Do not modify any files.** Just report what's working and what isn't.

## Steps

1. **Working tree:**
   - `git status` — uncommitted changes?
   - `git log --oneline -5` — recent commits
   - `git rev-parse --abbrev-ref HEAD` — current branch
   - Is the branch up-to-date with `origin/main`?

2. **Build health:**
   - `npm run lint` — pass or fail?
   - `npm run build` — pass or fail? Report compile time and route count.

3. **Secret scan:** grep the working tree for likely secrets. Report any hits:
   ```bash
   git grep -nE "(SUPABASE_SERVICE_ROLE_KEY|service_role|sb_secret|ghp_[A-Za-z0-9]{30,}|sk_live_)" -- ':!docs/**' ':!.claude/**' ':!*.md'
   ```
   Whitelist allowed substrings (e.g. the AI rules mentioning these terms).

4. **Locale parity:** every `src/app/<route>/page.tsx` should have a matching `src/app/ar/<route>/page.tsx`. List any missing mirrors.

5. **i18n discipline:** scan `src/components/**/*.tsx` and `src/app/**/*.tsx` for likely hard-coded English strings that should be in `src/lib/i18n.ts`. A simple heuristic: JSX text content with 3+ words that isn't a variable. Report suspicious lines (don't auto-fix).

6. **Dependency drift:** is `package-lock.json` modified without a matching `package.json` change? That's a leftover from a casual `npm install`.

7. **Vercel readiness:** confirm `.env.local` exists locally with both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Don't print the values.

## Output

A short report:

```
✅ git: clean / 2 commits ahead of main
✅ lint: pass
✅ build: pass (21 routes, 4.8s)
✅ secrets: none found
⚠ locale parity: /about missing /ar/about mirror
⚠ i18n: 3 hard-coded English strings — src/components/site-header.tsx:42, ...
✅ deps: in sync
✅ env: .env.local present with required keys
```

## Tone

Read-only. Be precise. Don't propose fixes unless the user asks — just report.
