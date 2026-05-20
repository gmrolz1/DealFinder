# DealFinder

> Egyptian real-estate marketplace — primary apartments, villas and chalets from trusted developers. Bilingual (EN / AR + RTL). Built around one idea: **finding the deal**.

| | |
|---|---|
| **Production** | https://deal-finder-nu.vercel.app |
| **Stack** | Next.js 16 · React 19 · TypeScript · Tailwind 4 · Supabase (Postgres) |
| **Hosting** | Vercel (`deal-finder` under `thedealmakerxyz`) — auto-deploys on push to `main` |
| **Database** | Supabase project `nmrzefvdixmxmhmxojlv` (Wemakedeals org, eu-west-1) |
| **Data** | ~46 areas · ~517 developers · ~1,769 compounds · ~5,961 primary units |
| **Source** | Scraped from nawy.com's public JSON API · descriptions generated, not copied |

---

## Quick start

```bash
git clone https://github.com/gmrolz1/DealFinder.git
cd DealFinder
npm install
cp .env.local.example .env.local   # then fill in Supabase keys — see ONBOARDING.md
npm run dev
```

Open http://localhost:3000.

**Full setup for any device (Windows / macOS / Linux):** [docs/ONBOARDING.md](docs/ONBOARDING.md)

---

## Documentation map

Start at the top. Each doc has a clear single purpose.

| Doc | When to read it |
|---|---|
| **[docs/ONBOARDING.md](docs/ONBOARDING.md)** | First time on a new machine — install, env vars, verify |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Understand how data flows (Nawy → scraper → Supabase → Next.js) |
| **[docs/CONVENTIONS.md](docs/CONVENTIONS.md)** | Where new code goes, file naming, commit format |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Something is broken — common gotchas + fixes |
| **[docs/DATA-MODEL.md](docs/DATA-MODEL.md)** | Postgres schema reference (`areas`, `developers`, `compounds`, `units`, `leads`) |
| **[docs/PLAN.md](docs/PLAN.md)** | Strategic plan — phases, stack rationale, scope |
| **[docs/ROADMAP.md](docs/ROADMAP.md)** | Milestones M0–M6 with priorities |
| **[docs/LOG.md](docs/LOG.md)** | Chronological build log — every step taken |
| **[docs/SETUP.md](docs/SETUP.md)** | Supabase MCP server setup (for Claude Code users) |
| **[docs/DEVICE-SETUP.md](docs/DEVICE-SETUP.md)** | Credentials reference (where to get each secret) |
| **[AGENTS.md](AGENTS.md)** | Heads-up for AI agents: Next.js 16 has breaking changes |

Every code folder also has its own README — open any subfolder and the README explains what's there and how to add new things.

---

## Project layout (top level)

```
DealFinder/
├── src/                   Next.js app (App Router) — see src/README.md
├── public/                Static assets — see public/README.md
├── scraper/               Data pipeline (Nawy → JSON → Supabase) — see scraper/README.md
├── scripts/               One-off build helpers — see scripts/README.md
├── supabase/              schema.sql — see supabase/README.md
├── brand/                 The Deal Maker brand assets (PDFs, fonts, social) — see brand/README.md
├── docs/                  Strategic + reference docs — see docs/README.md
├── middleware.ts          Exposes pathname header for locale detection
├── next.config.ts         Bundles scraper/data/*.json into Vercel routes
├── package.json
├── README.md              ← you are here
└── ONBOARDING.md          (in docs/)
```

---

## Common commands

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```

Data re-scrape (optional — Supabase is already loaded):

```bash
node scraper/scrape.mjs                    # full scrape from nawy's API
node scraper/scrape.mjs --limit 3          # smoke test
node scraper/load-supabase.mjs             # requires SUPABASE_SERVICE_ROLE_KEY
```

---

## Contributing

1. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — file naming, where new code goes, commit format.
2. Read [AGENTS.md](AGENTS.md) before touching Next.js APIs — Next 16 changed things.
3. Branch from `main`, open a PR. Vercel will spin up a preview.

---

## License

Private — proprietary to The Deal Maker / Wemakedeals.
