/**
 * Apply SQL batch files via supabase-self-hosted MCP (stdio/HTTP bridge).
 * Run: node scripts/mcp-apply-batches.mjs [glob-pattern]
 * Default: supabase/bootstrap/batches/*.sql
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MCP_URL = process.env.SUPABASE_MCP_URL || "http://127.0.0.1:18080/mcp";

async function mcpCall(toolName, args) {
  const body = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}: ${text}`);
  // SSE or JSON response
  const jsonLine = text
    .split("\n")
    .map((l) => l.replace(/^data:\s*/, "").trim())
    .find((l) => l.startsWith("{"));
  return JSON.parse(jsonLine || text);
}

async function applySql(name, query) {
  const result = await mcpCall("execute_sql", { query });
  if (result.error) throw new Error(JSON.stringify(result.error));
  const content = result.result?.content?.[0]?.text ?? JSON.stringify(result);
  if (content.includes("PgMetaDatabaseError") || content.includes('"error"')) {
    throw new Error(`${name} failed: ${content.slice(0, 300)}`);
  }
  console.log(`OK ${name}`);
}

async function main() {
  const pattern = process.argv[2] || path.join(__dirname, "../supabase/bootstrap/batches");
  const dir = fs.statSync(pattern).isDirectory() ? pattern : path.dirname(pattern);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const full = path.join(dir, file);
    const query = fs.readFileSync(full, "utf8");
    const name = path.basename(file, ".sql").replace(/-/g, "_");
    await applySql(name, query);
  }
  await mcpCall("execute_sql", { query: "NOTIFY pgrst, 'reload schema';" });
  console.log("Schema reload notified.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
