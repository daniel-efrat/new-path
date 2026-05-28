BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_user_id ON public.diagnostic_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_submission_id ON public.diagnostic_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_guidance_report_id ON public.diagnostic_reports(guidance_report_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_input_hash ON public.diagnostic_reports(input_hash);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS trg_diagnostic_reports_set_updated_at ON public.diagnostic_reports;
CREATE TRIGGER trg_diagnostic_reports_set_updated_at
  BEFORE UPDATE ON public.diagnostic_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Diagnostic reports select own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports select own" ON public.diagnostic_reports
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Diagnostic reports insert own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports insert own" ON public.diagnostic_reports
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Diagnostic reports update own" ON public.diagnostic_reports;
CREATE POLICY "Diagnostic reports update own" ON public.diagnostic_reports
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

COMMIT;

NOTIFY pgrst, 'reload schema';
