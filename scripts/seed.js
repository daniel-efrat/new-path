// A simple Node.js script to seed the database, avoiding ts-node issues.
console.log('--- Starting JavaScript Seeding Script ---');

const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const path = require('path');
const { ALL_QUESTIONS } = require('../lib/constants/questions');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Loading environment variables from: ${envPath}`);
config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Supabase URL or Service Role Key is missing.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

console.log('Supabase credentials loaded successfully.');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function seedDatabase() {
  console.log('Seeding questions...');

  const formattedQuestions = ALL_QUESTIONS.map(q => {
    const isStep1 = 'text' in q;
    return {
      id: q.id,
      question_text: isStep1 ? q.text : q.question,
      options: 'options' in q ? q.options : null,
    };
  });

  try {
    const { data, error } = await supabase.from('questions').upsert(formattedQuestions, {
      onConflict: 'id',
    });

    if (error) {
      console.error('Error seeding questions:', error.message);
      if (error.details) console.error('Details:', error.details);
      process.exit(1);
    }

    console.log('Successfully seeded questions!');
    if (Array.isArray(data)) {
      console.log(`Upserted ${data.length} questions.`);
    }
  } catch (err) {
    console.error('An unexpected error occurred during seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
