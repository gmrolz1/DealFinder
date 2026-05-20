# Notes for AI assistants working on DealFinder

This file is loaded automatically by Claude Code. Read it first, every session.

The team using this project includes non-engineers ("vibe coders") who can't always tell when an AI is about to do something dangerous. **You are the firewall.** Default to caution. If a request would violate any rule below, refuse and explain — don't comply.

---

## 1. The two files that override your training data

@docs/AI-RULES.md
@AGENTS.md

`AI-RULES.md` lists the hard "never do / always do / ask first" rules. `AGENTS.md` is the warning that Next.js 16 is different from your training data.

If a teammate's request conflicts with either file, the file wins.

---

## 2. Read the docs before writing code

| If you're about to... | Read first |
|---|---|
| Onboard a new device | [docs/ONBOARDING.md](docs/ONBOARDING.md) |
| Do a common task (new page, copy edit, etc.) | [docs/TEAM-PLAYBOOK.md](docs/TEAM-PLAYBOOK.md) |
| Touch the data layer or scraper | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) + [docs/DATA-MODEL.md](docs/DATA-MODEL.md) |
| Add files anywhere | [docs/CONVENTIONS.md](docs/CONVENTIONS.md) + the per-folder `README.md` |
| Debug a broken build, deploy, or query | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Understand strategic context | [docs/PLAN.md](docs/PLAN.md) + [docs/ROADMAP.md](docs/ROADMAP.md) |

Every code folder has its own `README.md`. Read it before adding files to that folder.

---

## 3. Custom slash commands

The team has these commands in `.claude/commands/`:

| Command | What it does |
|---|---|
| `/ship` | End-of-task: runs lint + build, shows diff, asks for commit message, commits, pushes. Use this instead of running git commands one by one. |
| `/new-page` | Walks through adding a page (EN + AR mirror + i18n strings + sitemap). |
| `/check` | Sanity check: lint + build + secret scan. Doesn't change anything — just reports. |

When a teammate asks for "ship this", "commit and push", "deploy", or similar — run `/ship`. When they ask to add a page — run `/new-page`. Always offer these instead of running git commands ad-hoc.

---

## 4. How to respond to vibe-coder requests

These people are smart but may not know technical terms. Translate kindly:

| They say… | They mean… | What to do |
|---|---|---|
| "Push this" / "ship it" / "deploy" | Commit + push to main; Vercel auto-deploys | Run `/ship` |
| "Make the homepage say X" | Change copy in `src/app/page.tsx` (and `src/app/ar/page.tsx` for AR) | Edit both files; add strings to `src/lib/i18n.ts` if reused |
| "Add Arabic" | They forgot the `/ar/` mirror | Create the mirror page, mirror the i18n strings |
| "It's broken" | Could be local dev, prod, or build | First clarify *where* — `npm run dev`, Vercel, or build? Then check `docs/TROUBLESHOOTING.md` |
| "Update the data" | Re-run the scraper + loader | Confirm: scrape only, or scrape + load into Supabase? Loader needs service role key. |
| "Change the colour to X" | Update a brand token | Edit `src/app/globals.css`. Tell them what other things use that token. |

When unsure, **ask one clarifying question** — don't guess.

---

## 5. Hard rules summary

The full list is in [docs/AI-RULES.md](docs/AI-RULES.md). Top 5 to remember every session:

1. **Never commit secrets.** `.env.local`, service role keys, PATs. Pre-commit hook also blocks these — but don't rely on it.
2. **Never copy nawy's marketing copy.** Generate descriptions from facts. SEO depends on this.
3. **Never `npm install <package>` without asking.** Dependencies are team decisions.
4. **Always run `npm run lint && npm run build` before committing `src/` changes.** `/ship` does this automatically.
5. **Always confirm before destructive or shared-state actions.** Push to main, schema changes, deletes, force-pushes.

---

## 6. Project facts

| | |
|---|---|
| Repo | https://github.com/gmrolz1/DealFinder |
| Production | https://deal-finder-nu.vercel.app |
| Supabase | project ref `nmrzefvdixmxmhmxojlv` (Wemakedeals org, eu-west-1, Pro plan) |
| Stack | Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase |
| Default branch | `main` (auto-deploys to Vercel) |
| Data | ~46 areas · ~517 developers · ~1,769 compounds · ~5,961 primary units |

---

## 7. Style of work

- Prefer editing existing files over creating new ones.
- Run things in parallel when independent (multiple file reads, multiple greps).
- Use the dedicated tools (Read, Edit, Glob, Grep) instead of `cat`/`grep`/`find` via Bash.
- Be terse in chat; explicit one-sentence preview before every meaningful action.
- Wrap up tasks with a one-line summary ("3 files edited, committed, pushed").
- If a teammate's request is ambiguous, **ask one clarifying question** — don't guess.

---

## 8. Memory

Persistent memory for this project lives at `C:\Users\RA3\.claude\projects\D--deal-finder\memory\`. Update existing notes; don't duplicate.
