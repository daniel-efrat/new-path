import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STEP11_QUESTIONS } from '@/lib/constants/questions';

const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
type RiasecCode = (typeof RIASEC_CODES)[number];
type RiasecScores = Record<RiasecCode, number>;
type HollandAnswer = { id: string; value: number };

function makeRiasecScores(): RiasecScores {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function isRiasecCode(value: unknown): value is RiasecCode {
  return RIASEC_CODES.includes(value as RiasecCode);
}

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

    const { answers }: { answers?: Array<{ id?: unknown; value?: unknown }> } =
      await request.json();

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid answers payload' }, { status: 400 });
    }

    const expectedQuestionIds = new Set(STEP11_QUESTIONS.map((question) => question.id));
    const seenQuestionIds = new Set<string>();
    const sanitizedAnswers: HollandAnswer[] = [];

    for (const answer of answers) {
      if (typeof answer.id !== 'string' || !expectedQuestionIds.has(answer.id)) {
        return NextResponse.json({ error: 'Unknown Holland question id' }, { status: 400 });
      }

      if (seenQuestionIds.has(answer.id)) {
        return NextResponse.json({ error: 'Duplicate Holland answer' }, { status: 400 });
      }

      const value = Number(answer.value);
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        return NextResponse.json({ error: 'Invalid Holland answer value' }, { status: 400 });
      }

      seenQuestionIds.add(answer.id);
      sanitizedAnswers.push({ id: answer.id, value });
    }

    if (sanitizedAnswers.length !== STEP11_QUESTIONS.length) {
      return NextResponse.json(
        { error: 'All Holland questions must be answered before submission' },
        { status: 400 }
      );
    }

    const idToType = new Map<string, RiasecCode>(
      STEP11_QUESTIONS.map((question) => [question.id, question.riasecType])
    );

    const { data: hollandMapRows, error: mapError } = await supabase
      .from('holland_questions')
      .select('id, riasec_type');

    if (mapError) {
      console.warn('Falling back to local RIASEC question map:', mapError);
    } else {
      for (const row of hollandMapRows || []) {
        if (isRiasecCode(row.riasec_type)) {
          idToType.set(row.id, row.riasec_type);
        }
      }
    }

    const maxByType = makeRiasecScores();
    for (const question of STEP11_QUESTIONS) {
      const type = idToType.get(question.id);
      if (type) {
        maxByType[type] += 5;
      }
    }

    const sumByType = makeRiasecScores();
    for (const a of sanitizedAnswers) {
      const type = idToType.get(a.id);
      if (!type) continue;

      const value = a.value;
      if (!Number.isFinite(value) || value < 1 || value > 5) continue;

      sumByType[type] += value;
    }

    const percentageByType = RIASEC_CODES.reduce((scores, code) => {
      scores[code] = maxByType[code]
        ? Math.round((sumByType[code] / maxByType[code]) * 100)
        : 0;
      return scores;
    }, makeRiasecScores());
    const rawRiasecVector = RIASEC_CODES.map((code) => sumByType[code]);
    const sorted_riasec = RIASEC_CODES
      .map((code) => ({
        code,
        score: percentageByType[code],
        rawScore: sumByType[code],
      }))
      .sort((a, b) => b.score - a.score || b.rawScore - a.rawScore);
    const riasec_code = sorted_riasec.map(({ code }) => code).join('');

    const { error: insertError } = await supabase.from('holland_results').insert({
      user_id: user.id,
      answers: sanitizedAnswers as any,
      riasec_vector: rawRiasecVector,
      riasec_code: riasec_code,
    });

    if (insertError) {
      console.error('Error inserting holland results:', insertError);
      throw new Error('Could not save RIASEC results.');
    }

    return NextResponse.json({ riasec_vector: percentageByType, riasec_code });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
