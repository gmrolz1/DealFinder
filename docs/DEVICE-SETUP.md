# DealFinder — New Device Setup

Everything needed to get DealFinder running on a fresh machine.

> **Security note:** secret keys are intentionally **not** written in this
> file. A file holding live secrets — especially one committed to Git — is a
> leak waiting to happen. This doc tells you *where* to get each secret.
> Keep the actual secret values in a **password manager**.

---

## 1. Accounts you need

| Service  | Login | Notes |
|----------|-------|-------|
| GitHub   | `gmrolz1` | Repo: `https://github.com/gmrolz1/DealFinder` |
| Supabase | `gmrolz@gmail.com` | Org: **Wemakedeals** · Project: **Dealfinder** |
| Vercel   | your account | For deployment (optional until you deploy) |

## 2. Software prerequisites

- **Node.js** v24+ (project built on v24.13.0)
- **npm** v11+
- **Git**
- (optional) Claude Code

## 3. Get the project running

```
git clone https://github.com/gmrolz1/DealFinder.git
cd DealFinder
npm install
npm run dev          # -> http://localhost:3000
```

## 4. Environment file — `.env.local`

`.env.local` is **git-ignored**, so it is NOT in the repo — recreate it in
the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_HEcmkn2POVZDKLlFt2IlQA_6SP_lsK2
```

The publishable key above is **safe to keep here** — Supabase designates it
public (it ships in the browser bundle anyway).

## 5. Credentials — what they are and where to get them

| Credential | Sensitivity | Where to get it |
|---|---|---|
| Supabase project URL | public | Listed above |
| Supabase **publishable** (anon) key | public | Listed above · or Supabase → Project Settings → API Keys → Publishable |
| Supabase **secret** key | **SECRET** | Supabase → Project Settings → API Keys → Secret keys → reveal. Used only by the data loader. Never commit. |
| Supabase account password | **SECRET** | Your password manager |
| GitHub login / Personal Access Token | **SECRET** | Your password manager / GitHub → Settings → Developer settings |
| Vercel login | **SECRET** | Your password manager |

## 6. Supabase project facts

- Organization: **Wemakedeals**
- Project name: **Dealfinder**
- Project ref: `nmrzefvdixmxmhmxojlv`
- API URL: `https://nmrzefvdixmxmhmxojlv.supabase.co`
- Region: eu-west-1
- Tables: `areas`, `developers`, `compounds`, `units`, `leads`
  (full schema in `supabase/schema.sql`)

## 7. Re-generating data (optional)

Scraped JSON (`scraper/data/`) is git-ignored. To rebuild it:

```
node scraper/scrape.mjs
```

To load it into Supabase (needs the **secret** key — get it from the
dashboard, do not hard-code it):

```
# Windows PowerShell
$env:SUPABASE_URL="https://nmrzefvdixmxmhmxojlv.supabase.co"
$env:SUPABASE_KEY="<paste secret key here, then clear it after>"
node scraper/load-supabase.mjs
```

## 8. Optional — Supabase MCP for Claude Code

```
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=nmrzefvdixmxmhmxojlv&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
```

## 9. What this file deliberately does NOT contain

- The Supabase **secret** key
- Any account **passwords**
- Any access **tokens**

Those live in your **password manager**. If lost, regenerate/retrieve them
from each service's dashboard. Everything else needed to rebuild the
project is in this repo.
