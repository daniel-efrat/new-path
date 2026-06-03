import type { StepData, ValidationResult } from "@/lib/types/questionnaire";
import { QUESTIONNAIRE_CONFIG } from "@/lib/constants/questionnaire";
import {
  STEP9_QUESTIONS,
  STEP10_QUESTIONS,
  STEP11_QUESTIONS,
} from "@/lib/constants/questions";

// Helper function to create validation result
export const createValidationResult = (
  isValid: boolean,
  errors: string[]
): ValidationResult => ({
  isValid,
  errors,
});

// Helper function to validate required fields
const validateRequired = (value: any, fieldName: string): string[] => {
  if (!value || (typeof value === "object" && !value.value)) {
    return [`${fieldName} is required`];
  }
  return [];
};

// Helper function to validate numbers
const validateNumber = (value: number, min: number, max: number): string[] => {
  if (isNaN(value) || value < min || value > max) {
    return [`Value must be between ${min} and ${max}`];
  }
  return [];
};

// Step 1 validation (traits selection)
export const validateStep1 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  // Count selected traits (questions with 'true' values)
  const selectedTraits = Object.entries(data).filter(([questionId, answer]) => {
    if (!answer || !answer.value) return false;
    const value = answer.value;
    return value === "true" || value === true;
  });

  // Check if at least one trait is selected
  if (selectedTraits.length === 0) {
    errors.push("At least one trait must be selected");
  }

  // Check if not more than the client-approved core strengths are selected
  if (selectedTraits.length > QUESTIONNAIRE_CONFIG.MAX_TRAITS) {
    errors.push(
      `Maximum ${QUESTIONNAIRE_CONFIG.MAX_TRAITS} traits can be selected`
    );
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 2 validation (Hebrew assessment)
export const validateStep2 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  // Basic validation - check if any answers are provided
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("At least one question must be answered");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 3 validation (English assessment)
export const validateStep3 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  // Basic validation - check if any answers are provided
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("At least one question must be answered");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 4 validation (career anchors)
export const validateStep4 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  // Count answered questions (questions with numeric values)
  const answeredQuestions = Object.entries(data).filter(
    ([questionId, answer]) => {
      if (!answer || answer.value === undefined || answer.value === null)
        return false;
      const value =
        typeof answer.value === "string"
          ? parseInt(answer.value)
          : typeof answer.value === "number"
          ? answer.value
          : NaN;
      return !isNaN(value) && value >= 0;
    }
  );

  // Check if at least one question is answered
  if (answeredQuestions.length === 0) {
    errors.push("Career anchor responses are required");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 5 validation (placeholder)
export const validateStep5 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  return createValidationResult(errors.length === 0, errors);
};

// Step 5-1 validation (math questions)
export const validateStep6 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  return createValidationResult(errors.length === 0, errors);
};

// Step 6 validation (shape selection)
export const validateStep7 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  // Check if at least one answer is provided for Step 6
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("Shape selection is required");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 8 validation (placeholder)
export const validateStep8 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  // Accept if there is any data for now
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("At least one question must be answered");
  }
  return createValidationResult(errors.length === 0, errors);
};

// Step 9 validation (placeholder)
export const validateStep9 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  const answeredQuestions = STEP9_QUESTIONS.filter((question) => {
    const answer = data[question.id];
    if (!answer || answer.value === undefined || answer.value === null) {
      return false;
    }

    const value =
      typeof answer.value === "string" ? Number(answer.value) : answer.value;

    return (
      Number.isInteger(value) &&
      value >= -1 &&
      value < question.options.length
    );
  });

  if (answeredQuestions.length < STEP9_QUESTIONS.length) {
    errors.push("יש להשלים את מבדק הקשב, סינון המידע והזיכרון.");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 10 validation (personality statements)
export const validateStep10 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  const answeredQuestions = STEP10_QUESTIONS.filter((question) => {
    const answer = data[question.id];
    if (!answer || answer.value === undefined || answer.value === null) {
      return false;
    }

    const value =
      typeof answer.value === "string" ? Number(answer.value) : answer.value;

    return Number.isInteger(value) && value >= 1 && value <= 5;
  });

  if (answeredQuestions.length < STEP10_QUESTIONS.length) {
    errors.push("יש להשלים את כל היגדי מבחני האישיות.");
  }

  return createValidationResult(errors.length === 0, errors);
};

export const validateStep11 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  const answeredQuestions = STEP11_QUESTIONS.filter((question) => {
    const answer = data[question.id];
    if (!answer || answer.value === undefined || answer.value === null) {
      return false;
    }

    const value =
      typeof answer.value === "string" ? Number(answer.value) : answer.value;

    return Number.isInteger(value) && value >= 1 && value <= 5;
  });

  if (answeredQuestions.length < STEP11_QUESTIONS.length) {
    errors.push("יש להשלים את כל שאלון הולנד.");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Step 12 validation (placeholder)
export const validateStep12 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("At least one question must be answered");
  }
  return createValidationResult(errors.length === 0, errors);
};

// Step 13 validation – values exercise
const STEP13_CORE_VALUES_ID = "9d79036e-bf0c-4d65-b06f-f5f4b5f01302";

export const validateStep13 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  const coreValuesAnswer = data[STEP13_CORE_VALUES_ID];
  if (!coreValuesAnswer || !coreValuesAnswer.value) {
    errors.push("יש לבחור לפחות 4 ועד 6 ערכי ליבה ולהגדיר להם ציון.");
    return createValidationResult(errors.length === 0, errors);
  }

  try {
    const parsed = JSON.parse(coreValuesAnswer.value as string);
    if (!Array.isArray(parsed) || parsed.length < 4 || parsed.length > 6) {
      errors.push("יש לבחור בין 4 ל-6 ערכי ליבה.");
    } else {
      parsed.forEach((row: any, index: number) => {
        const score = row?.score;
        if (typeof score !== "number" || score < 1 || score > 10) {
          errors.push(`לא הוגדר ציון תקין לערך מספר ${index + 1}.`);
        }
      });
    }
  } catch {
    errors.push("לא ניתן לקרוא את נתוני ערכי הליבה.");
  }

  return createValidationResult(errors.length === 0, errors);
};

// Main validation function
export const validateStep = (
  step: number,
  data: StepData
): ValidationResult => {
  const validator = stepValidators[step];
  if (validator) {
    return validator(data);
  }
  return createValidationResult(false, [`Invalid step: ${step}`]);
};

// Map step numbers to validators
export const stepValidators: Record<
  number,
  (data: StepData) => ValidationResult
> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep7,
  7: validateStep8,
  8: validateStep9,
  9: validateStep10,
  10: validateStep11,
  11: validateStep12,
  12: validateStep13,
  13: validateStep12,
};
