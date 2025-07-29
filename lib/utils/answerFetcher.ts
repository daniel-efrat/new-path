import supabase from '@/lib/supabase';
import type { AnswerState } from '@/lib/types/questionnaire';

const QUESTIONNAIRE_ID = 'fbbee5e5-33c0-4b73-8514-0407633e05a2';

export interface FetchedAnswer {
  question_id: string;
  answer_value: string;
  created_at: string;
}

/**
 * Fetches answers for a specific step from the Supabase answers table
 * @param stepQuestionIds Array of question IDs for the specific step
 * @returns Record of question_id -> AnswerState
 */
export async function fetchStepAnswers(stepQuestionIds: string[]): Promise<Record<string, AnswerState>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated, cannot fetch answers');
      return {};
    }

    // Get the latest submission for this user and questionnaire
    const { data: submissionData, error: submissionError } = await supabase
      .from('questionnaire_submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('questionnaire_id', QUESTIONNAIRE_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (submissionError) {
      if (submissionError.code === 'PGRST116') {
        // No submission found
        return {};
      }
      throw submissionError;
    }

    // Fetch answers for this submission that match the step's question IDs
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('question_id, answer_value, created_at')
      .eq('submission_id', submissionData.id)
      .in('question_id', stepQuestionIds);

    if (answersError) {
      throw answersError;
    }

    // Convert to the expected format
    const answerMap: Record<string, AnswerState> = {};
    
    // Debug logging
    console.log('fetchStepAnswers - Raw answers from DB:', answers);
    
    if (answers) {
      answers.forEach((answer: FetchedAnswer) => {
        let parsedValue: any;
        try {
          parsedValue = JSON.parse(answer.answer_value);
        } catch (e) {
          parsedValue = answer.answer_value;
        }
        
        console.log(`fetchStepAnswers - Question ${answer.question_id}: raw="${answer.answer_value}", parsed=`, parsedValue);
        
        answerMap[answer.question_id] = {
          value: parsedValue,
          timestamp: new Date(answer.created_at)
        };
      });
    }
    
    console.log('fetchStepAnswers - Final answerMap:', answerMap);

    return answerMap;
  } catch (error) {
    console.error('Error fetching step answers:', error);
    return {};
  }
}

/**
 * Fetches answers for Step 1 (traits selection)
 * @param step1QuestionIds Array of Step 1 question IDs
 * @returns Record of question_id -> AnswerState
 */
export async function fetchStep1Answers(step1QuestionIds: string[]): Promise<Record<string, AnswerState>> {
  return fetchStepAnswers(step1QuestionIds);
}

/**
 * Fetches answers for Step 2 (quiz questions)
 * @param step2QuestionIds Array of Step 2 question IDs
 * @returns Record of question_id -> AnswerState
 */
export async function fetchStep2Answers(step2QuestionIds: string[]): Promise<Record<string, AnswerState>> {
  return fetchStepAnswers(step2QuestionIds);
}

/**
 * Fetches answers for Step 5 (logical reasoning questions)
 * @param step5QuestionIds Array of Step 5 question IDs
 * @returns Record of question_id -> AnswerState
 */
export async function fetchStep5Answers(step5QuestionIds: string[]): Promise<Record<string, AnswerState>> {
  return fetchStepAnswers(step5QuestionIds);
}
