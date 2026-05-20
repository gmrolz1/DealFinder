# Notes for AI assistants working on DealFinder

This file is loaded automatically by Claude Code. Read it first.

---

## 1. Next.js 16 is different — don't trust training data

@AGENTS.md

Before writing or modifying code that touches Next.js APIs (`headers()`, `cookies()`, `params`, `searchParams`, route conventions, middleware, metadata, `next/font`, etc.), read the relevant guide in `node_modules/next/dist/docs/`. Treat your training-data understanding of Next.js as approximate.

Specifically:
- `headers()`, `cookies()`, `params`, `searchParams` are async — `await` them.
- App Router conventions changed in 15+; double-check route handlers and parallel routes.
- Turbopack is the default dev bundler (the `dev` script does not pass `--turbo` because it's implicit).

---

## 2. Read the docs before writing code

| If you're about to... | Read first |
|---|---|
| Set up the project on a new device | [docs/ONBOARDING.md](docs/ONBOARDING.md) |
| Touch the data layer or scraper | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) + [docs/DATA-MODEL.md](docs/DATA-MODEL.md) |
| Add a new component, page, or file | [docs/CONVENTIONS.md](docs/CONVENTIONS.md) |
| Debug a broken build, deploy, or query | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Understand strategic context | [docs/PLAN.md](docs/PLAN.md) + [docs/ROADMAP.md](docs/ROADMAP.md) |

Every code folder also has its own `README.md` — read it before touching files in that folder.

---

## 3. Hard rules

| Rule | Why |
|---|---|
| Never copy nawy's marketing descriptions into the database or UI | Google penalises duplicate content — verbatim clones will not rank. Generate from facts. |
| Never commit `.env.local` or the Supabase service role key | The publishable (anon) key is public by design; the service role key is **secret**. |
| Never use `git push --force` on `main` | Rewrites shared history. |
| Never run `npm install` with `sudo` | Breaks subsequent installs. |
| Never bypass pre-commit hooks (`--no-verify`) | Hooks catch real issues — fix the underlying problem. |
| Always run `npm run lint` and `npm run build` before committing src/ changes | Vercel will reject broken builds. |
| Always update `docs/LOG.md` for structural changes | Future-you needs the trail. |

---

## 4. Project facts

| | |
|---|---|
| Repo | https://github.com/gmrolz1/DealFinder |
| Production | https://deal-finder-nu.vercel.app |
| Supabase | project ref `nmrzefvdixmxmhmxojlv` (Wemakedeals org, eu-west-1, Pro plan) |
| Stack | Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase |
| Default branch | `main` (auto-deploys to Vercel) |
| Data | ~46 areas · ~517 developers · ~1,769 compounds · ~5,961 primary units |

---

## 5. Style of work

- Prefer editing existing files over creating new ones.
- Run things in parallel when independent (multiple file reads, multiple greps).
- Use the dedicated tools (Read, Edit, Glob, Grep) instead of `cat`/`grep`/`find` via Bash.
- Confirm before destructive actions (deletions, force pushes, schema drops, removing dependencies).
- Be terse in chat; verbose in code comments only when *why* is non-obvious.

---

## 6. Memory

The user has persistent memory at `C:\Users\RA3\.claude\projects\D--deal-finder\memory\`. Existing memories:

- `project_dealfinder.md` — stack, Supabase project, hosting, branding context
- `user_profile.md` — user is `gmrolz1`, Wemakedeals owner, deploys to Vercel

Update these as you learn new things; don't duplicate.
