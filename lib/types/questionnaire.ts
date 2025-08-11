export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}

export interface Questionnaire {
  id: string
  title: string
  description: string | null
  created_at: string
}

export interface Question {
  id: string
  questionnaire_id: string
  step_number: number
  question_text: string
  question_type: string
  answer_options: Record<string, unknown> | null
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  answer_value: any
  created_at: string
  updated_at: string
}

export interface InsertAnswer {
  submission_id: string;
  question_id: string;
  answer_value: any;
  is_correct?: boolean;
  step?: number;
}

export interface UpdateAnswer {
  answer_value: string
}

export interface QuestionnaireProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number
  stepProgress: Record<number, {
    completed: boolean
    valid: boolean
  }>
  percentage: number
  completed: number
  total: number
}

export interface AnswerState {
  value: any;
  timestamp: Date;
  is_correct?: boolean;
  step?: number;
}

export type StepData = Record<string, AnswerState>;

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface QuestionnaireAnswer {
  value: unknown
  isValid?: boolean
}
