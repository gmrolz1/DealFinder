#!/usr/bin/env bash
# Pre-tool hook for Claude Code.
# Refuses any Bash command that would expose the Supabase service role key
# or commit secret-bearing files.
#
# This runs BEFORE the tool executes. Exit 0 = allow. Exit 2 = block with reason.

set -eu

# Read the tool input from stdin (JSON).
INPUT=$(cat)

# Extract the command field (works without jq by using grep/sed; falls back
# gracefully if the field is not a Bash command).
CMD=$(printf '%s' "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | head -1)

if [ -z "$CMD" ]; then
  exit 0
fi

# Hard-block patterns. If any match, refuse the tool call with a clear reason.
case "$CMD" in
  *SUPABASE_SERVICE_ROLE_KEY*|*service_role*|*service-role*)
    echo "🚫 Blocked: command appears to reference the Supabase service role key." >&2
    echo "   Never echo, log, or commit secret keys. See docs/AI-RULES.md." >&2
    exit 2
    ;;
  *"git add"*".env.local"*|*"git add"*".env "*|*"git add .env"*)
    echo "🚫 Blocked: refusing to stage a .env* file. These contain secrets." >&2
    echo "   Use .env.local.example for templates. See docs/AI-RULES.md." >&2
    exit 2
    ;;
  *"git push --force"*|*"git push -f"*)
    echo "🚫 Blocked: never force-push. Rewrites shared history." >&2
    echo "   If you need to recover, ask the user first." >&2
    exit 2
    ;;
  *"--no-verify"*)
    echo "🚫 Blocked: refusing to bypass pre-commit hooks." >&2
    echo "   Fix the underlying issue instead. See docs/AI-RULES.md." >&2
    exit 2
    ;;
esac

exit 0
