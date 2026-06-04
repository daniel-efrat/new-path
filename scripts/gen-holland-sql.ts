import { writeFileSync } from "fs";
import { STEP11_QUESTIONS } from "../lib/constants/questions";

const HOLLAND_STEP_NUMBER = 10;

const vals = STEP11_QUESTIONS.map(
  (q) =>
    `('${q.id}','${q.text.replace(/'/g, "''")}','${q.riasecType}')`
).join(",\n");

const sql = `INSERT INTO public.holland_questions (id, text, riasec_type) VALUES
${vals}
ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text, riasec_type = EXCLUDED.riasec_type;

INSERT INTO public.questions (id, step_number, question_text, question_type, answer_options) VALUES
${STEP11_QUESTIONS.map(
  (q) =>
    `('${q.id}'::uuid, ${HOLLAND_STEP_NUMBER}, '${q.text.replace(/'/g, "''")}', 'holland', NULL)`
).join(",\n")}
ON CONFLICT (id) DO UPDATE
SET step_number = EXCLUDED.step_number,
    question_text = EXCLUDED.question_text,
    question_type = EXCLUDED.question_type,
    answer_options = EXCLUDED.answer_options;`;

writeFileSync("supabase/bootstrap/batches/holland_seed.sql", sql);
console.log("rows", STEP11_QUESTIONS.length, "chars", sql.length);
