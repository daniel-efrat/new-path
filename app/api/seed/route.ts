import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ALL_QUESTIONS } from '@/lib/constants/questions';

// IMPORTANT: This route should only be accessible in a development environment.
// We're adding a check to prevent it from being run in production.
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development.' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Supabase environment variables are not set.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    console.log('--- Seeding database via API route ---');

    const formattedQuestions = ALL_QUESTIONS.map(q => {
      const isStep1 = 'text' in q;
      return {
        id: q.id,
        question_text: isStep1 ? q.text : q.question,
        options: 'options' in q ? q.options : null,
      };
    });

    const { data, error } = await supabase.from('questions').upsert(formattedQuestions, {
      onConflict: 'id',
    });

    if (error) {
      console.error('API Seeding Error:', error);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }

    const count = Array.isArray(data) ? data.length : 0;
    console.log(`Successfully upserted ${count} questions.`);
    return NextResponse.json({ message: 'Database seeded successfully!', count });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Unexpected API Seeding Error:', errorMessage);
    return NextResponse.json({ error: 'An unexpected error occurred during seeding.', details: errorMessage }, { status: 500 });
  }
}
