export interface QuestionnaireAnswer {
  value: string | number | boolean | string[] | number[]
  isValid?: boolean
  errors?: string[]
}

export interface StepData {
  [key: string]: QuestionnaireAnswer
}

export interface QuestionnaireStep {
  id: number
  title: string
  description?: string
  fields: {
    [key: string]: {
      type: 'text' | 'number' | 'boolean' | 'select'
      label: string
      required?: boolean
      options?: string[]
      validate?: (value: any) => string | null
    }
  }
}

export interface QuestionnaireProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number
  stepProgress: {
    [key: number]: {
      completed: boolean
      valid: boolean
    }
  }
  percentage: number
  completed: number
  total: number
}

export type QuestionnaireStatus = 'draft' | 'submitted' | 'archived'

export interface Questionnaire {
  id: string
  userId: string
  status: QuestionnaireStatus
  stepData: StepData
  createdAt: string
  updatedAt: string
  submittedAt?: string
  version: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface AnalyticsEvent {
  type: 'step_complete' | 'step_invalid' | 'questionnaire_submit' | 'questionnaire_error'
  stepNumber?: number
  errorMessage?: string
  metadata?: Record<string, any>
}

export type StepValidator = (data: StepData) => ValidationResult

export interface StepConfig {
  id: number
  title: string
  description?: string
  validator?: StepValidator
  fields: Record<string, {
    type: string
    label: string
    required?: boolean
    validate?: (value: any) => string | null
  }>
}

export interface QuestionnaireState {
  currentStep: number
  stepData: StepData
  isValid: boolean
  isComplete: boolean
  progress: QuestionnaireProgress
}
