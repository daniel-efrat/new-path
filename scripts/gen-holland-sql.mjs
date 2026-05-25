import { writeFileSync } from "fs";
import { STEP11_QUESTIONS } from "../lib/constants/questions.ts";

const RIASEC = ["R", "I", "A", "S", "E", "C"];
const vals = STEP11_QUESTIONS.map(
  (q, i) =>
    `('${q.id}','${q.text.replace(/'/g, "''")}','${RIASEC[i % 6]}')`
).join(",\n");

const sql = `INSERT INTO public.holland_questions (id, text, riasec_type) VALUES
${vals}
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, riasec_type = EXCLUDED.riasec_type;`;

writeFileSync("supabase/bootstrap/batches/holland_seed.sql", sql);
console.log("rows", STEP11_QUESTIONS.length, "chars", sql.length);
