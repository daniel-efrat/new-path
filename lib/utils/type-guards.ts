import type {
  QuestionnaireAnswer,
  ValidationResult,
  QuestionnaireProgress,
  AnalyticsEvent,
} from "@/lib/types/questionnaire";
import { QUESTIONNAIRE_CONFIG } from "@/lib/constants/questionnaire";

export function isQuestionnaireAnswer(obj: unknown): obj is QuestionnaireAnswer {
  if (!obj || typeof obj !== "object") return false;

  const answer = obj as Record<string, unknown>;

  // Check traits array
  if (answer.traits !== undefined) {
    if (!Array.isArray(answer.traits)) return false;
    if (!answer.traits.every((trait: unknown) => typeof trait === "string")) return false;
    if (answer.traits.length > QUESTIONNAIRE_CONFIG.MAX_TRAITS) return false;
  }

  // Check anchors array
  if (answer.anchors !== undefined) {
    if (!Array.isArray(answer.anchors)) return false;
    if (answer.anchors.length !== QUESTIONNAIRE_CONFIG.TOTAL_ANCHORS) return false;
    if (!answer.anchors.every((anchor: unknown) => 
      typeof anchor === "number" && 
      anchor >= QUESTIONNAIRE_CONFIG.MIN_ANCHOR_VALUE && 
      anchor <= QUESTIONNAIRE_CONFIG.MAX_ANCHOR_VALUE
    )) return false;
  }

  // Check metadata if present
  if (answer.metadata !== undefined) {
    if (typeof answer.metadata !== "object" || !answer.metadata) return false;
    const metadata = answer.metadata as Record<string, unknown>;

    if (metadata.startedAt && !isValidISODate(String(metadata.startedAt))) return false;
    if (metadata.lastUpdated && !isValidISODate(String(metadata.lastUpdated))) return false;
    if (metadata.completedAt && !isValidISODate(String(metadata.completedAt))) return false;
    if (metadata.timeSpentMs && typeof metadata.timeSpentMs !== "number") return false;
  }

  return true;
}

export function isValidationResult(obj: unknown): obj is ValidationResult {
  if (!obj || typeof obj !== "object") return false;
  const result = obj as Record<string, unknown>;
  
  return (
    typeof result.isValid === "boolean" &&
    Array.isArray(result.errors) &&
    result.errors.every((error: unknown) => typeof error === "string")
  );
}

export function isQuestionnaireProgress(obj: unknown): obj is QuestionnaireProgress {
  if (!obj || typeof obj !== "object") return false;
  const progress = obj as Record<string, unknown>;

  const requiredKeys = ["traits", "anchors", "total", "isComplete"];
  if (!requiredKeys.every((key) => key in progress)) return false;

  const progressSection = (section: unknown): boolean => {
    if (!section || typeof section !== "object") return false;
    const data = section as Record<string, unknown>;

    return (
      typeof data.completed === "number" &&
      typeof data.total === "number" &&
      typeof data.percentage === "number" &&
      (!("remaining" in data) || typeof data.remaining === "number")
    );
  };

  return (
    progressSection(progress.traits) &&
    progressSection(progress.anchors) &&
    progressSection(progress.total) &&
    typeof progress.isComplete === "boolean"
  );
}

export function isAnalyticsEvent(obj: unknown): obj is AnalyticsEvent {
  if (!obj || typeof obj !== "object") return false;
  const event = obj as Record<string, unknown>;

  return (
    typeof event.category === "string" &&
    typeof event.action === "string" &&
    (event.label === undefined || typeof event.label === "string") &&
    (event.value === undefined || typeof event.value === "number") &&
    (event.metadata === undefined || (typeof event.metadata === "object" && event.metadata !== null))
  );
}

// Helper function to validate ISO date strings
function isValidISODate(str: string): boolean {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime());
}

export function assertQuestionnaireAnswer(
  obj: unknown
): asserts obj is QuestionnaireAnswer {
  if (!isQuestionnaireAnswer(obj)) {
    throw new Error("Invalid questionnaire answer format");
  }
}

export function assertValidationResult(
  obj: unknown
): asserts obj is ValidationResult {
  if (!isValidationResult(obj)) {
    throw new Error("Invalid validation result format");
  }
}

export function assertQuestionnaireProgress(
  obj: unknown
): asserts obj is QuestionnaireProgress {
  if (!isQuestionnaireProgress(obj)) {
    throw new Error("Invalid questionnaire progress format");
  }
}

export function assertAnalyticsEvent(
  obj: unknown
): asserts obj is AnalyticsEvent {
  if (!isAnalyticsEvent(obj)) {
    throw new Error("Invalid analytics event format");
  }
}
