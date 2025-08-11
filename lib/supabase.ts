import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Questionnaire Helpers
export const getQuestions = async (questionnaireId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('questionnaire_id', questionnaireId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return data;
};

export const submitAnswer = async (
  userId: string,
  questionId: string,
  answer: string
) => {
  const { data, error } = await supabase
    .from('answers')
    .upsert(
      { 
        user_id: userId,
        question_id: questionId,
        answer
      },
      { onConflict: 'user_id,question_id' }
    )
    .select();

  if (error) throw error;
  return data;
};

export const getUserAnswers = async (userId: string, questionnaireId: string) => {
  // First get all question IDs for this questionnaire
  const { data: questions } = await supabase
    .from('questions')
    .select('id')
    .eq('questionnaire_id', questionnaireId);

  if (!questions?.length) return [];

  const questionIds = questions.map(q => q.id);

  // Then get answers for these questions
  const { data, error } = await supabase
    .from('answers')
    .select(`
      answer,
      answered_at,
      questions:question_id (
        step_number,
        question_text
      )
    `)
    .eq('user_id', userId)
    .in('question_id', questionIds)
    .order('questions.step_number', { ascending: true });

  if (error) throw error;
  return data;
};

export const getDefaultQuestionnaire = async () => {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*')
    .limit(1);

  if (error) throw error;
  return data?.[0];
};

export default supabase;
