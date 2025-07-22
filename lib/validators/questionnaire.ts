import { StepData, ValidationResult, QuestionnaireAnswer } from '@/lib/types/questionnaire'

// Utility functions
const createValidationResult = (isValid: boolean, errors: string[] = []): ValidationResult => ({
  isValid,
  errors
})

const validateRequired = (value: QuestionnaireAnswer | undefined, fieldName: string): string[] => {
  if (!value || value.value === undefined || value.value === '') {
    return [`${fieldName} is required`]
  }
  return []
}

const validateEmail = (value: string): string[] => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return ['Invalid email address']
  }
  return []
}

const validateNumber = (value: number, min?: number, max?: number): string[] => {
  const errors: string[] = []
  if (min !== undefined && value < min) {
    errors.push(`Value must be at least ${min}`)
  }
  if (max !== undefined && value > max) {
    errors.push(`Value must be no more than ${max}`)
  }
  return errors
}

// Step validators
export const validateStep1 = (data: StepData): ValidationResult => {
  const errors: string[] = []
  
  // Validate traits selection (should have at least 1, max 10)
  const traits = Array.isArray(data.traits?.value) ? (data.traits.value as string[]) : []
  if (traits.length === 0) {
    errors.push('At least one trait must be selected')
  }
  if (traits.length > 10) {
    errors.push('Maximum 10 traits can be selected')
  }
  
  // Validate anchors (should have all 18 questions answered)
  const anchors = Array.isArray(data.anchors?.value) ? (data.anchors.value as number[]) : []
  if (anchors.length !== 18) {
    errors.push('All 18 career anchor questions must be answered')
  }
  
  // Validate anchor values are in range 0-10
  anchors.forEach((anchor, index) => {
    if (typeof anchor === 'number' && (anchor < 0 || anchor > 10)) {
      errors.push(`Career anchor question ${index + 1} must be between 0 and 10`)
    }
  })

  return createValidationResult(errors.length === 0, errors)
}

export const validateStep2 = (data: StepData): ValidationResult => {
  // No required fields for Step2 (career anchors)
  return createValidationResult(true, [])
}

export const validateStep3 = (data: StepData): ValidationResult => {
  const errors: string[] = []
  
  // Required fields
  errors.push(...validateRequired(data.meetingPurpose, 'Meeting purpose'))
  errors.push(...validateRequired(data.expectedOutcome, 'Expected outcome'))

  return createValidationResult(errors.length === 0, errors)
}

export const validateStep4 = (data: StepData): ValidationResult => {
  const errors: string[] = []
  
  // Required fields
  errors.push(...validateRequired(data.participantCount, 'Participant count'))
  errors.push(...validateRequired(data.duration, 'Duration'))
  
  // Number validation
  if (data.participantCount?.value) {
    errors.push(...validateNumber(Number(data.participantCount.value), 2, 100))
  }
  
  if (data.duration?.value) {
    errors.push(...validateNumber(Number(data.duration.value), 15, 240))
  }

  return createValidationResult(errors.length === 0, errors)
}

export const validateStep5 = (data: StepData): ValidationResult => {
  const errors: string[] = []
  
  // Required fields
  errors.push(...validateRequired(data.agenda, 'Agenda'))
  errors.push(...validateRequired(data.notes, 'Additional notes'))

  return createValidationResult(errors.length === 0, errors)
}

// Map step numbers to validators
export const stepValidators: Record<number, (data: StepData) => ValidationResult> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
}

// Helper function to validate any step
export const validateStep = (step: number, data: StepData): ValidationResult => {
  const validator = stepValidators[step]
  if (!validator) {
    return createValidationResult(false, [`Invalid step number: ${step}`])
  }
  return validator(data)
}
