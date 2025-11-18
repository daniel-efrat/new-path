import type { StepData, ValidationResult } from "@/lib/types/questionnaire";

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

  // Check if not more than 10 traits are selected
  if (selectedTraits.length > 10) {
    errors.push("Maximum 10 traits can be selected");
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
export const validateStep9 = (_data: StepData): ValidationResult => {
  // Placeholder step is hidden/skipped; always treat as valid
  return createValidationResult(true, []);
};

// Step 10 validation (Holland questions - placeholder rule)
export const validateStep10 = (_data: StepData): ValidationResult => {
  // Placeholder step is hidden/skipped; always treat as valid
  return createValidationResult(true, []);
};

// Step 11 validation (placeholder)
export const validateStep11 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push("At least one question must be answered");
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
export const validateStep13 = (data: StepData): ValidationResult => {
  const errors: string[] = [];

  const coreValuesAnswer = data["step13_core_values"];
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
  6: validateStep6,
  7: validateStep7,
  8: validateStep8,
  9: validateStep9,
  10: validateStep10,
  11: validateStep11,
  12: validateStep12,
  13: validateStep13,
};
