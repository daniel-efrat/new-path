-- Create normalized schema for questionnaire answers
-- Skip tables if they already exist
DO $$
BEGIN
  -- Profiles table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    CREATE TABLE profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Questionnaires table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questionnaires') THEN
    CREATE TABLE questionnaires (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;

  -- Questions table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questions') THEN
    CREATE TABLE questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE,
      step_number INT NOT NULL CHECK (step_number >= 1 AND step_number <= 11),
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'text',
      answer_options JSONB
    );
  END IF;

  -- Answers table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'answers') THEN
    CREATE TABLE answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
      answer TEXT NOT NULL,
      answered_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (user_id, question_id) -- One answer per question per user
    );
  END IF;
END $$;

-- Add indexes for performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_answers_user_id') THEN
    CREATE INDEX idx_answers_user_id ON answers(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_answers_question_id') THEN
    CREATE INDEX idx_answers_question_id ON answers(question_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_questions_questionnaire_id') THEN
    CREATE INDEX idx_questions_questionnaire_id ON questions(questionnaire_id);
  END IF;
END $$;

-- Enable Row Level Security (idempotent operations)
DO $$
BEGIN
  EXECUTE 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE questions ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE answers ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
  -- RLS might already be enabled, continue
END $$;

-- Create RLS policies (only if they don't exist)
DO $$
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles are viewable by users who created them') THEN
    CREATE POLICY "Profiles are viewable by users who created them" 
    ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Questionnaires policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Questionnaires are viewable by everyone') THEN
    CREATE POLICY "Questionnaires are viewable by everyone"
    ON questionnaires FOR SELECT USING (true);
  END IF;

  -- Questions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Questions are viewable by everyone') THEN
    CREATE POLICY "Questions are viewable by everyone"
    ON questions FOR SELECT USING (true);
  END IF;

  -- Answers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Answers are private') THEN
    CREATE POLICY "Answers are private"
    ON answers FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own answers') THEN
    CREATE POLICY "Users can insert their own answers"
    ON answers FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own answers') THEN
    CREATE POLICY "Users can update their own answers"
    ON answers FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
