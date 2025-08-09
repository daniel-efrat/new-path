/*
 Generates an UPSERT SQL for Supabase 'questions' table from lib/constants/questions.ts
 Steps included: 1-8 and 11. Steps 9-10 are intentionally excluded.
 Output: SQL printed to stdout.
*/

import path from 'path';
import { fileURLToPath } from 'url';

// Import source arrays
import * as Q from '../lib/constants/questions';

type Row = {
  id: string;
  step_number: number;
  question_text: string;
  question_type: string;
  answer_options: any | null;
};

function normQuestionArray(
  items: any[],
  stepNumber: number,
  kind: 'trait' | 'anchor' | 'question' | 'shape' | 'holland'
): Row[] {
  return (items || []).map((it: any) => {
    const id = it.id;
    let question_text: string;
    let answer_options: any | null = null;

    if (kind === 'trait' || kind === 'anchor' || kind === 'holland') {
      question_text = it.text;
      answer_options = null; // no options
    } else if (kind === 'question' || kind === 'shape') {
      question_text = it.question; // for shape this is image path; OK
      if (Array.isArray(it.options)) {
        answer_options = {
          options: it.options,
          correct_option: typeof it.correct_option === 'number' ? it.correct_option : null,
        };
      } else {
        answer_options = null;
      }
    } else {
      // fallback
      question_text = it.text ?? it.question ?? '';
    }

    return {
      id,
      step_number: stepNumber,
      question_text,
      question_type: kind,
      answer_options,
    } as Row;
  });
}

function exists<T = any>(v: T | undefined): v is T { return typeof v !== 'undefined'; }

// Collect rows per step: some arrays may be missing
const rows: Row[] = [];

// Step 1 – Trait
if (exists((Q as any).STEP1_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP1_QUESTIONS, 1, 'trait'));
}
// Step 2 – Question
if (exists((Q as any).STEP2_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP2_QUESTIONS, 2, 'question'));
}
// Step 3 – Question
if (exists((Q as any).STEP3_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP3_QUESTIONS, 3, 'question'));
}
// Step 4 – Anchor
if (exists((Q as any).STEP4_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP4_QUESTIONS, 4, 'anchor'));
}
// Step 5 – Question/Logical
if (exists((Q as any).STEP5_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP5_QUESTIONS, 5, 'question'));
}
// Step 6 – Question
if (exists((Q as any).STEP6_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP6_QUESTIONS, 6, 'question'));
}
// Step 7 – Shape
if (exists((Q as any).STEP7_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP7_QUESTIONS, 7, 'shape'));
}
// Step 8 – Question
if (exists((Q as any).STEP8_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP8_QUESTIONS, 8, 'question'));
}
// Step 11 – Holland
if (exists((Q as any).STEP11_QUESTIONS)) {
  rows.push(...normQuestionArray((Q as any).STEP11_QUESTIONS, 11, 'holland'));
}

if (rows.length === 0) {
  console.error('No rows found to export.');
  process.exit(1);
}

// Build SQL
function sqlLiteral(v: any): string {
  if (v === null || typeof v === 'undefined') return 'NULL';
  if (typeof v === 'string') {
    return "'" + v.replace(/'/g, "''") + "'";
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  // JSON
  return "'" + JSON.stringify(v).replace(/'/g, "''") + "'::jsonb";
}

const values = rows
  .map(
    (r) => `(${sqlLiteral(r.id)}::uuid, ${r.step_number}, ${sqlLiteral(r.question_text)}, ${sqlLiteral(
      r.question_type
    )}, ${sqlLiteral(r.answer_options)})`
  )
  .join(',\n');

const sql = `-- UPSERT questions for steps 1-8 and 11 (preserve 9-10)\nINSERT INTO public.questions (id, step_number, question_text, question_type, answer_options)\nVALUES\n${values}\nON CONFLICT (id) DO UPDATE\nSET step_number = EXCLUDED.step_number,\n    question_text = EXCLUDED.question_text,\n    question_type = EXCLUDED.question_type,\n    answer_options = EXCLUDED.answer_options;`;

process.stdout.write(sql + '\n');
