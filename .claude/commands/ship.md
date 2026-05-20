---
description: Pre-flight checks + commit + push. Use this instead of running git commands one by one.
---

# /ship — end-of-task workflow

Walk the user through shipping their current changes safely. **Do not skip steps.**

## Steps

1. **Read `docs/AI-RULES.md`** if you haven't this session. Confirm the changes don't violate any rule.

2. **Show the user what's changing.** Run `git status` and `git diff --stat` (and `git diff` if the changes are small). Surface anything suspicious:
   - Any `.env.local`, service role key, or token text in the diff
   - Any unintended files (`.DS_Store`, `node_modules/`, large binaries)
   - Any hard-coded English strings in new components (should be in `src/lib/i18n.ts`)
   - Any new `/<route>` page without a matching `/ar/<route>` mirror
   - Any new dependency in `package.json` not discussed with the user
   - Any change to `supabase/schema.sql` without a matching docs/DATA-MODEL.md update

   If you find any of these, **stop and ask** — don't ship until resolved.

3. **Run lint and build.** If anything in `src/` or config changed:
   ```bash
   npm run lint
   npm run build
   ```
   If either fails, fix the issue before continuing. Do not commit broken code.

4. **Confirm the commit message.** Draft a short, imperative message in the project's style:
   - First line under 70 chars, lowercase-first, present tense
   - Examples from `git log`: "Fix language switcher to stay on the same page", "Add full dataset, developer landing pages, and fix Vercel deploy"
   - Body (optional): explain *why*, not *what*
   
   **Show the draft to the user and ask "ship this?"** before committing.

5. **Stage + commit.** Use `git add` with explicit file paths (never `git add -A` — risks staging secrets or junk).

6. **Push to `main`** (or the current branch). Confirm with the user before pushing, especially if it's `main`.

7. **Confirm the deploy.** If pushed to `main`, mention that Vercel will auto-deploy in 1–3 minutes. Offer to check the Vercel dashboard if the user wants.

## Refuse to ship if

- Lint or build fails
- Any rule in `docs/AI-RULES.md` is violated
- The diff contains a secret
- A new EN page has no AR mirror
- The user hasn't confirmed the commit message

## Tone

Be terse. One status line per step. The user can read git output themselves.
