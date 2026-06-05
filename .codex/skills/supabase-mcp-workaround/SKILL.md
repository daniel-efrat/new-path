---
name: supabase-mcp-workaround
description: 'Use in this new-path project when Supabase MCP calls fail with "MCP error -32600: You do not have permission to perform this action", when the in-thread mcp__supabase tools use a stale SUPABASE_ACCESS_TOKEN, or when the user asks to list tables/query Supabase through MCP and the verified repo token lives in .env.local. Provides the direct HTTP MCP workaround for project_ref hhcjagfhomddigmlbefj.'
---

# Supabase MCP Workaround

## Purpose

Use the repo token from `.env.local` to talk directly to the Supabase MCP HTTP endpoint when the normal `mcp__supabase.*` tools are bound to a stale process environment token.

Known project details:

- Project ref: `hhcjagfhomddigmlbefj`
- MCP URL: `https://mcp.supabase.com/mcp?project_ref=hhcjagfhomddigmlbefj`
- Token source: `.env.local`, variable `SUPABASE_ACCESS_TOKEN`

## Workflow

1. First try the normal `mcp__supabase` tool if it is available.
2. If it returns `MCP error -32600` permission denied, compare tokens without printing secrets:

```bash
ENV_TOKEN="$SUPABASE_ACCESS_TOKEN"
FILE_TOKEN=$(sed -n 's/^SUPABASE_ACCESS_TOKEN=//p' .env.local | tail -n 1)
if [ "$ENV_TOKEN" = "$FILE_TOKEN" ]; then echo "tokens match"; else echo "tokens differ"; fi
```

3. If the process token is stale but `.env.local` is valid, use `scripts/call_supabase_mcp.py`.
4. Never print the access token. Do not paste it into final answers.
5. If a token was exposed in terminal output, remind the user to revoke it and create a new one.

## Commands

List tables:

```bash
python3 .codex/skills/supabase-mcp-workaround/scripts/call_supabase_mcp.py list_tables
```

List public tables with column details:

```bash
python3 .codex/skills/supabase-mcp-workaround/scripts/call_supabase_mcp.py list_tables --schema public --verbose
```

Execute read-only SQL:

```bash
python3 .codex/skills/supabase-mcp-workaround/scripts/call_supabase_mcp.py execute_sql --query "select table_schema, table_name from information_schema.tables order by 1, 2"
```

## Notes

- Direct MCP calls require `Accept: application/json, text/event-stream`.
- Non-initialization calls require the `Mcp-Session-Id` returned by the `initialize` response headers.
- Network access may require sandbox escalation. Ask for approval when the shell reports DNS/network failures.
- This workaround is not a replacement for the permanent environment fix: launch Codex with `SUPABASE_ACCESS_TOKEN` set to the same value as `.env.local`.
