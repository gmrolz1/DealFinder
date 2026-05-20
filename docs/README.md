# docs/

All project documentation. Top-level docs live here; per-folder READMEs live inside each code folder.

| File | Purpose |
|---|---|
| [ONBOARDING.md](ONBOARDING.md) | Cross-device setup (Windows / macOS / Linux) — start here on a fresh machine. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How data and requests flow through the system. Read before changing the data layer. |
| [CONVENTIONS.md](CONVENTIONS.md) | File naming, where new code goes, commit format. |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common gotchas + fixes. Add to it when you solve a new one. |
| [DATA-MODEL.md](DATA-MODEL.md) | Postgres schema reference (companion to `supabase/schema.sql`). |
| [PLAN.md](PLAN.md) | Strategic plan — stack rationale, phases, scope. |
| [ROADMAP.md](ROADMAP.md) | Milestones M0–M6 with priorities. |
| [LOG.md](LOG.md) | Chronological build log. Append a new section for any structural change. |
| [SETUP.md](SETUP.md) | Supabase MCP server setup (for Claude Code users). |
| [DEVICE-SETUP.md](DEVICE-SETUP.md) | Credentials inventory — where to fetch each secret. |

## When to add a doc here

- **Per-folder READMEs go in the folder, not here.**
- **Reference docs** (schema, architecture, conventions) go here.
- **Decisions / rationale** that affect more than one folder go here.
- **One-off setup steps** for a third-party service go here.

## Style

- One purpose per file. If a doc covers two unrelated things, split it.
- Lead with the answer; explain after.
- Tables for inventories, code blocks for commands.
- Link liberally between docs.
- Markdown — no MDX, no special preprocessing.
