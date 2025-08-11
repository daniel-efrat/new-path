import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

async function main() {
  const input = process.argv[2] || "./step11_questions.json";
  const abs = path.resolve(input);
  const raw = await fs.readFile(abs, "utf8");
  const list = JSON.parse(raw);

  if (!Array.isArray(list)) {
    throw new Error("Input must be a JSON array.");
  }

  // ולידציה קצרה
  for (const q of list) {
    if (!q.id || !q.text || !q.riasec_type) {
      throw new Error(`Invalid question row: ${JSON.stringify(q)}`);
    }
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // upsert לפי primary key: id
  const { data, error } = await supabase
    .from("holland_questions")
    .upsert(list, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  console.log(`Upsert OK. Rows affected: ${data?.length ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
