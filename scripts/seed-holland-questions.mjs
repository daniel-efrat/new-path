/**
 * Seed holland_questions from STEP11_QUESTIONS with RIASEC types.
 *
 * Usage (from repo root):
 *   npx tsx scripts/seed-holland-questions.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { STEP11_QUESTIONS } from "../lib/constants/questions.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = STEP11_QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text,
    riasec_type: q.riasecType,
  }));

  const { data, error } = await supabase
    .from("holland_questions")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`Holland questions seeded: ${data?.length ?? rows.length} rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
