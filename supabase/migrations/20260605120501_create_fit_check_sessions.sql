BEGIN;

CREATE TABLE IF NOT EXISTS public.fit_check_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'בדיקה חדשה',
  scope_mode TEXT NOT NULL DEFAULT 'all' CHECK (scope_mode IN ('all', 'manual')),
  selected_user_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  selected_users_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fit_check_sessions_staff_updated_at
  ON public.fit_check_sessions(staff_user_id, updated_at DESC);

ALTER TABLE public.fit_check_sessions ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_fit_check_sessions_set_updated_at ON public.fit_check_sessions;
CREATE TRIGGER trg_fit_check_sessions_set_updated_at
  BEFORE UPDATE ON public.fit_check_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "Fit check sessions are service-role only" ON public.fit_check_sessions;
CREATE POLICY "Fit check sessions are service-role only"
  ON public.fit_check_sessions
  FOR ALL
  USING (false)
  WITH CHECK (false);

COMMIT;

NOTIFY pgrst, 'reload schema';
