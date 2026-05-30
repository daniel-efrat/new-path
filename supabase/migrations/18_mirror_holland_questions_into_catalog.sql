-- Ensure Holland answers can be saved through the normalized answers table.
-- The answers.question_id foreign key points at public.questions, while the
-- Holland scoring map lives in public.holland_questions.

INSERT INTO public.questions (
  id,
  step_number,
  question_text,
  question_type,
  answer_options
)
SELECT
  id,
  11,
  text,
  'holland',
  NULL::jsonb
FROM public.holland_questions
ON CONFLICT (id) DO UPDATE
SET step_number = EXCLUDED.step_number,
    question_text = EXCLUDED.question_text,
    question_type = EXCLUDED.question_type,
    answer_options = EXCLUDED.answer_options;

UPDATE public.questions
SET question_text = 'יכולת הכלה'
WHERE id = 'e7f8a9b0-c1d2-bcde-f012-567890123456'::uuid
  AND question_text = 'יכולת הקשבה';
