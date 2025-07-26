// pages/api/submit-answers.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Answer } from '../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { answers }: { answers: Answer[] } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'Invalid answers payload' });
  }

  try {
    // 1. Create a new submission record
    const { data: submission, error: submissionError } = await supabase
      .from('questionnaire_submissions')
      .insert({ user_id: session.user.id })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // 2. Prepare answers for insertion
    const answersToInsert = answers.map(answer => ({
      submission_id: submission.id,
      question_id: answer.question_id,
      answer_value: answer.answer_value,
    }));

    // 3. Insert all answers
    const { error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert);

    if (answersError) throw answersError;

    return res.status(200).json({ message: 'Answers submitted successfully', submission_id: submission.id });

  } catch (error: any) {
    console.error('Error submitting answers:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
