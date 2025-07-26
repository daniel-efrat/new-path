-- This migration is intended to force a schema cache refresh in Supabase.
COMMENT ON TABLE answers IS 'Refreshing schema cache to resolve RLS issues.';
