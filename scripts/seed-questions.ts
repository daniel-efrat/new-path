console.log('--- Script execution started ---');
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { ALL_QUESTIONS, Question, Trait } from '../lib/constants/questions';

// Load environment variables from .env.local
config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is missing.');
  console.error('Please make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedQuestions() {
  console.log('Starting to seed questions...');

  const formattedQuestions = ALL_QUESTIONS.map((q: Question | Trait) => {
    // Check if the object is a full Question (has options and a question property)
    if ('options' in q && 'question' in q) {
      return {
        id: q.id,
        question_text: q.question,
        options: q.options,
      };
    }
    // Otherwise, it's a Trait (has a text property)
    else if ('text' in q) {
      return {
        id: q.id,
        question_text: q.text,
        options: null,
      };
    }
    // Fallback for safety, though it shouldn't be reached with current data
    return null;
  }).filter(Boolean); // Filter out any nulls

  const { data, error } = await supabase.from('questions').upsert(formattedQuestions, {
    onConflict: 'id',
  });

  if (error) {
    console.error('Error seeding questions:', error.message);
    return;
  }

  console.log('Successfully seeded questions!');
  if (Array.isArray(data)) {
    console.log(`Upserted ${data.length} questions.`);
  }
}

seedQuestions();
