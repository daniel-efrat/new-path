import type { StepData, ValidationResult } from '@/lib/types/questionnaire';

// Helper function to create validation result
export const createValidationResult = (isValid: boolean, errors: string[]): ValidationResult => ({
  isValid,
  errors,
});

// Helper function to validate required fields
const validateRequired = (value: any, fieldName: string): string[] => {
  if (!value || (typeof value === 'object' && !value.value)) {
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
    return value === 'true' || value === true;
  });
  
  // Check if at least one trait is selected
  if (selectedTraits.length === 0) {
    errors.push('At least one trait must be selected');
  }
  
  // Check if not more than 10 traits are selected
  if (selectedTraits.length > 10) {
    errors.push('Maximum 10 traits can be selected');
  }
  
  return createValidationResult(errors.length === 0, errors);
};

// Step 2 validation (career anchors)
export const validateStep2 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  
  // Count answered questions (questions with numeric values)
  const answeredQuestions = Object.entries(data).filter(([questionId, answer]) => {
    if (!answer || answer.value === undefined || answer.value === null) return false;
    const value = typeof answer.value === 'string' ? parseInt(answer.value) : 
                  typeof answer.value === 'number' ? answer.value : NaN;
    return !isNaN(value) && value >= 0;
  });
  
  // Check if at least one question is answered
  if (answeredQuestions.length === 0) {
    errors.push('Career anchor responses are required');
  }
  
  return createValidationResult(errors.length === 0, errors);
};

// Step 3 validation (English assessment)
export const validateStep3 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  
  // Basic validation - check if any answers are provided
  const hasAnswers = Object.keys(data).length > 0;
  if (!hasAnswers) {
    errors.push('At least one question must be answered');
  }
  
  return createValidationResult(errors.length === 0, errors);
};

// Step 4 validation (career anchors detailed)
export const validateStep4 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  
  // Career anchor validation
  if (data.anchors && Array.isArray(data.anchors.value)) {
    const anchors = data.anchors.value as number[];
    anchors.forEach((anchor, index) => {
      if (typeof anchor === 'number' && (anchor < 0 || anchor > 10)) {
        errors.push(`Career anchor ${index + 1} must be between 0 and 10`);
      }
    });
  }
  
  return createValidationResult(errors.length === 0, errors);
};

// Step 5 validation (placeholder)
export const validateStep5 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  return createValidationResult(errors.length === 0, errors);
};

// Step 6 validation (shape selection)
export const validateStep6 = (data: StepData): ValidationResult => {
  const errors: string[] = [];
  
  // Check if shape selection answer exists
  const shapeAnswer = data.step6_shape_selection;
  if (!shapeAnswer || shapeAnswer.value === undefined || shapeAnswer.value === null) {
    errors.push('Shape selection is required');
  }
  
  return createValidationResult(errors.length === 0, errors);
};

// Main validation function
export const validateStep = (step: number, data: StepData): ValidationResult => {
  switch (step) {
    case 1:
      return validateStep1(data);
    case 2:
      return validateStep2(data);
    case 3:
      return validateStep3(data);
    case 4:
      return validateStep4(data);
    case 5:
      return validateStep5(data);
    case 6:
      return validateStep6(data);
    default:
      return createValidationResult(false, [`Invalid step: ${step}`]);
  }
};

// Map step numbers to validators
export const stepValidators: Record<number, (data: StepData) => ValidationResult> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep6,
};
