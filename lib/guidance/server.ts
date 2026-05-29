import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RIASEC_MAP,
  STEP1_QUESTIONS,
  STEP4_QUESTIONS,
  STEP11_QUESTIONS,
} from "@/lib/constants/questions";
import {
  coerceGuidanceReport,
  guidanceReportJsonSchema,
} from "@/lib/guidance/schema";
import type { GuidanceReport, RiasecCode } from "@/lib/guidance/types";

const QUESTIONNAIRE_ID = "fbbee5e5-33c0-4b73-8514-0407633e05a2";
const RIASEC_CODES = ["R", "I", "A", "S", "E", "C"] as const;

type Provider = "gemini" | "openrouter";

interface AnswerRow {
  question_id: string;
  answer_value: string;
  step: number | null;
}

interface ChoiceRow {
  occupation_serial: number;
  rank: number;
  selected_statements: number[] | string | null;
  updated_at: string;
}

interface DesignationStatementRow {
  occupation_serial: number;
  occupation_title: string;
  occupation_description: string | null;
  statement_serial: number;
  statement: string;
}

interface HollandResultRow {
  riasec_vector: unknown;
  riasec_code: string;
}

interface GuidanceInterestInput {
  code: RiasecCode;
  name: string;
  rawScore: number;
  score: number;
  description: string;
}

export interface GuidanceInput {
  submissionId: string;
  submissionCreatedAt: string;
  selectedTraits: string[];
  careerAnchors: Array<{
    id: string;
    text: string;
    score: number;
  }>;
  holland: {
    code: string;
    areas: GuidanceInterestInput[];
    topAreas: GuidanceInterestInput[];
  };
  designationDomains: Array<{
    rank: number;
    occupationSerial: number;
    title: string;
    description: string | null;
    selectedStatements: Array<{
      serial: number;
      text: string;
    }>;
  }>;
  completedAt: string;
}

export interface GuidanceGenerationResult {
  report: GuidanceReport;
  provider: Provider;
  model: string;
}

export async function loadGuidanceInput(
  supabase: SupabaseClient,
  userId: string
): Promise<GuidanceInput> {
  const { data: submission, error: submissionError } = await supabase
    .from("questionnaire_submissions")
    .select("id, created_at")
    .eq("user_id", userId)
    .eq("questionnaire_id", QUESTIONNAIRE_ID)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (submissionError) {
    throw new Error(`Could not load questionnaire submission: ${submissionError.message}`);
  }

  if (!submission) {
    throw new Error("No questionnaire submission was found for this user.");
  }

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, answer_value, step")
    .eq("submission_id", submission.id);

  if (answersError) {
    throw new Error(`Could not load questionnaire answers: ${answersError.message}`);
  }

  const answersById = new Map(
    ((answers || []) as AnswerRow[]).map((answer) => [
      answer.question_id,
      answer,
    ])
  );

  const selectedTraits = STEP1_QUESTIONS.filter((question) =>
    isTruthyAnswer(answersById.get(question.id)?.answer_value)
  )
    .map((question) => question.text)
    .slice(0, 10);

  const careerAnchors = STEP4_QUESTIONS.map((question) => {
    const score = toNumber(answersById.get(question.id)?.answer_value);
    if (score === null) return null;
    return {
      id: question.id,
      text: question.text,
      score,
    };
  })
    .filter((anchor): anchor is NonNullable<typeof anchor> => anchor !== null)
    .sort((a, b) => b.score - a.score);

  const holland = await loadHollandData(supabase, userId, answersById);
  const designationDomains = await loadDesignationDomains(supabase, userId);

  if (
    selectedTraits.length === 0 &&
    careerAnchors.length === 0 &&
    holland.areas.every((area) => area.rawScore === 0) &&
    designationDomains.length === 0
  ) {
    throw new Error("Questionnaire 1 answers are not ready for guidance yet.");
  }

  return {
    submissionId: submission.id,
    submissionCreatedAt: submission.created_at,
    selectedTraits,
    careerAnchors,
    holland,
    designationDomains,
    completedAt: submission.created_at,
  };
}

export function hashGuidanceInput(input: GuidanceInput): string {
  return createHash("sha256")
    .update(JSON.stringify(sortJson(input)))
    .digest("hex");
}

export async function generateGuidanceReport(
  input: GuidanceInput
): Promise<GuidanceGenerationResult> {
  const { systemPrompt, userPrompt } = buildGuidancePrompt(input);
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  try {
    const report = await generateWithGemini(systemPrompt, userPrompt, geminiModel);
    return { report, provider: "gemini", model: geminiModel };
  } catch (geminiError) {
    console.warn("Gemini guidance generation failed; trying OpenRouter.", {
      message:
        geminiError instanceof Error ? geminiError.message : String(geminiError),
    });
  }

  const openRouterModel =
    process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-pro";
  const report = await generateWithOpenRouter(
    systemPrompt,
    userPrompt,
    openRouterModel
  );
  return { report, provider: "openrouter", model: openRouterModel };
}

async function loadHollandData(
  supabase: SupabaseClient,
  userId: string,
  answersById: Map<string, AnswerRow>
) {
  const rawScores = makeEmptyRiasecRecord();
  let hasAnswerScores = false;

  for (const question of STEP11_QUESTIONS) {
    const score = toNumber(answersById.get(question.id)?.answer_value);
    if (score === null) continue;
    rawScores[question.riasecType] += score;
    hasAnswerScores = true;
  }

  if (!hasAnswerScores) {
    const { data, error } = await supabase
      .from("holland_results")
      .select("riasec_vector, riasec_code")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not load Holland result: ${error.message}`);
    }

    if (data) {
      Object.assign(rawScores, parseRiasecVector(data as HollandResultRow));
    }
  }

  const maxByCode = STEP11_QUESTIONS.reduce((acc, question) => {
    acc[question.riasecType] += 5;
    return acc;
  }, makeEmptyRiasecRecord());

  const areas = RIASEC_CODES.map((code) => {
    const rawScore = rawScores[code];
    return {
      code,
      name: RIASEC_MAP[code].name,
      rawScore,
      score: maxByCode[code]
        ? Math.round((rawScore / maxByCode[code]) * 100)
        : 0,
      description: RIASEC_MAP[code].description,
    };
  }).sort((a, b) => b.rawScore - a.rawScore);

  return {
    code: areas.map((area) => area.code).join(""),
    areas,
    topAreas: areas.slice(0, 3),
  };
}

async function loadDesignationDomains(
  supabase: SupabaseClient,
  userId: string
): Promise<GuidanceInput["designationDomains"]> {
  const { data: choices, error: choicesError } = await supabase
    .from("user_designation_choices")
    .select("occupation_serial, rank, selected_statements, updated_at")
    .eq("user_id", userId)
    .order("rank", { ascending: true });

  if (choicesError) {
    throw new Error(`Could not load designation choices: ${choicesError.message}`);
  }

  const normalizedChoices = ((choices || []) as ChoiceRow[])
    .map((choice) => ({
      ...choice,
      selected_statements: parseNumberArray(choice.selected_statements),
    }))
    .filter((choice) => choice.rank >= 1 && choice.rank <= 5)
    .slice(0, 5);

  const serials = normalizedChoices.map((choice) => choice.occupation_serial);
  if (serials.length === 0) return [];

  const { data: statements, error: statementsError } = await supabase
    .from("designation_statements")
    .select(
      "occupation_serial, occupation_title, occupation_description, statement_serial, statement"
    )
    .in("occupation_serial", serials)
    .order("occupation_serial", { ascending: true })
    .order("statement_serial", { ascending: true });

  if (statementsError) {
    throw new Error(
      `Could not load designation statements: ${statementsError.message}`
    );
  }

  const statementsBySerial = new Map<number, DesignationStatementRow[]>();
  for (const row of (statements || []) as DesignationStatementRow[]) {
    const list = statementsBySerial.get(row.occupation_serial) || [];
    list.push(row);
    statementsBySerial.set(row.occupation_serial, list);
  }

  return normalizedChoices.map((choice) => {
    const rows = statementsBySerial.get(choice.occupation_serial) || [];
    const selectedStatements = choice.selected_statements
      .map((statementSerial) => {
        const row = rows.find((item) => item.statement_serial === statementSerial);
        if (!row) return null;
        return {
          serial: statementSerial,
          text: row.statement,
        };
      })
      .filter(
        (statement): statement is { serial: number; text: string } =>
          statement !== null
      );

    return {
      rank: choice.rank,
      occupationSerial: choice.occupation_serial,
      title: rows[0]?.occupation_title || `תחום ${choice.occupation_serial}`,
      description: rows[0]?.occupation_description || null,
      selectedStatements,
    };
  });
}

function buildGuidancePrompt(input: GuidanceInput) {
  const compactInput = {
    ...input,
    careerAnchors: input.careerAnchors.slice(0, 10),
    holland: {
      code: input.holland.code,
      topAreas: input.holland.topAreas,
      areas: input.holland.areas.map(({ code, name, rawScore, score }) => ({
        code,
        name,
        rawScore,
        score,
      })),
    },
  };

  const systemPrompt = [
    "אתה יועץ תעסוקתי עדין, מדויק וזהיר למערכת אבחון קריירה בעברית.",
    "כתוב למשתמש/ת מפת כיוון ראשונית וקצרה לאחר שלב א׳ בלבד.",
    "אסור להציג אחוזי התאמה למקצועות, אבחון סופי, ציוני יכולת, או המלצות למקצועות ספציפיים.",
    "מותר להציע כיוונים רחבים לבדיקה בשלב ב׳, ולבסס אותם רק על הנתונים שסופקו.",
    "הפלט חייב להיות JSON תקין בלבד, בלי Markdown, לפי הסכמה.",
  ].join("\n");

  const userPrompt = [
    "נתוני שלב א׳ ליצירת דוח JSON:",
    JSON.stringify(compactInput, null, 2),
    "הפק JSON בעברית בלבד. שמור על ניסוחים קצרים, אמפתיים ולא נחרצים.",
    "ב-initialDirections השתמש בכיוונים רחבים כמו חינוכי/הדרכתי, יזמי/ניהולי, יצירתי/תוכן, מחקרי/אנליטי, שירותי/ייעוצי או ביצועי/טכני לפי הנתונים.",
  ].join("\n\n");

  return { systemPrompt, userPrompt };
}

async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<GuidanceReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const modelPath = model.startsWith("models/") ? model : `models/${model}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 8192,
          responseFormat: {
            text: {
              mimeType: "APPLICATION_JSON",
              schema: guidanceReportJsonSchema,
            },
          },
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message || `Gemini request failed with ${response.status}.`
    );
  }

  return parseReportPayload(extractGeminiText(payload), payload);
}

async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<GuidanceReport> {
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENROUTER_KEY ||
    process.env.OPRNROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "New Path Guidance",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "guidance_report",
          strict: true,
          schema: guidanceReportJsonSchema,
        },
      },
      plugins: [{ id: "response-healing" }],
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `OpenRouter request failed with ${response.status}.`
    );
  }

  return parseReportPayload(extractOpenRouterText(payload), payload);
}

function parseReportPayload(text: string, payload: unknown): GuidanceReport {
  if (payload && typeof payload === "object" && "title" in payload) {
    return coerceGuidanceReport(payload);
  }

  const parsed = parseJsonObject(text);
  return coerceGuidanceReport(parsed);
}

function extractGeminiText(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
  }

  if (typeof payload?.text === "string") {
    return payload.text;
  }

  return "";
}

function extractOpenRouterText(payload: any): string {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("");
  }
  return "";
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("LLM response did not include a JSON object.");
  }

  return JSON.parse(withoutFence.slice(start, end + 1));
}

function parseRiasecVector(row: HollandResultRow): Record<RiasecCode, number> {
  const vector = row.riasec_vector;
  const result = makeEmptyRiasecRecord();

  if (Array.isArray(vector)) {
    RIASEC_CODES.forEach((code, index) => {
      result[code] = toNumber(vector[index]) || 0;
    });
    return result;
  }

  if (vector && typeof vector === "object") {
    RIASEC_CODES.forEach((code) => {
      result[code] = toNumber((vector as Record<string, unknown>)[code]) || 0;
    });
  }

  return result;
}

function parseNumberArray(value: ChoiceRow["selected_statements"]): number[] {
  if (Array.isArray(value)) {
    return value.map(Number).filter(Number.isFinite);
  }

  if (typeof value === "string") {
    return value
      .replace(/[{}]/g, "")
      .split(",")
      .map(Number)
      .filter(Number.isFinite);
  }

  return [];
}

function isTruthyAnswer(value: string | undefined): boolean {
  return value === "true" || value === "1" || value === "yes";
}

function toNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function makeEmptyRiasecRecord(): Record<RiasecCode, number> {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortJson((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}
