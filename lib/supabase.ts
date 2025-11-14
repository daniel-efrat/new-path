import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL');
if (!supabaseKey) throw new Error('Missing SUPABASE_ANON_KEY');

import config from './config';

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

// Step 12 helpers
export interface DesignationChoiceRow {
  user_id: string;
  occupation_serial: number;
  rank: number; // 1-5
  selected_statements: number[]; // exactly 2 ints between 1-50
}

export const saveDesignationChoices = async (rows: DesignationChoiceRow[]) => {
  if (!rows?.length) return [] as any[];
  const { data, error } = await supabase
    .from('user_designation_choices')
    .upsert(rows, { onConflict: 'user_id,occupation_serial', ignoreDuplicates: false })
    .select();
  if (error) throw error;
  return data as any[];
};
