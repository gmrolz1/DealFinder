# Troubleshooting

Common problems and how to fix them. If you hit something not listed here, add it once you've solved it — future-you will thank you.

---

## `npm install` fails

### `EBADENGINE` or "unsupported engine"

You're on an older Node version. Check:

```bash
node --version
```

Need v22+ (v24 recommended). Install via [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows).

### `EACCES` permission denied (macOS/Linux)

You ran a previous `npm install` with `sudo`, which created root-owned `node_modules`. Fix:

```bash
sudo rm -rf node_modules
npm install
```

Don't use `sudo` with npm — fix npm's permissions instead (see [npm docs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)).

### Network / timeout

Behind a corporate proxy? Set `HTTPS_PROXY` and `HTTP_PROXY` env vars, or use `npm config set registry https://registry.npmjs.org/`.

---

## `npm run dev` fails

### `Error: Cannot find module 'next'`

`npm install` didn't finish or wasn't run. Re-run it.

### Port 3000 already in use

Another process is using port 3000.

**Windows (PowerShell):**

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess
Stop-Process -Id <PID>
```

**macOS / Linux:**

```bash
lsof -i :3000
kill -9 <PID>
```

Or run on a different port: `next dev -p 3001`.

### `out of memory` during dev or build

The dev script already sets a 4GB heap (`NODE_OPTIONS=--max-old-space-size=4096`). If you still hit this, bump to 8GB:

```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=8192 && npm run dev

# macOS / Linux
NODE_OPTIONS=--max-old-space-size=8192 npm run dev
```

### Hot reload not picking up changes

Turbopack's file watcher occasionally misses changes on networked filesystems (NFS, some Docker mounts, OneDrive-synced folders). Move the repo to a local non-synced directory.

### Stale build / weird 500 errors

Kill all node processes and remove the cache:

```bash
# Windows (PowerShell)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next, node_modules\.cache -ErrorAction SilentlyContinue
npm run dev

# macOS / Linux
pkill -f node
rm -rf .next node_modules/.cache
npm run dev
```

---

## Pages load but data is empty / "26,968" reads "0"

`scraper/data/*.json` are missing. The repo only commits four JSON files; if you've been working with the scraper and accidentally deleted them, restore from git:

```bash
git checkout scraper/data/areas.json scraper/data/developers.json scraper/data/compounds.json scraper/data/units.json
```

Or re-scrape (takes ~2 minutes):

```bash
node scraper/scrape.mjs
```

---

## Supabase queries return empty arrays / 401

### Empty arrays

`NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing from `.env.local`. Confirm:

```bash
# macOS / Linux
grep SUPABASE .env.local
# Windows PowerShell
Select-String SUPABASE .env.local
```

Restart `npm run dev` after editing `.env.local` — env vars are read once at boot.

### `JWT expired` / `invalid API key`

The publishable (anon) key in `.env.local.example` is the current one. If it ever stops working, fetch the latest from Supabase → Project Settings → API Keys → Publishable.

### Inserts to `leads` fail

`leads` has an insert-only public RLS policy. If your insert is failing, check you're using the anon key (not service role) and that the row contains required fields (`name`, `phone`).

---

## Vercel deploy fails

### Build error: `Cannot find module 'scraper/data/...'`

This is exactly what `next.config.ts → outputFileTracingIncludes` exists to prevent. If you added new files under `scraper/data/` and they're required at runtime, make sure the glob in `next.config.ts` still matches.

### Build error: out of memory

The `build` script already sets a 4GB heap. For Vercel, set `NODE_OPTIONS=--max-old-space-size=4096` in Project Settings → Environment Variables (Production).

### Wrong env vars / publishable key

In Vercel Project Settings → Environment Variables, make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for **Production** (and **Preview** if you want preview deploys to query the DB).

### Vercel didn't auto-deploy after `git push`

Check the Vercel dashboard: the project must be linked to the GitHub repo. Settings → Git → ensure `gmrolz1/DealFinder` is connected and `main` is the production branch.

---

## TypeScript / lint errors

### `Type 'X' is not assignable to type 'Y'`

The types in `src/lib/data.ts` are the source of truth. If you changed the JSON shape via the scraper, update the types. If you changed Supabase columns, update both `supabase/schema.sql` *and* the types.

### ESLint complains about something Next.js generated

Next.js auto-generates `next-env.d.ts` — it's in `.gitignore` for a reason. Don't edit it. Restart your editor's TS server.

---

## Scraper issues

### `429 Too Many Requests` from nawy

The scraper already throttles (concurrency 4, 120ms delay). If you hit 429 repeatedly, increase the delay:

```js
// scraper/scrape.mjs
const REQ_DELAY = 250;  // bump to 250-500ms
const CONCURRENCY = 2;  // lower concurrency
```

### Loader fails with "Set SUPABASE_URL and SUPABASE_KEY env vars"

You need the **service role** key for the loader (not the anon key). Fetch from Supabase → Project Settings → API Keys → Secret keys → reveal. Then:

```bash
# Windows PowerShell
$env:SUPABASE_URL="https://nmrzefvdixmxmhmxojlv.supabase.co"
$env:SUPABASE_KEY="<paste, then clear after>"
node scraper/load-supabase.mjs

# macOS / Linux
SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co \
SUPABASE_KEY=<paste> \
node scraper/load-supabase.mjs
```

**Never** commit the secret key.

### Loader fails with "duplicate key value violates unique constraint"

The scraper occasionally returns duplicate `nawy_id` rows. The loader has a `dedupe()` step — if you've modified the loader, make sure it still calls it before upserting.

---

## Git / GitHub

### `Permission denied (publickey)` on push

You don't have an SSH key registered with GitHub, or the clone URL is HTTPS but you don't have a PAT. Easiest fix: switch the remote to HTTPS and use a Personal Access Token:

```bash
git remote set-url origin https://github.com/gmrolz1/DealFinder.git
git push        # username = your GitHub login, password = your PAT
```

Or [add an SSH key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

### Accidentally committed `.env.local` or a secret

1. Rotate the secret immediately in the Supabase dashboard.
2. Remove the file from git: `git rm --cached .env.local && git commit -m "Remove .env.local"`
3. If pushed already, also rewrite history with [git-filter-repo](https://github.com/newren/git-filter-repo) — and rotate the secret regardless.

---

## Windows-specific

### Long path errors

Windows has a 260-character path limit by default. Enable long paths:

```powershell
# Run as admin
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Then enable in git: `git config --system core.longpaths true`.

### Line ending warnings (CRLF vs LF)

The project uses LF endings. Configure git on Windows to convert:

```bash
git config --global core.autocrlf input
```

### PowerShell execution policy errors

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## When all else fails

1. Read the relevant section of [docs/ARCHITECTURE.md](ARCHITECTURE.md) to make sure your mental model matches reality.
2. Check [docs/LOG.md](LOG.md) — the issue may already be documented as a past fix.
3. Read [AGENTS.md](../AGENTS.md) — if you're using an AI assistant and getting bad suggestions, it may be applying Next.js 15 / pre-16 knowledge.
4. Open an issue with the **exact** error message, your OS + Node version, and what you ran.
