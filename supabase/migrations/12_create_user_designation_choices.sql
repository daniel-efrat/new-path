-- Create table to store Step 12 user choices (occupation ranking + 2 statements per occupation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statement_index_int') THEN
    CREATE DOMAIN statement_index_int AS INT CHECK (VALUE BETWEEN 1 AND 50);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_designation_choices') THEN
    CREATE TABLE user_designation_choices (
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
  END IF;
END $$;

-- Indexes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_udc_user_id') THEN
    CREATE INDEX idx_udc_user_id ON user_designation_choices(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_udc_rank') THEN
    CREATE INDEX idx_udc_rank ON user_designation_choices(rank);
  END IF;
END $$;

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at_udc()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_udc_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_udc_set_updated_at
    BEFORE UPDATE ON user_designation_choices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_udc();
  END IF;
END $$;

-- RLS
DO $$
BEGIN
  EXECUTE 'ALTER TABLE user_designation_choices ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
END $$;

DO $$
BEGIN
  -- Select own rows
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'udc_select_own') THEN
    CREATE POLICY udc_select_own ON user_designation_choices
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Insert own rows
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'udc_insert_own') THEN
    CREATE POLICY udc_insert_own ON user_designation_choices
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update own rows
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'udc_update_own') THEN
    CREATE POLICY udc_update_own ON user_designation_choices
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
