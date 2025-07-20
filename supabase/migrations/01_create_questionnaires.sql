-- Create enum for questionnaire status
CREATE TYPE questionnaire_status AS ENUM ('draft', 'submitted', 'archived');

-- Create questionnaires table
CREATE TABLE questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status questionnaire_status DEFAULT 'draft',
  step_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  submitted_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  
  -- Add indexes
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own questionnaires"
  ON questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires"
  ON questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft questionnaires"
  ON questionnaires FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
