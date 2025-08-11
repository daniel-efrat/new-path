import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Answer } from '@/lib/types';

export async function POST(request: NextRequest) {
  // Support both cookie-based auth (auth-helpers) and bearer token auth
  const authHeader = request.headers.get('authorization');

  const supabase = authHeader && authHeader.toLowerCase().startsWith('bearer ')
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false },
        }
      )
    : createRouteHandlerClient({ cookies });

  try {
    // Validate user from either cookies or bearer token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { answers }: { answers: Answer[] } = await request.json();

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid answers payload' }, { status: 400 });
    }

    const { data: hollandMapRows, error: mapError } = await supabase
      .from('holland_questions')
      .select('id, riasec_type');

    if (mapError) {
      console.error('Error fetching holland questions:', mapError);
      throw new Error('Could not fetch RIASEC question map.');
    }

    const idToType = new Map<string, 'R' | 'I' | 'A' | 'S' | 'E' | 'C'>();
    for (const row of hollandMapRows || []) {
      idToType.set(row.id, row.riasec_type as 'R' | 'I' | 'A' | 'S' | 'E' | 'C');
    }

    const sumByType: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const a of answers) {
      const type = idToType.get(a.id);
      if (!type) continue;

      const value = Number(a.value);
      if (isNaN(value)) continue;

      sumByType[type] += value;
    }

    const riasec_vector = [sumByType.R, sumByType.I, sumByType.A, sumByType.S, sumByType.E, sumByType.C];
    const sorted_riasec = Object.entries(sumByType).sort(([, a], [, b]) => b - a);
    const riasec_code = sorted_riasec.map(([key]) => key).join('');

    const { error: insertError } = await supabase.from('holland_results').insert({
      user_id: user.id,
      answers: answers as any,
      riasec_vector: riasec_vector,
      riasec_code: riasec_code,
    });

    if (insertError) {
      console.error('Error inserting holland results:', insertError);
      throw new Error('Could not save RIASEC results.');
    }

    return NextResponse.json({ riasec_vector: sumByType, riasec_code });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
