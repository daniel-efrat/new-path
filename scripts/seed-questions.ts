console.log("--- Script execution started ---");

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";
import {
  STEP1_QUESTIONS,
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP4_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP9_QUESTIONS,
  STEP10_QUESTIONS,
  STEP11_QUESTIONS,
} from "../lib/constants/questions";

config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase URL or Service Role Key is missing.");
  console.error(
    "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const QUESTION_GROUPS = [
  { step: 1, questions: STEP1_QUESTIONS, type: "trait" },
  { step: 2, questions: STEP2_QUESTIONS, type: "question" },
  { step: 3, questions: STEP3_QUESTIONS, type: "question" },
  { step: 4, questions: STEP4_QUESTIONS, type: "anchor" },
  { step: 5, questions: STEP5_QUESTIONS, type: "question" },
  { step: 6, questions: STEP6_QUESTIONS, type: "question" },
  { step: 7, questions: STEP7_QUESTIONS, type: "question" },
  { step: 8, questions: STEP8_QUESTIONS, type: "question" },
  { step: 9, questions: STEP9_QUESTIONS, type: "question" },
  { step: 10, questions: STEP10_QUESTIONS, type: "personality" },
  { step: 11, questions: STEP11_QUESTIONS, type: "holland" },
] as const;

function getQuestionText(question: any) {
  return question.text ?? question.statement ?? question.question;
}

function getAnswerOptions(question: any) {
  if (!Array.isArray(question.options)) return null;

  return {
    options: question.options,
    correct_option: question.correct_option,
  };
}

async function seedQuestions() {
  console.log("Starting to seed questions...");

  const formattedQuestions = QUESTION_GROUPS.flatMap((group) =>
    group.questions.map((question: any) => ({
      id: question.id,
      step_number: group.step,
      question_text: getQuestionText(question),
      question_type: group.type,
      answer_options: getAnswerOptions(question),
    }))
  );

  const { data, error } = await supabase
    .from("questions")
    .upsert(formattedQuestions, {
      onConflict: "id",
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    console.error("Error seeding questions:", error.message);
    if (error.details) console.error("Details:", error.details);
    process.exit(1);
  }

  console.log("Successfully seeded questions!");
  console.log(`Upserted ${data?.length ?? formattedQuestions.length} questions.`);
}

seedQuestions();
