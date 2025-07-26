-- Final Corrected Migration Script

BEGIN;

-- 1. Create questionnaire_submissions table
CREATE TABLE IF NOT EXISTS public.questionnaire_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in-progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.questionnaire_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_questionnaire_id ON public.questionnaire_submissions(questionnaire_id);

-- 3. Enable RLS on the new table
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Drop old RLS policies on answers table that will be replaced
DROP POLICY IF EXISTS "Answers are private" ON public.answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON public.answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON public.answers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.answers;

-- 5. Drop the old trigger and function
DROP TRIGGER IF EXISTS set_user_id_on_answer ON public.answers;
DROP FUNCTION IF EXISTS public.set_user_id_on_answer();

-- 6. Modify the answers table
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS submission_id UUID REFERENCES public.questionnaire_submissions(id) ON DELETE CASCADE;

-- Drop old user_id column and its unique constraint
ALTER TABLE public.answers DROP CONSTRAINT IF EXISTS answers_user_id_question_id_key;
ALTER TABLE public.answers DROP COLUMN IF EXISTS user_id;

-- Add new unique constraint on submission_id and question_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'answers_submission_id_question_id_key' AND conrelid = 'public.answers'::regclass
    ) THEN
        ALTER TABLE public.answers ADD CONSTRAINT answers_submission_id_question_id_key UNIQUE (submission_id, question_id);
    END IF;
END;
$$;

-- 7. Create RLS policies for questionnaire_submissions
CREATE POLICY "Submissions are viewable by the user who created them"
ON public.questionnaire_submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
ON public.questionnaire_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
ON public.questionnaire_submissions FOR UPDATE USING (auth.uid() = user_id);

-- 8. Create new RLS policies for answers based on submission ownership
CREATE POLICY "Answers are viewable by the submission owner"
ON public.answers FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Users can insert answers for their own submissions"
ON public.answers FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = auth.uid()
));

CREATE POLICY "Users can update answers for their own submissions"
ON public.answers FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = auth.uid()
));

COMMIT;