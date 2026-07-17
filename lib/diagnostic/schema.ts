import type {
  DiagnosticNarrative,
  DiagnosticNarrativeResponse,
} from "@/lib/diagnostic/types";

export const diagnosticNarrativeJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description:
        "A personal, elaborate Hebrew synthesis of questionnaire 1 and questionnaire 2, 2-3 short paragraphs. Prioritize the user's stated preferences, values, career anchors, and chosen domains over Holland results.",
    },
    profileInsights: {
      type: "object",
      additionalProperties: false,
      properties: {
        strengths: {
          type: "array",
          minItems: 2,
          maxItems: 6,
          items: {
            type: "string",
            description:
              "A rich, personal sentence that explains how this strength may show up in learning, work, decisions, or collaboration.",
          },
        },
        developmentAreas: {
          type: "array",
          minItems: 1,
          maxItems: 4,
          items: {
            type: "string",
            description:
              "A practical, non-judgmental sentence that explains what to watch, test, or support before choosing a path.",
          },
        },
        workStyle: {
          type: "string",
          description:
            "A longer, warm Hebrew paragraph describing the user's likely work style, learning rhythm, motivation, decision-making, overload patterns, and supports that could help them succeed.",
        },
      },
      required: ["strengths", "developmentAreas", "workStyle"],
    },
    occupationNarratives: {
      type: "array",
      minItems: 1,
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          occupationId: {
            type: "string",
            description:
              "Must exactly match one of the occupation ids supplied in the prompt.",
          },
          shortWhy: {
            type: "string",
            description:
              "One warm Hebrew sentence explaining the match, led by the user's preferences and values before test labels.",
          },
          fitReasons: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
              type: "string",
              description:
                "A specific explanation that connects stated preferences, core values, career anchors, abilities, and personality to this occupation.",
            },
          },
          possibleTensions: {
            type: "array",
            minItems: 1,
            maxItems: 3,
            items: {
              type: "string",
              description:
                "A careful, practical point to verify before choosing this route; not a disqualifying statement.",
            },
          },
        },
        required: [
          "occupationId",
          "shortWhy",
          "fitReasons",
          "possibleTensions",
        ],
      },
    },
    nextSteps: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: { type: "string" },
    },
  },
  required: [
    "summary",
    "profileInsights",
    "occupationNarratives",
    "nextSteps",
  ],
} as const;

export function coerceDiagnosticNarrativeResponse(
  value: unknown,
  candidateIds: string[]
): DiagnosticNarrativeResponse {
  if (!value || typeof value !== "object") {
    throw new Error("Diagnostic narrative is not an object.");
  }

  const raw = value as Partial<DiagnosticNarrativeResponse>;
  if (typeof raw.summary !== "string") {
    throw new Error("Diagnostic narrative is missing summary.");
  }

  const validIds = new Set(candidateIds);
  const occupationNarratives = Array.isArray(raw.occupationNarratives)
    ? raw.occupationNarratives
        .map((item) => coerceOccupationNarrative(item, validIds))
        .filter((item): item is DiagnosticNarrative => item !== null)
        .slice(0, 8)
    : [];

  return {
    summary: raw.summary,
    profileInsights: {
      strengths: sanitizeStringArray(raw.profileInsights?.strengths, 6),
      developmentAreas: sanitizeStringArray(
        raw.profileInsights?.developmentAreas,
        4
      ),
      workStyle:
        typeof raw.profileInsights?.workStyle === "string"
          ? raw.profileInsights.workStyle
          : "",
    },
    occupationNarratives,
    nextSteps: sanitizeStringArray(raw.nextSteps, 6),
  };
}

function coerceOccupationNarrative(
  value: unknown,
  validIds: Set<string>
): DiagnosticNarrative | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<DiagnosticNarrative>;
  if (typeof raw.occupationId !== "string" || !validIds.has(raw.occupationId)) {
    return null;
  }

  return {
    occupationId: raw.occupationId,
    shortWhy: typeof raw.shortWhy === "string" ? raw.shortWhy : "",
    fitReasons: sanitizeStringArray(raw.fitReasons, 4),
    possibleTensions: sanitizeStringArray(raw.possibleTensions, 3),
  };
}

function sanitizeStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}
