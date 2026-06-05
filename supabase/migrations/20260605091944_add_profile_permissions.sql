ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS permissions TEXT;

UPDATE public.profiles
SET permissions = 'User'
WHERE permissions IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN permissions SET DEFAULT 'User',
  ALTER COLUMN permissions SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_permissions_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_permissions_check
      CHECK (permissions IN ('Admin', 'Advisor', 'User'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.prevent_client_profile_permission_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.permissions := 'User';
    ELSIF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
      RAISE EXCEPTION 'Profile permissions cannot be changed from the client';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS trg_prevent_client_profile_permission_changes ON public.profiles;
CREATE TRIGGER trg_prevent_client_profile_permission_changes
  BEFORE INSERT OR UPDATE OF permissions ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_client_profile_permission_changes();
