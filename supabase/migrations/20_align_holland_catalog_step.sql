-- Keep Holland catalog rows aligned with the current questionnaire order.
-- The app now exposes Holland as dashboard/questionnaire step 10; answers still
-- depend on these ids existing in public.questions for the foreign key.

INSERT INTO public.questions (
  id,
  step_number,
  question_text,
  question_type,
  answer_options
)
SELECT
  id,
  10,
  text,
  'holland',
  NULL::jsonb
FROM public.holland_questions
ON CONFLICT (id) DO UPDATE
SET step_number = EXCLUDED.step_number,
    question_text = EXCLUDED.question_text,
    question_type = EXCLUDED.question_type,
    answer_options = EXCLUDED.answer_options;
