# Onboarding — get DealFinder running on any device

This guide gets the project running locally on Windows, macOS, or Linux from a fresh machine. Follow the section that matches your OS for the install step; everything else is the same.

---

## 1. Accounts you need

| Service  | Owner | Why |
|----------|-------|-----|
| GitHub   | `gmrolz1` | Repo: https://github.com/gmrolz1/DealFinder |
| Supabase | `gmrolz@gmail.com` | Wemakedeals org · project `Dealfinder` (ref `nmrzefvdixmxmhmxojlv`) |
| Vercel   | thedealmakerxyz team | Deployment — `deal-finder` project |

Ask the project owner for invites if you don't have access.

---

## 2. Prerequisites — install per OS

You need: **Node.js v22+** (v24 recommended), **npm v10+**, **git**.

### Windows

Easiest path uses [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) (preinstalled on Win 11):

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

Or use [Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows) (lets you keep multiple Node versions):

```powershell
winget install CoreyButler.NVMforWindows
nvm install 24.13.0
nvm use 24.13.0
```

**PowerShell users:** project scripts run fine in PowerShell — no WSL needed. If you hit "execution policy" errors running npm scripts, run once as admin:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### macOS

Easiest path uses [Homebrew](https://brew.sh/):

```bash
brew install node git
```

Or [nvm](https://github.com/nvm-sh/nvm) for multiple Node versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install 24
nvm use 24
```

### Linux (Debian / Ubuntu)

```bash
# Node 24 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

For other distros use your package manager or [nvm](https://github.com/nvm-sh/nvm).

### Verify

```bash
node --version    # v22+ (v24 ideal)
npm --version     # v10+
git --version     # any modern version
```

---

## 3. Clone the repo

```bash
git clone https://github.com/gmrolz1/DealFinder.git
cd DealFinder
```

If you don't have a GitHub SSH key set up, the HTTPS clone above will prompt for your GitHub username + a [Personal Access Token](https://github.com/settings/tokens) (not your password).

---

## 4. Environment file — `.env.local`

`.env.local` is **git-ignored** by design — it must never be committed. Copy the template:

**Windows (PowerShell):**

```powershell
Copy-Item .env.local.example .env.local
```

**macOS / Linux / Git Bash:**

```bash
cp .env.local.example .env.local
```

The template ships with the public Supabase URL and the publishable (anon) key, both of which are safe to expose — they're public by design and gated by Row Level Security.

The **secret** (service role) key is only needed if you run `scraper/load-supabase.mjs` to refresh data. Get it from Supabase → Project Settings → API Keys → Secret keys → reveal. **Never commit it.** Store it in your password manager.

See [DEVICE-SETUP.md](DEVICE-SETUP.md) for the full credentials inventory.

---

## 5. Install + run

```bash
npm install
npm run dev
```

Open http://localhost:3000. You should see the homepage with real Supabase data ("WHERE DEALS HAPPEN — 26,968 primary properties from 150 trusted developers across Egypt").

Sanity check the routes:

```bash
# Should each return HTTP 200
curl -I http://localhost:3000
curl -I http://localhost:3000/developers
curl -I http://localhost:3000/ar
```

If something fails, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

## 6. Editor setup (recommended)

**VS Code extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Prettier (`esbenp.prettier-vscode`) — optional, the project uses ESLint formatting

**TypeScript:** the workspace uses the version in `node_modules`. In VS Code, run `TypeScript: Select TypeScript Version → Use Workspace Version`.

---

## 7. Optional — Supabase MCP server (Claude Code users)

If you're using Claude Code, this lets the assistant query Supabase directly. Run once in a regular terminal (not the IDE):

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=nmrzefvdixmxmhmxojlv&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
```

Then `claude` → `/mcp` → select **supabase** → Authenticate → complete the browser flow.

---

## 8. Deploy

Vercel is already linked to the GitHub repo. Every push to `main` triggers an auto-deploy. To deploy a feature branch as a preview:

```bash
git checkout -b my-feature
# ...make changes...
git push -u origin my-feature
# Open the PR — Vercel comments with the preview URL
```

To force a redeploy without code changes, go to [Vercel → deal-finder](https://vercel.com/thedealmakerxyz-5599s-projects/deal-finder) → latest deployment → ⋯ → Redeploy.

---

## What this file does NOT contain

- The Supabase **secret** key — get from Supabase dashboard
- GitHub PATs, Vercel tokens, account passwords — store in your password manager

If anything goes wrong, start at [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
