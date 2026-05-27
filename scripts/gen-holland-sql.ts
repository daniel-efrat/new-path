import { writeFileSync } from "fs";
import { STEP11_QUESTIONS } from "../lib/constants/questions";

const vals = STEP11_QUESTIONS.map(
  (q) =>
    `('${q.id}','${q.text.replace(/'/g, "''")}','${q.riasecType}')`
).join(",\n");

const sql = `INSERT INTO public.holland_questions (id, text, riasec_type) VALUES
${vals}
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, riasec_type = EXCLUDED.riasec_type;`;

writeFileSync("supabase/bootstrap/batches/holland_seed.sql", sql);
console.log("rows", STEP11_QUESTIONS.length, "chars", sql.length);
