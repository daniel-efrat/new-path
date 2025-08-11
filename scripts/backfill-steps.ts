import { createClient } from "@supabase/supabase-js";

import {
  STEP1_QUESTIONS,
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP4_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP11_QUESTIONS,
} from "../lib/constants/questions";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are defined in your .env.local file."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log("Successfully connected to Supabase.");

// 1. Create a map of questionId -> stepNumber
const questionToStepMap = new Map<string, number>();

const steps = [
  { step: 1, questions: STEP1_QUESTIONS },
  { step: 2, questions: STEP2_QUESTIONS },
  { step: 3, questions: STEP3_QUESTIONS },
  { step: 4, questions: STEP4_QUESTIONS },
  { step: 5, questions: STEP5_QUESTIONS },
  { step: 6, questions: STEP6_QUESTIONS },
  { step: 7, questions: STEP7_QUESTIONS },
  { step: 8, questions: STEP8_QUESTIONS },
  { step: 11, questions: STEP11_QUESTIONS },
];

steps.forEach(({ step, questions }) => {
  // The questions constant can be an array of objects with an 'id' property
  if (Array.isArray(questions)) {
    questions.forEach((question) => {
      if (question && question.id) {
        questionToStepMap.set(question.id, step);
      }
    });
  }
});

console.log(
  `Mapped ${questionToStepMap.size} questions to their respective steps.`
);

// 2. Main backfill function
async function backfillStepNumbers() {
  console.log("Fetching answers with null step values...");

  const { data: answers, error: fetchError } = await supabase
    .from("answers")
    .select("id, question_id")
    .is("step", null);

  if (fetchError) {
    console.error("Error fetching answers:", fetchError.message);
    return;
  }

  if (!answers || answers.length === 0) {
    console.log(
      "No answers with null step values found. Your data is up to date!"
    );
    return;
  }

  console.log(`Found ${answers.length} answers to update.`);

  const updatePromises = answers
    .map((answer) => {
      const step = questionToStepMap.get(answer.question_id);
      if (step) {
        return supabase
          .from("answers")
          .update({ step: step })
          .eq("id", answer.id);
      } else {
        console.warn(
          `Warning: No step found for question_id: ${answer.question_id}`
        );
        return null;
      }
    })
    .filter((p) => p !== null);

  if (updatePromises.length === 0) {
    console.log("No valid updates to perform.");
    return;
  }

  console.log(`Attempting to update ${updatePromises.length} records...`);

  const results = await Promise.all(updatePromises);

  const successfulUpdates = results.filter((res) => !res.error).length;
  const failedUpdates = results.filter((res) => res.error);

  console.log(`\nBackfill complete!`);
  console.log(`- ${successfulUpdates} answers updated successfully.`);

  if (failedUpdates.length > 0) {
    console.error(`- ${failedUpdates.length} updates failed.`);
    failedUpdates.forEach((fail) => {
      console.error(`  - Error: ${fail.error?.message}`);
    });
  }
}

// 3. Run the script
backfillStepNumbers().catch((err) => {
  console.error("An unexpected error occurred:", err);
});
