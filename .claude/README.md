# .claude/

Project-level Claude Code configuration. Loaded automatically by every teammate's Claude Code when they open this repo.

```
.claude/
├── settings.json          Permissions (allow/ask/deny) + hooks
├── hooks/
│   └── block-secrets.sh   Refuses bash commands that would leak secrets or force-push
├── commands/
│   ├── ship.md            /ship — end-of-task: lint + build + commit + push
│   ├── new-page.md        /new-page — add a page with EN+AR mirror + i18n + sitemap
│   └── check.md           /check — read-only health check (lint, build, secrets, locale parity)
└── README.md              this file
```

## What this gives the team

- **Auto-approved safe commands.** `npm run dev/build/lint`, read-only git, basic file ops — no permission prompts.
- **Confirmed risky commands.** `git push`, `npm install <pkg>`, file moves/deletes — Claude asks first.
- **Blocked dangerous commands.** Force-push, `git reset --hard`, global npm installs, `sudo`, reading `.env.local`.
- **Pre-tool secret guard.** Any bash command that mentions the service role key or stages a `.env*` file is blocked with a clear reason.
- **Custom slash commands** for the workflows the team does often (`/ship`, `/new-page`, `/check`).

## Editing rules

- **Tighten, don't loosen.** Moving a command from `deny` → `ask` or `ask` → `allow` should be a team conversation, not a silent change. The defaults exist because the team includes non-engineers.
- **Add to `allow` only if it's read-only or fully reversible.** When in doubt, put it in `ask`.
- **Test hook changes locally** before committing — a broken hook blocks every tool call.
- **Pin slash commands to a single purpose.** If a command grows beyond one workflow, split it.

## Adding a new slash command

1. Create `.claude/commands/<name>.md` with a frontmatter `description:` and a markdown body describing the workflow.
2. Reference it from `CLAUDE.md` so teammates know it exists.
3. Test by typing `/<name>` in Claude Code.

## Adding a new permission

1. Decide which bucket: `allow` (no prompt), `ask` (Claude asks), `deny` (blocked).
2. Use the most specific matcher you can. `Bash(npm install)` matches exactly that command; `Bash(npm install *)` matches `npm install <anything>`.
3. Commit with a short rationale in the commit message.

## Adding a hook

Hooks run on tool events (`PreToolUse`, `PostToolUse`, etc.). The current hook (`hooks/block-secrets.sh`) is `PreToolUse` for Bash — it inspects the command and exits non-zero to block.

Keep hooks fast (< 100ms) — they run on every tool call. Keep them resilient — a crashing hook blocks all work.

## See also

- [docs/AI-RULES.md](../docs/AI-RULES.md) — the human-readable rules the hooks enforce.
- [CLAUDE.md](../CLAUDE.md) — main entry point for Claude Code.
- [Claude Code settings docs](https://docs.claude.com/en/docs/claude-code/settings) — the full settings schema.
