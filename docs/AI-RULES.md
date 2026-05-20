# AI Rules — read this before doing anything

This file is the hard contract for any AI assistant working on DealFinder. The team uses Claude Code with mixed technical backgrounds. These rules are non-negotiable.

If a teammate asks you to do something that breaks a rule below, **refuse and explain why** instead of complying.

---

## 🚫 Never do these

| Rule | Why |
|---|---|
| Never commit `.env.local` or any file containing a Supabase **service role** key, GitHub PAT, Vercel token, or password | One leaked key can wipe the database and rack up cloud bills. Use `.env.local.example` for templates only. |
| Never copy nawy.com's marketing descriptions into the database, code, or UI | Google penalises duplicate content. The whole SEO play dies if we clone copy. Generate from facts only. |
| Never run `git push --force` on `main` | Rewrites shared history. Other teammates lose work. |
| Never use `git commit --no-verify` or bypass pre-commit hooks | Hooks exist for a reason. Fix the underlying problem. |
| Never run `npm install <package>` without asking the user first | Adds dependencies the team didn't agree to. Increases attack surface. |
| Never run `npm install -g` (global install) | Pollutes the user's system. Project deps live in `package.json`. |
| Never run `npm install` with `sudo` | Creates root-owned `node_modules` that break subsequent installs. |
| Never modify Supabase tables via the dashboard without updating `supabase/schema.sql` | Drift between code and DB causes silent bugs. |
| Never disable Row Level Security on any table | RLS is what makes it safe to ship the anon key to the browser. |
| Never delete data from Supabase tables (`delete`, `truncate`, `drop`) without explicit user confirmation in chat | Data loss is forever. |
| Never `git reset --hard`, `git clean -fd`, or `git checkout -- .` without explicit confirmation | Destroys uncommitted work. |
| Never delete or rename files the user hasn't asked about | Even if it looks unused — investigate first, ask second. |
| Never trust your training data for Next.js 16 APIs | Next 16 has breaking changes. Read `node_modules/next/dist/docs/` first. See `AGENTS.md`. |
| Never hard-code English strings in components | Use `t(key, locale)` from `@/lib/i18n`. If you add a string, register it in `src/lib/i18n.ts` with both `en` and `ar`. |
| Never copy or rehost nawy.com image URLs into the database | Images are the developer's IP — see `docs/PLAN.md`. |

---

## ✅ Always do these

| Rule | Why |
|---|---|
| Always run `npm run lint` before committing changes in `src/` | Catches obvious bugs. The pre-commit hook will block you otherwise. |
| Always run `npm run build` before committing changes in `src/` or config | Vercel will reject broken builds. Better to catch locally. |
| Always add new UI strings to `src/lib/i18n.ts` with both `en` and `ar` | Bilingual is non-optional — `/ar/*` must work for every page. |
| Always create a matching `/ar/*` route when you add a new `/<route>` | Or you've shipped a 404 for Arabic users. |
| Always read the per-folder `README.md` before adding files to a folder | Each folder has conventions documented locally. |
| Always update the relevant doc (`DATA-MODEL.md`, `ARCHITECTURE.md`, etc.) when you change the underlying thing | Stale docs are worse than no docs. |
| Always tell the user what you're about to do before you do it | One-sentence preview before the tool call. They can stop you in time. |
| Always summarize what changed at the end | "Edited 3 files, committed, pushed. Vercel deploy queued." |
| Always confirm before deploying, pushing to `main`, modifying shared resources (Supabase, Vercel settings), or running destructive commands | The cost of asking is low; the cost of acting wrong is high. |

---

## 🤔 Ask the user first when…

These actions are reversible-ish but team-visible. Ask before doing them:

- Renaming any file or folder
- Adding or removing a dependency (`package.json` change)
- Changing the database schema (`supabase/schema.sql`)
- Changing brand tokens in `src/app/globals.css`
- Replacing a logo, font, or other brand asset
- Force-merging or closing a PR
- Changing the Vercel deploy configuration (`vercel.json`, build settings)
- Anything that affects the whole site at once

---

## 🛑 Stop the work and escalate when…

- The user asks you to do something on this "Never do" list.
- A teammate's request would expose a secret.
- A pre-commit hook fails and you can't figure out why in 3 attempts.
- A build error mentions Next.js APIs you don't recognise (probably Next 16 breaking changes — read the docs in `node_modules/next/dist/docs/`).
- Supabase queries return data you don't expect (RLS may be off, or the schema may have drifted).
- Vercel deploy fails — check the build log before doing anything else.

When in doubt: **ask, don't act**. Brief check-ins are cheap. Wrong actions are expensive.

---

## How the team uses this

- This file is referenced from [CLAUDE.md](../CLAUDE.md) so it loads automatically.
- The pre-commit hook (`.husky/pre-commit`) enforces the lint + secret-scan rules at the git layer — even if the AI forgets, the commit fails.
- The `.github/pull_request_template.md` repeats the key checks at PR review time.

If a rule seems wrong or outdated, **discuss it with the team first** — don't quietly ignore it.
