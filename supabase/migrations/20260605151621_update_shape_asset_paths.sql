UPDATE public.questions
SET
  question_text = replace(question_text, '/shapes/', '/assets/questionnaire/shapes/'),
  answer_options = replace(
    answer_options::text,
    '/shapes/',
    '/assets/questionnaire/shapes/'
  )::jsonb
WHERE
  step_number = 7
  AND (
    question_text LIKE '/shapes/%'
    OR answer_options::text LIKE '%"/shapes/%'
  );
