# Setup — steps YOU run

Some steps are interactive (login/auth) and must be run by you in a normal
terminal, not by the assistant.

## 1. Supabase MCP server

In the project root, add the Supabase MCP server:

```
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=nmrzefvdixmxmhmxojlv&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
```

## 2. Authenticate

In a regular terminal (not the IDE extension):

```
claude
/mcp
```

Select the `supabase` server → Authenticate → complete the browser flow.

## 3. Install Supabase Agent Skills (optional)

```
npx skills add supabase/agent-skills
```

## 4. Environment variables

Create `.env.local` (already git-ignored — never commit it):

```
NEXT_PUBLIC_SUPABASE_URL=https://nmrzefvdixmxmhmxojlv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard > Project Settings > API>
SUPABASE_SERVICE_ROLE_KEY=<same page — secret, server-only>
```

## 5. Connect to Vercel

vercel.com → Add New → Project → Import `gmrolz1/DealFinder` →
add the same env vars → Deploy. After this, every `git push` auto-deploys.

---

Tell the assistant once steps 1–2 are done — it can then create the
database tables and run the scraper through the MCP server.
