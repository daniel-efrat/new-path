import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  STEP10_QUESTIONS,
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP9_QUESTIONS,
} from "@/lib/constants/questions";
import { OCCUPATION_FACTS, type OccupationFact } from "@/lib/diagnostic/facts";
import {
  coerceDiagnosticNarrativeResponse,
  diagnosticNarrativeJsonSchema,
} from "@/lib/diagnostic/schema";
import type {
  AbilityKey,
  DiagnosticInput,
  DiagnosticNarrativeResponse,
  DiagnosticOccupation,
  DiagnosticProfileInsights,
  DiagnosticProvider,
  DiagnosticReport,
  PersonalityKey,
  ScoreSummary,
} from "@/lib/diagnostic/types";
import {
  hashGuidanceInput,
  loadGuidanceInput,
  type GuidanceInput,
} from "@/lib/guidance/server";
import type { GuidanceReport } from "@/lib/guidance/types";

const CORE_VALUES_ANSWER_ID = "9d79036e-bf0c-4d65-b06f-f5f4b5f01302";

const ABILITY_LABELS: Record<AbilityKey, string> = {
  hebrew: "שפה עברית",
  english: "שפה אנגלית",
  logic: "חשיבה לוגית",
  math: "חשיבה כמותית",
  visual: "חשיבה חזותית",
  computer: "ידע בסיסי במחשב",
  attention: "קשב",
  filtering: "סינון מידע",
  workingMemory: "זיכרון עבודה",
};

const PERSONALITY_LABELS: Record<PersonalityKey, string> = {
  organization: "סדר והתמדה",
  social: "חברתיות ועבודת צוות",
  resilience: "יציבות וגמישות",
  curiosity: "למידה וחדשנות",
  empathy: "אמפתיה ושיתוף פעולה",
  initiative: "יוזמה ועצמאות",
};

interface AnswerRow {
  question_id: string;
  answer_value: string | null;
  is_correct: boolean | null;
  step: number | null;
}

interface GuidanceReportRow {
  id: string;
  report_json: GuidanceReport | null;
}

export interface DiagnosticGenerationResult {
  report: DiagnosticReport;
  provider: DiagnosticProvider;
  model: string;
}

export async function loadDiagnosticInput(
  supabase: SupabaseClient,
  userId: string
): Promise<DiagnosticInput> {
  const guidanceInput = await loadGuidanceInput(supabase, userId);
  const guidanceReportRow = await loadLatestGuidanceReport(
    supabase,
    userId,
    guidanceInput
  );

  const { data: answers, error: answersError } = await supabase
    .from("answers")
    .select("question_id, answer_value, is_correct, step")
    .eq("submission_id", guidanceInput.submissionId);

  if (answersError) {
    throw new Error(`Could not load questionnaire answers: ${answersError.message}`);
  }

  const answersById = new Map(
    ((answers || []) as AnswerRow[]).map((answer) => [
      answer.question_id,
      answer,
    ])
  );

  const abilities = buildAbilityScores(answersById);
  const personality = buildPersonalityScores(answersById);
  const coreValues = parseCoreValues(
    answersById.get(CORE_VALUES_ANSWER_ID)?.answer_value
  );
  const questionnaire1 = {
    selectedTraits: guidanceInput.selectedTraits,
    careerAnchors: guidanceInput.careerAnchors.map((anchor) => ({
      text: anchor.text,
      score: anchor.score,
    })),
    holland: {
      code: guidanceInput.holland.code,
      areas: guidanceInput.holland.areas.map(({ code, name, score }) => ({
        code,
        name,
        score,
      })),
      topAreas: guidanceInput.holland.topAreas.map(({ code, name, score }) => ({
        code,
        name,
        score,
      })),
    },
    designationDomains: guidanceInput.designationDomains.map((domain) => ({
      rank: domain.rank,
      occupationSerial: domain.occupationSerial,
      title: domain.title,
      selectedStatements: domain.selectedStatements.map(
        (statement) => statement.text
      ),
    })),
  };

  const candidateOccupations = scoreOccupationFacts({
    questionnaire1,
    abilities,
    personality,
    coreValues,
  });

  return {
    submissionId: guidanceInput.submissionId,
    submissionCreatedAt: guidanceInput.submissionCreatedAt,
    guidanceReportId: guidanceReportRow?.id || null,
    guidanceReport: guidanceReportRow?.report_json || null,
    questionnaire1,
    questionnaire2: {
      abilities,
      personality,
      coreValues,
    },
    candidateOccupations,
    completedAt: guidanceInput.completedAt,
  };
}

export function hashDiagnosticInput(input: DiagnosticInput): string {
  return createHash("sha256")
    .update(JSON.stringify(sortJson(input)))
    .digest("hex");
}

export async function generateDiagnosticReport(
  input: DiagnosticInput
): Promise<DiagnosticGenerationResult> {
  const baseReport = buildDeterministicReport(input);
  const { systemPrompt, userPrompt } = buildDiagnosticPrompt(input, baseReport);
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  try {
    const narrative = await generateWithGemini(
      systemPrompt,
      userPrompt,
      geminiModel,
      input.candidateOccupations.map((occupation) => occupation.id)
    );
    return {
      report: mergeNarrative(baseReport, narrative),
      provider: "gemini",
      model: geminiModel,
    };
  } catch (geminiError) {
    console.warn("Gemini diagnostic generation failed; trying OpenRouter.", {
      message:
        geminiError instanceof Error ? geminiError.message : String(geminiError),
    });
  }

  const openRouterModel =
    process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4-pro";

  try {
    const narrative = await generateWithOpenRouter(
      systemPrompt,
      userPrompt,
      openRouterModel,
      input.candidateOccupations.map((occupation) => occupation.id)
    );
    return {
      report: mergeNarrative(baseReport, narrative),
      provider: "openrouter",
      model: openRouterModel,
    };
  } catch (openRouterError) {
    console.warn("OpenRouter diagnostic generation failed; using fallback.", {
      message:
        openRouterError instanceof Error
          ? openRouterError.message
          : String(openRouterError),
    });
  }

  return {
    report: baseReport,
    provider: "deterministic",
    model: "deterministic-fallback",
  };
}

async function loadLatestGuidanceReport(
  supabase: SupabaseClient,
  userId: string,
  guidanceInput: GuidanceInput
): Promise<GuidanceReportRow | null> {
  const inputHash = hashGuidanceInput(guidanceInput);
  const { data, error } = await supabase
    .from("guidance_reports")
    .select("id, report_json")
    .eq("user_id", userId)
    .eq("submission_id", guidanceInput.submissionId)
    .eq("input_hash", inputHash)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load guidance report: ${error.message}`);
  }

  return (data as GuidanceReportRow | null) || null;
}

function buildAbilityScores(
  answersById: Map<string, AnswerRow>
): Record<AbilityKey, ScoreSummary> {
  const attentionScores = buildAttentionScores(answersById);

  return {
    hebrew: scoreQuestionSet(
      "hebrew",
      STEP2_QUESTIONS,
      answersById,
      "index"
    ),
    english: scoreQuestionSet(
      "english",
      STEP3_QUESTIONS,
      answersById,
      "text"
    ),
    logic: scoreQuestionSet("logic", STEP5_QUESTIONS, answersById, "index"),
    math: scoreQuestionSet("math", STEP6_QUESTIONS, answersById, "index"),
    visual: scoreQuestionSet("visual", STEP7_QUESTIONS, answersById, "index"),
    computer: scoreQuestionSet(
      "computer",
      STEP8_QUESTIONS,
      answersById,
      "index"
    ),
    attention: attentionScores.attention,
    filtering: attentionScores.filtering,
    workingMemory: attentionScores.workingMemory,
  };
}

function scoreQuestionSet(
  key: AbilityKey,
  questions: Array<{ id: string; options: string[]; correct_option: number }>,
  answersById: Map<string, AnswerRow>,
  mode: "index" | "text"
): ScoreSummary {
  let answered = 0;
  let correct = 0;

  for (const question of questions) {
    const answer = answersById.get(question.id);
    const selectedIndex = parseSelectedIndex(
      answer?.answer_value,
      question.options,
      mode
    );

    if (selectedIndex === null) continue;
    answered += 1;
    if (selectedIndex === question.correct_option || answer?.is_correct === true) {
      correct += 1;
    }
  }

  return {
    label: ABILITY_LABELS[key],
    score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    answered,
    total: questions.length,
  };
}

function buildAttentionScores(
  answersById: Map<string, AnswerRow>
): Pick<
  Record<AbilityKey, ScoreSummary>,
  "attention" | "filtering" | "workingMemory"
> {
  const byCategory: Record<
    "קשב" | "סינון מידע" | "זיכרון עבודה",
    { correct: number; answered: number; total: number }
  > = {
    קשב: { correct: 0, answered: 0, total: 0 },
    "סינון מידע": { correct: 0, answered: 0, total: 0 },
    "זיכרון עבודה": { correct: 0, answered: 0, total: 0 },
  };

  for (const question of STEP9_QUESTIONS) {
    const row = byCategory[question.category];
    const answer = answersById.get(question.id);
    const selectedIndex = parseSelectedIndex(
      answer?.answer_value,
      question.options,
      "index",
      true
    );

    row.total += 1;
    if (selectedIndex !== null) row.answered += 1;
    if (selectedIndex === question.correct_option || answer?.is_correct === true) {
      row.correct += 1;
    }
  }

  return {
    attention: categoryScore("attention", byCategory["קשב"]),
    filtering: categoryScore("filtering", byCategory["סינון מידע"]),
    workingMemory: categoryScore("workingMemory", byCategory["זיכרון עבודה"]),
  };
}

function categoryScore(
  key: AbilityKey,
  row: { correct: number; answered: number; total: number }
): ScoreSummary {
  return {
    label: ABILITY_LABELS[key],
    score: row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0,
    answered: row.answered,
    total: row.total,
  };
}

function buildPersonalityScores(
  answersById: Map<string, AnswerRow>
): Record<PersonalityKey, ScoreSummary> {
  const grouped = STEP10_QUESTIONS.reduce<
    Record<PersonalityKey, { totalScore: number; answered: number; total: number }>
  >((acc, question) => {
    const key = question.category as PersonalityKey;
    const row = acc[key] || { totalScore: 0, answered: 0, total: 0 };
    const value = parseScaleValue(answersById.get(question.id)?.answer_value);

    row.total += 1;
    if (value !== null) {
      row.answered += 1;
      row.totalScore += question.reverse ? 6 - value : value;
    }

    acc[key] = row;
    return acc;
  }, {} as Record<PersonalityKey, { totalScore: number; answered: number; total: number }>);

  return (Object.keys(PERSONALITY_LABELS) as PersonalityKey[]).reduce(
    (acc, key) => {
      const row = grouped[key] || { totalScore: 0, answered: 0, total: 0 };
      const average = row.answered > 0 ? row.totalScore / row.answered : 0;
      acc[key] = {
        label: PERSONALITY_LABELS[key],
        score:
          row.answered > 0 ? Math.round(((average - 1) / 4) * 100) : 0,
        answered: row.answered,
        total: row.total,
      };
      return acc;
    },
    {} as Record<PersonalityKey, ScoreSummary>
  );
}

function scoreOccupationFacts({
  questionnaire1,
  abilities,
  personality,
  coreValues,
}: Pick<DiagnosticInput, "questionnaire1"> & {
  abilities: Record<AbilityKey, ScoreSummary>;
  personality: Record<PersonalityKey, ScoreSummary>;
  coreValues: DiagnosticInput["questionnaire2"]["coreValues"];
}): DiagnosticOccupation[] {
  const riasecScores = new Map(
    questionnaire1.holland.areas.map((area) => [area.code, area.score])
  );
  const domainRanks = new Map(
    questionnaire1.designationDomains.map((domain) => [
      domain.occupationSerial,
      domain.rank,
    ])
  );
  const priorityText = [
    ...questionnaire1.selectedTraits,
    ...questionnaire1.careerAnchors.slice(0, 8).map((anchor) => anchor.text),
    ...questionnaire1.designationDomains.flatMap((domain) =>
      domain.selectedStatements
    ),
    ...coreValues.flatMap((value) => [value.name, value.missing]),
  ]
    .join(" ")
    .toLowerCase();

  return OCCUPATION_FACTS.map((fact) => {
    const interests = average(
      fact.riasecCodes.map((code) => riasecScores.get(code) ?? 50)
    );
    const abilitiesScore = weightedAverage(
      fact.abilityWeights,
      abilities,
      50
    );
    const personalityScore = weightedAverage(
      fact.personalityWeights,
      personality,
      50
    );
    const priorities = scorePriorities(fact.priorityKeywords, priorityText);
    const domain = scoreDomain(fact, domainRanks);
    const matchPercent = clamp(
      Math.round(
        interests * 0.25 +
          abilitiesScore * 0.25 +
          personalityScore * 0.18 +
          priorities * 0.17 +
          domain * 0.15
      ),
      1,
      98
    );

    return {
      id: fact.id,
      title: fact.title,
      matchPercent,
      shortWhy: buildFallbackShortWhy(fact, {
        interests,
        abilities: abilitiesScore,
        personality: personalityScore,
      }),
      description: fact.description,
      fitReasons: buildFallbackFitReasons(fact, {
        questionnaire1,
        abilities,
        personality,
      }),
      possibleTensions: buildFallbackTensions({
        abilities,
        personality,
      }),
      requiredTraining: fact.requiredTraining,
      trainingPlaces: fact.trainingPlaces,
      averageSalary: fact.averageSalary,
      avodataUrl: fact.avodataUrl,
      scoreBreakdown: {
        interests: Math.round(interests),
        abilities: Math.round(abilitiesScore),
        personality: Math.round(personalityScore),
        priorities: Math.round(priorities),
        domain: Math.round(domain),
      },
    };
  })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, 8);
}

function buildDeterministicReport(input: DiagnosticInput): DiagnosticReport {
  const abilityScores = Object.values(input.questionnaire2.abilities);
  const personalityScores = Object.values(input.questionnaire2.personality);

  return {
    title: "דו״ח אבחוני תעסוקתי",
    generatedAt: new Date().toISOString(),
    disclaimer:
      "הדו״ח משלב נתוני שאלונים עם ניתוח AI, ואינו מחליף ייעוץ קריירה אישי או אימות נתוני שכר עדכניים.",
    summary: buildFallbackSummary(input),
    questionnaire1: {
      guidanceTitle: input.guidanceReport?.title || null,
      guidanceSummary: input.guidanceReport?.coreSummary || null,
      topRiasec: input.questionnaire1.holland.topAreas,
    },
    abilityScores,
    personalityScores,
    profileInsights: buildFallbackProfileInsights(abilityScores, personalityScores),
    topOccupations: input.candidateOccupations,
    nextSteps: [
      "לפתוח את המקצועות בעלי ההתאמה הגבוהה ולבדוק את נימוקי ההתאמה מול תחושת הבטן שלך.",
      "להשוות בין דרישות ההכשרה לבין הזמן, התקציב ורמת המחויבות שמתאימים לך כרגע.",
      "להיכנס לקישורי עבודאטה כדי לבדוק מידע עדכני על שכר, ביקוש ומסלולי לימוד.",
    ],
  };
}

function buildDiagnosticPrompt(input: DiagnosticInput, baseReport: DiagnosticReport) {
  const compactInput = {
    questionnaire1: {
      selectedTraits: input.questionnaire1.selectedTraits.slice(0, 10),
      careerAnchors: input.questionnaire1.careerAnchors.slice(0, 8),
      holland: input.questionnaire1.holland,
      designationDomains: input.questionnaire1.designationDomains,
      preliminaryGuidance: input.guidanceReport
        ? {
            title: input.guidanceReport.title,
            coreSummary: input.guidanceReport.coreSummary,
            initialDirections: input.guidanceReport.initialDirections,
          }
        : null,
    },
    questionnaire2: input.questionnaire2,
    candidateOccupations: baseReport.topOccupations.map((occupation) => ({
      id: occupation.id,
      title: occupation.title,
      matchPercent: occupation.matchPercent,
      description: occupation.description,
      scoreBreakdown: occupation.scoreBreakdown,
      requiredTraining: occupation.requiredTraining,
      averageSalary: occupation.averageSalary,
      avodataUrl: occupation.avodataUrl,
    })),
  };

  const systemPrompt = [
    "אתה יועץ תעסוקתי מקצועי וזהיר למערכת אבחון קריירה בעברית.",
    "עליך לכתוב ניתוח אבחוני מפורט אחרי שאלון 2, על בסיס הנתונים והמקצועות המועמדים בלבד.",
    "אל תמציא מקצועות, אחוזי התאמה, שכר, מוסדות הכשרה או קישורים. כל אלה נקבעים במערכת.",
    "כתוב בעברית, בטון ברור, אנושי ולא נחרץ מדי. הימנע מאבחון קליני.",
    "הפלט חייב להיות JSON תקין בלבד, בלי Markdown, לפי הסכמה.",
  ].join("\n");

  const userPrompt = [
    "נתונים ליצירת נרטיב אבחוני JSON:",
    JSON.stringify(compactInput, null, 2),
    "הפק JSON בעברית בלבד.",
    "occupationNarratives חייב לכלול רק occupationId מתוך רשימת candidateOccupations.",
    "shortWhy ו-fitReasons צריכים לנמק התאמה באמצעות שילוב שאלון 1, ציוני יכולת, אישיות וערכי ליבה.",
    "possibleTensions צריך להיות זהיר ומעשי: מה לבדוק לפני בחירת מסלול, לא סיבה לפסילה.",
  ].join("\n\n");

  return { systemPrompt, userPrompt };
}

async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  candidateIds: string[]
): Promise<DiagnosticNarrativeResponse> {
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
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseFormat: {
            text: {
              mimeType: "APPLICATION_JSON",
              schema: diagnosticNarrativeJsonSchema,
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

  return parseNarrativePayload(extractGeminiText(payload), payload, candidateIds);
}

async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  candidateIds: string[]
): Promise<DiagnosticNarrativeResponse> {
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
      "X-Title": "New Path Diagnostic",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "diagnostic_narrative",
          strict: true,
          schema: diagnosticNarrativeJsonSchema,
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

  return parseNarrativePayload(
    extractOpenRouterText(payload),
    payload,
    candidateIds
  );
}

function mergeNarrative(
  report: DiagnosticReport,
  narrative: DiagnosticNarrativeResponse
): DiagnosticReport {
  const narrativesById = new Map(
    narrative.occupationNarratives.map((item) => [item.occupationId, item])
  );

  return {
    ...report,
    summary: narrative.summary || report.summary,
    profileInsights: {
      strengths:
        narrative.profileInsights.strengths.length > 0
          ? narrative.profileInsights.strengths
          : report.profileInsights.strengths,
      developmentAreas:
        narrative.profileInsights.developmentAreas.length > 0
          ? narrative.profileInsights.developmentAreas
          : report.profileInsights.developmentAreas,
      workStyle:
        narrative.profileInsights.workStyle || report.profileInsights.workStyle,
    },
    topOccupations: report.topOccupations.map((occupation) => {
      const narrativeItem = narrativesById.get(occupation.id);
      if (!narrativeItem) return occupation;
      return {
        ...occupation,
        shortWhy: narrativeItem.shortWhy || occupation.shortWhy,
        fitReasons:
          narrativeItem.fitReasons.length > 0
            ? narrativeItem.fitReasons
            : occupation.fitReasons,
        possibleTensions:
          narrativeItem.possibleTensions.length > 0
            ? narrativeItem.possibleTensions
            : occupation.possibleTensions,
      };
    }),
    nextSteps: narrative.nextSteps.length > 0 ? narrative.nextSteps : report.nextSteps,
  };
}

function parseNarrativePayload(
  text: string,
  payload: unknown,
  candidateIds: string[]
): DiagnosticNarrativeResponse {
  if (payload && typeof payload === "object" && "summary" in payload) {
    return coerceDiagnosticNarrativeResponse(payload, candidateIds);
  }

  const parsed = parseJsonObject(text);
  return coerceDiagnosticNarrativeResponse(parsed, candidateIds);
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

function parseSelectedIndex(
  value: unknown,
  options: string[],
  mode: "index" | "text",
  includeSkipped = false
): number | null {
  if (value === undefined || value === null || value === "" || value === "null") {
    return null;
  }

  const numeric = typeof value === "string" ? Number(value) : value;
  if (
    typeof numeric === "number" &&
    Number.isInteger(numeric) &&
    (includeSkipped ? numeric >= -1 : numeric >= 0)
  ) {
    return numeric;
  }

  if (mode === "text" && typeof value === "string") {
    const index = options.indexOf(value);
    return index >= 0 ? index : null;
  }

  return null;
}

function parseScaleValue(value: unknown): number | null {
  if (value === undefined || value === null || value === "" || value === "null") {
    return null;
  }
  const numeric = typeof value === "string" ? Number(value) : value;
  if (typeof numeric !== "number") return null;
  if (!Number.isInteger(numeric)) return null;
  return numeric >= 1 && numeric <= 5 ? numeric : null;
}

function parseCoreValues(
  value: unknown
): DiagnosticInput["questionnaire2"]["coreValues"] {
  if (typeof value !== "string" || value === "null" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => ({
        name: typeof row?.name === "string" ? row.name : "",
        score:
          typeof row?.score === "number" && Number.isFinite(row.score)
            ? row.score
            : null,
        missing: typeof row?.missing === "string" ? row.missing : "",
      }))
      .filter((row) => row.name)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function weightedAverage<T extends string>(
  weights: Partial<Record<T, number>>,
  scores: Record<T, ScoreSummary>,
  emptyFallback: number
): number {
  let weightedTotal = 0;
  let weightTotal = 0;

  for (const [key, weight] of Object.entries(weights) as Array<[T, number]>) {
    if (!weight) continue;
    const score = scores[key];
    weightedTotal += (score?.answered ? score.score : emptyFallback) * weight;
    weightTotal += weight;
  }

  return weightTotal > 0 ? weightedTotal / weightTotal : emptyFallback;
}

function scoreDomain(
  fact: OccupationFact,
  domainRanks: Map<number, number>
): number {
  if (domainRanks.size === 0) return 50;

  const ranks = fact.domainSerials
    .map((serial) => domainRanks.get(serial))
    .filter((rank): rank is number => typeof rank === "number");

  if (ranks.length === 0) return 38;
  const bestRank = Math.min(...ranks);
  return clamp(112 - bestRank * 12, 52, 100);
}

function scorePriorities(keywords: string[], priorityText: string): number {
  if (!priorityText.trim()) return 50;
  const hits = keywords.filter((keyword) =>
    priorityText.includes(keyword.toLowerCase())
  ).length;
  return clamp(42 + hits * 14, 42, 100);
}

function buildFallbackShortWhy(
  fact: OccupationFact,
  scores: { interests: number; abilities: number; personality: number }
) {
  const strongest = [
    { label: "תחומי העניין", score: scores.interests },
    { label: "מבחני היכולת", score: scores.abilities },
    { label: "סגנון העבודה", score: scores.personality },
  ].sort((a, b) => b.score - a.score)[0];

  return `ההתאמה ל${fact.title} נשענת בעיקר על ${strongest.label} ועל חיבור לתוכן המקצועי של התחום.`;
}

function buildFallbackFitReasons(
  fact: OccupationFact,
  input: {
    questionnaire1: DiagnosticInput["questionnaire1"];
    abilities: Record<AbilityKey, ScoreSummary>;
    personality: Record<PersonalityKey, ScoreSummary>;
  }
): string[] {
  const topRiasec = input.questionnaire1.holland.topAreas
    .slice(0, 2)
    .map((area) => area.name)
    .join(" ו");
  const topAbilities = topAnsweredScores(Object.values(input.abilities), 2)
    .map((score) => score.label)
    .join(" ו");
  const topPersonality = topAnsweredScores(Object.values(input.personality), 2)
    .map((score) => score.label)
    .join(" ו");

  return [
    topRiasec
      ? `נטיות העניין הבולטות (${topRiasec}) מתחברות לאופי העבודה ב${fact.title}.`
      : "תחומי העניין מספקים נקודת פתיחה לבדיקה של המקצוע.",
    topAbilities
      ? `במבחני היכולת בולטים רכיבים כמו ${topAbilities}, שיכולים לתמוך בהשתלבות בתחום.`
      : "ציוני היכולת עדיין חלקיים ולכן כדאי לבחון את ההתאמה בזהירות.",
    topPersonality
      ? `פרופיל האישיות מצביע על ${topPersonality}, מאפיינים שרלוונטיים לסביבת העבודה בתחום.`
      : "נתוני האישיות עדיין חלקיים ולכן הנימוק נשען יותר על תחומי העניין.",
  ];
}

function buildFallbackTensions({
  abilities,
  personality,
}: {
  abilities: Record<AbilityKey, ScoreSummary>;
  personality: Record<PersonalityKey, ScoreSummary>;
}): string[] {
  const lowAbility = lowestAnsweredScores(Object.values(abilities), 1)[0];
  const lowPersonality = lowestAnsweredScores(Object.values(personality), 1)[0];
  const tensions: string[] = [];

  if (lowAbility) {
    tensions.push(
      `כדאי לבדוק האם דרישות התחום ב${lowAbility.label} מתאימות לך או דורשות חיזוק.`
    );
  }

  if (lowPersonality) {
    tensions.push(
      `רצוי לבחון סביבת עבודה שתומכת ב${lowPersonality.label} ולא מעמיסה דווקא שם.`
    );
  }

  return tensions.length > 0
    ? tensions
    : ["כדאי לוודא שהיומיום המקצועי בפועל תואם את הציפיות ולא רק את שם המקצוע."];
}

function buildFallbackSummary(input: DiagnosticInput): string {
  const topRiasec = input.questionnaire1.holland.topAreas
    .slice(0, 2)
    .map((area) => area.name)
    .join(" ו");
  const topAbilities = topAnsweredScores(
    Object.values(input.questionnaire2.abilities),
    2
  )
    .map((score) => score.label)
    .join(" ו");
  const topPersonality = topAnsweredScores(
    Object.values(input.questionnaire2.personality),
    2
  )
    .map((score) => score.label)
    .join(" ו");

  return [
    topRiasec
      ? `בשאלון 1 בלטו נטיות לכיוון ${topRiasec}.`
      : "שאלון 1 מצביע על כמה כיוונים רחבים שעדיין דורשים בדיקה.",
    topAbilities
      ? `בשאלון 2 נראית נקודת חוזק יחסית ב${topAbilities}.`
      : "נתוני היכולת בשאלון 2 עדיין חלקיים.",
    topPersonality
      ? `בסגנון העבודה בולטים ${topPersonality}, ולכן כדאי לחפש סביבת עבודה שמאפשרת להם לבוא לידי ביטוי.`
      : "פרופיל האישיות עדיין חלקי, ולכן מומלץ לקרוא את ההמלצות בזהירות.",
  ].join("\n");
}

function buildFallbackProfileInsights(
  abilities: ScoreSummary[],
  personality: ScoreSummary[]
): DiagnosticProfileInsights {
  const strengths = [
    ...topAnsweredScores(abilities, 3),
    ...topAnsweredScores(personality, 3),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((score) => `${score.label} (${score.score}/100)`);
  const developmentAreas = [
    ...lowestAnsweredScores(abilities, 2),
    ...lowestAnsweredScores(personality, 2),
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((score) => `${score.label} (${score.score}/100)`);
  const topWorkStyle = topAnsweredScores(personality, 2)
    .map((score) => score.label)
    .join(" ו");

  return {
    strengths:
      strengths.length > 0
        ? strengths
        : ["עדיין אין מספיק נתונים מלאים לזיהוי חוזקות יציב."],
    developmentAreas:
      developmentAreas.length > 0
        ? developmentAreas
        : ["כדאי להשלים את כלל חלקי שאלון 2 כדי לזהות מוקדי חיזוק."],
    workStyle: topWorkStyle
      ? `סגנון העבודה שנראה כרגע נשען על ${topWorkStyle}, עם צורך בסביבה שמייצרת בהירות ומשוב מעשי.`
      : "סגנון העבודה יתבהר לאחר השלמת כלל חלקי השאלון.",
  };
}

function topAnsweredScores(scores: ScoreSummary[], limit: number): ScoreSummary[] {
  return scores
    .filter((score) => score.answered > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function lowestAnsweredScores(
  scores: ScoreSummary[],
  limit: number
): ScoreSummary[] {
  return scores
    .filter((score) => score.answered > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

function average(values: number[]): number {
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
