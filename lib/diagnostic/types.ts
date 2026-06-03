import type { GuidanceReport, RiasecCode } from "@/lib/guidance/types";

export type DiagnosticProvider =
  | "openai"
  | "gemini"
  | "openrouter"
  | "deterministic";

export type AbilityKey =
  | "hebrew"
  | "english"
  | "logic"
  | "math"
  | "visual"
  | "computer"
  | "attention"
  | "filtering"
  | "workingMemory";

export type PersonalityKey =
  | "organization"
  | "social"
  | "resilience"
  | "curiosity"
  | "empathy"
  | "initiative";

export interface ScoreSummary {
  label: string;
  score: number;
  answered: number;
  total: number;
}

export interface DiagnosticProfileInsights {
  strengths: string[];
  developmentAreas: string[];
  workStyle: string;
}

export interface TrainingPlace {
  name: string;
  type: string;
  url?: string;
}

export interface AverageSalary {
  monthlyGross: number | null;
  source: string;
  sourceYear: number | null;
  note?: string;
}

export interface DiagnosticOccupation {
  id: string;
  title: string;
  matchPercent: number;
  shortWhy: string;
  description: string;
  fitReasons: string[];
  possibleTensions: string[];
  requiredTraining: string[];
  trainingPlaces: TrainingPlace[];
  averageSalary: AverageSalary;
  avodataUrl: string;
  scoreBreakdown: {
    interests: number;
    abilities: number;
    personality: number;
    priorities: number;
    domain: number;
  };
}

export interface DiagnosticReport {
  title: string;
  generatedAt: string;
  disclaimer: string;
  summary: string;
  questionnaire1: {
    guidanceTitle: string | null;
    guidanceSummary: string | null;
    topRiasec: Array<{ code: RiasecCode; name: string; score: number }>;
  };
  abilityScores: ScoreSummary[];
  personalityScores: ScoreSummary[];
  profileInsights: DiagnosticProfileInsights;
  topOccupations: DiagnosticOccupation[];
  nextSteps: string[];
  tokenUsage?: DiagnosticTokenUsage | null;
}

export interface DiagnosticTokenUsage {
  queryTokens: number;
  answerTokens: number;
  totalTokens: number;
}

export interface DiagnosticApiResponse {
  report: DiagnosticReport;
  reportId: string;
  inputHash: string;
  provider: DiagnosticProvider;
  model: string;
  cached: boolean;
  tokenUsage?: DiagnosticTokenUsage | null;
}

export interface DiagnosticApiError {
  error: string;
}

export interface DiagnosticNarrative {
  occupationId: string;
  shortWhy: string;
  fitReasons: string[];
  possibleTensions: string[];
}

export interface DiagnosticNarrativeResponse {
  summary: string;
  profileInsights: DiagnosticProfileInsights;
  occupationNarratives: DiagnosticNarrative[];
  nextSteps: string[];
}

export interface DiagnosticInput {
  submissionId: string;
  submissionCreatedAt: string;
  guidanceReportId: string | null;
  guidanceReport: GuidanceReport | null;
  questionnaire1: {
    selectedTraits: string[];
    careerAnchors: Array<{ text: string; score: number }>;
    holland: {
      code: string;
      areas: Array<{ code: RiasecCode; name: string; score: number }>;
      topAreas: Array<{ code: RiasecCode; name: string; score: number }>;
    };
    designationDomains: Array<{
      rank: number;
      occupationSerial: number;
      title: string;
      selectedStatements: string[];
    }>;
  };
  questionnaire2: {
    abilities: Record<AbilityKey, ScoreSummary>;
    personality: Record<PersonalityKey, ScoreSummary>;
    coreValues: Array<{ name: string; score: number | null; missing: string }>;
  };
  candidateOccupations: DiagnosticOccupation[];
  completedAt: string;
}
