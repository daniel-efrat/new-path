BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_guidance_reports_user_id ON public.guidance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_reports_submission_id ON public.guidance_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_guidance_reports_input_hash ON public.guidance_reports(input_hash);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS trg_guidance_reports_set_updated_at ON public.guidance_reports;
CREATE TRIGGER trg_guidance_reports_set_updated_at
  BEFORE UPDATE ON public.guidance_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.guidance_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guidance reports select own" ON public.guidance_reports;
CREATE POLICY "Guidance reports select own" ON public.guidance_reports
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Guidance reports insert own" ON public.guidance_reports;
CREATE POLICY "Guidance reports insert own" ON public.guidance_reports
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Guidance reports update own" ON public.guidance_reports;
CREATE POLICY "Guidance reports update own" ON public.guidance_reports
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

COMMIT;

NOTIFY pgrst, 'reload schema';
