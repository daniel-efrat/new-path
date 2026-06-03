-- Fresh Supabase schema for new-path (self-hosted / Coolify)
-- Run this in Supabase Studio → SQL Editor on a NEW empty project.
-- Skips legacy migration 01 (conflicting questionnaires definition).

BEGIN;

-- ---------------------------------------------------------------------------
-- Core catalog
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  step_number INT NOT NULL CHECK (step_number >= 1 AND step_number <= 13),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text',
  answer_options JSONB,
  is_correct BOOLEAN,
  step INTEGER
);

CREATE TABLE IF NOT EXISTS public.questionnaire_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in-progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.questionnaire_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_value TEXT NOT NULL,
  is_correct BOOLEAN,
  step INTEGER,
  answered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Step progress & Holland (RIASEC)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_questionnaire_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  steps_progress JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.holland_questions (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  riasec_type CHAR(1) NOT NULL CHECK (riasec_type IN ('R', 'I', 'A', 'S', 'E', 'C'))
);

CREATE TABLE IF NOT EXISTS public.holland_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  riasec_vector JSONB NOT NULL,
  riasec_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Step 12 designation flow
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statement_index_int') THEN
    CREATE DOMAIN statement_index_int AS INT CHECK (VALUE BETWEEN 1 AND 50);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.designation_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_serial INT NOT NULL,
  occupation_title TEXT NOT NULL,
  occupation_description TEXT,
  statement_serial INT NOT NULL CHECK (statement_serial >= 1 AND statement_serial <= 50),
  statement TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_designation_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occupation_serial INT NOT NULL,
  rank INT NOT NULL CHECK (rank BETWEEN 1 AND 5),
  selected_statements statement_index_int[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT selected_statements_length CHECK (cardinality(selected_statements) BETWEEN 1 AND 2),
  UNIQUE (user_id, occupation_serial)
);

CREATE TABLE IF NOT EXISTS public.guidance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.questionnaire_submissions(id) ON DELETE SET NULL,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_snapshot JSONB NOT NULL,
  report_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, submission_id, input_hash)
);

CREATE TABLE IF NOT EXISTS public.diagnostic_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.questionnaire_submissions(id) ON DELETE SET NULL,
  guidance_report_id UUID REFERENCES public.guidance_reports(id) ON DELETE SET NULL,
  input_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_snapshot JSONB NOT NULL,
  report_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, submission_id, input_hash)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_answers_submission_id ON public.answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_questionnaire_id ON public.questions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.questionnaire_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_questionnaire_id ON public.questionnaire_submissions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_designation_statements_occupation_serial ON public.designation_statements(occupation_serial);
CREATE INDEX IF NOT EXISTS idx_udc_user_id ON public.user_designation_choices(user_id);
CREATE INDEX IF NOT EXISTS idx_holland_results_user_id ON public.holland_results(user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_reports_user_id ON public.guidance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_reports_submission_id ON public.guidance_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_guidance_reports_input_hash ON public.guidance_reports(input_hash);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_user_id ON public.diagnostic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_submission_id ON public.diagnostic_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_guidance_report_id ON public.diagnostic_reports(guidance_report_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_input_hash ON public.diagnostic_reports(input_hash);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS trg_submissions_set_updated_at ON public.questionnaire_submissions;
CREATE TRIGGER trg_submissions_set_updated_at
  BEFORE UPDATE ON public.questionnaire_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_udc_set_updated_at ON public.user_designation_choices;
CREATE TRIGGER trg_udc_set_updated_at
  BEFORE UPDATE ON public.user_designation_choices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_guidance_reports_set_updated_at ON public.guidance_reports;
CREATE TRIGGER trg_guidance_reports_set_updated_at
  BEFORE UPDATE ON public.guidance_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_diagnostic_reports_set_updated_at ON public.diagnostic_reports;
CREATE TRIGGER trg_diagnostic_reports_set_updated_at
  BEFORE UPDATE ON public.diagnostic_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_questionnaire_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holland_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holland_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designation_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_designation_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guidance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- public read for catalog
DROP POLICY IF EXISTS "Questionnaires are viewable by everyone" ON public.questionnaires;
CREATE POLICY "Questionnaires are viewable by everyone" ON public.questionnaires FOR SELECT USING (true);
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Holland questions are viewable by everyone" ON public.holland_questions;
CREATE POLICY "Holland questions are viewable by everyone" ON public.holland_questions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Designation statements are viewable by everyone" ON public.designation_statements;
CREATE POLICY "Designation statements are viewable by everyone" ON public.designation_statements FOR SELECT USING (true);

-- submissions
DROP POLICY IF EXISTS "Submissions are viewable by owner" ON public.questionnaire_submissions;
CREATE POLICY "Submissions are viewable by owner" ON public.questionnaire_submissions FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.questionnaire_submissions;
CREATE POLICY "Users can insert own submissions" ON public.questionnaire_submissions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can update own submissions" ON public.questionnaire_submissions;
CREATE POLICY "Users can update own submissions" ON public.questionnaire_submissions FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- answers (via submission ownership)
DROP POLICY IF EXISTS "Answers are viewable by submission owner" ON public.answers;
CREATE POLICY "Answers are viewable by submission owner" ON public.answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = (SELECT auth.uid())
  ));
DROP POLICY IF EXISTS "Users can insert answers for own submissions" ON public.answers;
CREATE POLICY "Users can insert answers for own submissions" ON public.answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = (SELECT auth.uid())
  ));
DROP POLICY IF EXISTS "Users can update answers for own submissions" ON public.answers;
CREATE POLICY "Users can update answers for own submissions" ON public.answers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.questionnaire_submissions s
    WHERE s.id = answers.submission_id AND s.user_id = (SELECT auth.uid())
  ));

-- progress
DROP POLICY IF EXISTS "Progress select own" ON public.user_questionnaire_progress;
CREATE POLICY "Progress select own" ON public.user_questionnaire_progress FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Progress insert own" ON public.user_questionnaire_progress;
CREATE POLICY "Progress insert own" ON public.user_questionnaire_progress FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Progress update own" ON public.user_questionnaire_progress;
CREATE POLICY "Progress update own" ON public.user_questionnaire_progress FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- holland results
DROP POLICY IF EXISTS "Holland results select own" ON public.holland_results;
CREATE POLICY "Holland results select own" ON public.holland_results FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Holland results insert own" ON public.holland_results;
CREATE POLICY "Holland results insert own" ON public.holland_results FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

-- designation choices
DROP POLICY IF EXISTS "udc_select_own" ON public.user_designation_choices;
CREATE POLICY udc_select_own ON public.user_designation_choices FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "udc_insert_own" ON public.user_designation_choices;
CREATE POLICY udc_insert_own ON public.user_designation_choices FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "udc_update_own" ON public.user_designation_choices;
CREATE POLICY udc_update_own ON public.user_designation_choices FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- guidance reports
DROP POLICY IF EXISTS "Guidance reports select own" ON public.guidance_reports;
CREATE POLICY "Guidance reports select own" ON public.guidance_reports FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Guidance reports insert own" ON public.guidance_reports;
CREATE POLICY "Guidance reports insert own" ON public.guidance_reports FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Guidance reports update own" ON public.guidance_reports;
CREATE POLICY "Guidance reports update own" ON public.guidance_reports FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- diagnostic reports
DROP POLICY IF EXISTS "Diagnostic reports select own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports select own" ON public.diagnostic_reports FOR SELECT USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Diagnostic reports insert own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports insert own" ON public.diagnostic_reports FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Diagnostic reports update own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports update own" ON public.diagnostic_reports FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Default questionnaire row (hardcoded in app)
-- ---------------------------------------------------------------------------

INSERT INTO public.questionnaires (id, title, description)
VALUES (
  'fbbee5e5-33c0-4b73-8514-0407633e05a2',
  'Career Diagnosis Questionnaire',
  'Main questionnaire for new-path'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Reload PostgREST schema cache (self-hosted)
NOTIFY pgrst, 'reload schema';
