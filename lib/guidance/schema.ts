import type { GuidanceReport } from "@/lib/guidance/types";

export const guidanceReportJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: {
      type: "string",
      description: "A short Hebrew title for the preliminary direction snapshot.",
    },
    generatedAt: {
      type: "string",
      description: "ISO date-time when the report was generated.",
    },
    disclaimer: {
      type: "string",
      description:
        "One concise Hebrew sentence clarifying that this is preliminary and not a final diagnosis.",
    },
    coreSummary: {
      type: "string",
      description:
        "A warm Hebrew synthesis of the user's emerging career direction in 3-5 short lines.",
    },
    interestAreas: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          code: { type: "string", enum: ["R", "I", "A", "S", "E", "C"] },
          name: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          summary: {
            type: "string",
            description: "One short Hebrew sentence about this interest area.",
          },
        },
        required: ["code", "name", "score", "summary"],
      },
    },
    careerPriorities: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "A concise Hebrew label such as עצמאות, משמעות, מומחיות.",
          },
          evidence: {
            type: "string",
            description:
              "One Hebrew sentence grounded in the questionnaire answers.",
          },
        },
        required: ["title", "evidence"],
      },
    },
    designationDomains: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          rank: { type: "integer", minimum: 1, maximum: 5 },
          title: { type: "string" },
          selectedStatements: {
            type: "array",
            minItems: 0,
            maxItems: 2,
            items: { type: "string" },
          },
          summary: {
            type: "string",
            description:
              "One short Hebrew sentence connecting this domain to the user.",
          },
        },
        required: ["rank", "title", "selectedStatements", "summary"],
      },
    },
    initialDirections: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description:
              "A broad Hebrew direction, not a specific profession, e.g. כיוון חינוכי / הדרכתי.",
          },
          whyItMayFit: {
            type: "string",
            description: "Why this broad direction may fit the user.",
          },
          whatToCheckNext: {
            type: "string",
            description: "What the user should check in questionnaire 2.",
          },
          possibleTension: {
            type: "string",
            description:
              "A careful caveat or question to keep in mind, not a negative diagnosis.",
          },
        },
        required: [
          "title",
          "whyItMayFit",
          "whatToCheckNext",
          "possibleTension",
        ],
      },
    },
    nextStep: {
      type: "string",
      description:
        "A short Hebrew call to action inviting the user to continue to questionnaire 2.",
    },
  },
  required: [
    "title",
    "generatedAt",
    "disclaimer",
    "coreSummary",
    "interestAreas",
    "careerPriorities",
    "designationDomains",
    "initialDirections",
    "nextStep",
  ],
} as const;

export function coerceGuidanceReport(value: unknown): GuidanceReport {
  if (!value || typeof value !== "object") {
    throw new Error("Guidance report is not an object.");
  }

  const raw = value as Partial<GuidanceReport>;

  if (
    typeof raw.title !== "string" ||
    typeof raw.coreSummary !== "string" ||
    typeof raw.nextStep !== "string"
  ) {
    throw new Error("Guidance report is missing required text fields.");
  }

  return {
    title: raw.title,
    generatedAt:
      typeof raw.generatedAt === "string"
        ? raw.generatedAt
        : new Date().toISOString(),
    disclaimer:
      typeof raw.disclaimer === "string"
        ? raw.disclaimer
        : "זוהי מפת כיוון ראשונית בלבד; האבחון המלא יתגבש לאחר שאלון 2.",
    coreSummary: raw.coreSummary,
    interestAreas: Array.isArray(raw.interestAreas)
      ? raw.interestAreas.slice(0, 3)
      : [],
    careerPriorities: Array.isArray(raw.careerPriorities)
      ? raw.careerPriorities.slice(0, 3)
      : [],
    designationDomains: Array.isArray(raw.designationDomains)
      ? raw.designationDomains.slice(0, 5)
      : [],
    initialDirections: Array.isArray(raw.initialDirections)
      ? raw.initialDirections.slice(0, 3)
      : [],
    nextStep: raw.nextStep,
  };
}

