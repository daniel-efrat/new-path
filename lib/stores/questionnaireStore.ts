import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { validateStep, stepValidators } from '@/lib/validators/questionnaire'
import type {
  StepData,
  QuestionnaireAnswer,
  QuestionnaireProgress,
  QuestionnaireState,
  ValidationResult
} from '@/lib/types/questionnaire'

interface QuestionnaireStore extends QuestionnaireState {
  questionnaireId: string | null
  isSubmitting: boolean
  isLoading: boolean
  error: Error | null
  
  // Navigation
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  canNavigate: (targetStep: number) => boolean
  
  // Data management
  updateStepData: (data: Partial<StepData>) => Promise<void>
  setAnswer: (key: string, value: any) => Promise<void>
  
  // Validation & Progress
  validateStep: (step: number) => ValidationResult
  validateCurrentStep: () => ValidationResult
  getProgress: () => QuestionnaireProgress
  updateProgress: () => void
  isStepValid: (step: number) => boolean
  
  // Form actions
  submitQuestionnaire: () => Promise<void>
  resetQuestionnaire: () => void
  initializeQuestionnaire: () => Promise<void>
  
  // Loading states
  setIsLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
}

const TOTAL_STEPS = Object.keys(stepValidators).length

const createInitialProgress = (): QuestionnaireProgress => ({
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  completedSteps: 0,
  stepProgress: {},
  percentage: 0,
  completed: 0,
  total: TOTAL_STEPS
})

export const useQuestionnaireStore = create<QuestionnaireStore>((set, get) => ({
  // State
  currentStep: 1,
  stepData: {},
  questionnaireId: null,
  isSubmitting: false,
  isLoading: false,
  error: null,
  isValid: false,
  isComplete: false,
  progress: createInitialProgress(),

  // Navigation
  setCurrentStep: (step: number) => {
    if (get().canNavigate(step)) {
      set({ currentStep: step })
      get().updateProgress()
    }
  },

  nextStep: () => {
    const { currentStep, validateCurrentStep } = get()
    if (currentStep < TOTAL_STEPS && validateCurrentStep().isValid) {
      set({ currentStep: currentStep + 1 })
      get().updateProgress()
    }
  },

  previousStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 })
      get().updateProgress()
    }
  },

  canNavigate: (targetStep: number) => {
    const { stepData, currentStep } = get()
    // Can always go back
    if (targetStep < currentStep) return true
    
    // Check if all previous steps are valid
    for (let step = 1; step < targetStep; step++) {
      if (!get().isStepValid(step)) return false
    }
    return true
  },

  // Data management
  updateStepData: async (data: Partial<StepData>) => {
    try {
      set({ isLoading: true, error: null })
      const { questionnaireId, stepData } = get()
      
      // Merge new data with existing data, ensuring no undefined values
      const newStepData = Object.entries(data).reduce<StepData>((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, { ...stepData })
      
      if (!questionnaireId) {
        // Create new questionnaire
        // Get current user's UID
        const { data: { user } } = await supabase.auth.getUser();
        const { data: questionnaire, error } = await supabase
          .from('questionnaires')
          .insert({
            user_id: user?.id,
            step_data: newStepData,
            status: 'draft'
          })
          .select()
          .single()

        if (error) throw error
        set({ questionnaireId: questionnaire.id })
      } else {
        // Update existing questionnaire
        const { error } = await supabase
          .from('questionnaires')
          .update({
            step_data: newStepData,
            updated_at: new Date().toISOString()
          })
          .eq('id', questionnaireId)

        if (error) throw error
      }

      set({ stepData: newStepData })
      get().updateProgress()
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  setAnswer: async (key: string, value: any) => {
    console.log("[setAnswer]", { key, value });
    const answer: QuestionnaireAnswer = {
      value,
      isValid: true, // Will be validated by validateStep
    }
    
    const update: StepData = { [key]: answer }
    await get().updateStepData(update)
  },

  // Validation & Progress
  validateStep: (step: number) => {
    return validateStep(step, get().stepData)
  },

  validateCurrentStep: () => {
    return get().validateStep(get().currentStep)
  },

  isStepValid: (step: number) => {
    return get().validateStep(step).isValid
  },

  // Pure getter: does NOT update state
  getProgress: () => {
    const { currentStep, stepData } = get()
    let completedSteps = 0
    const stepProgress: QuestionnaireProgress['stepProgress'] = {}

    // Calculate progress for each step
    for (let step = 1; step <= TOTAL_STEPS; step++) {
      const validation = get().validateStep(step)
      const hasAnswers = Object.keys(stepData).some(key => key.startsWith(`step${step}`))
      
      stepProgress[step] = {
        completed: hasAnswers,
        valid: validation.isValid
      }

      if (hasAnswers && validation.isValid) {
        completedSteps++
      }
    }

    const progress: QuestionnaireProgress = {
      currentStep,
      totalSteps: TOTAL_STEPS,
      completedSteps,
      stepProgress,
      percentage: Math.round((completedSteps / TOTAL_STEPS) * 100),
      completed: completedSteps,
      total: TOTAL_STEPS
    }

    return progress
  },

  // Updates progress, isValid, isComplete in store
  updateProgress: () => {
    const progress = get().getProgress()
    const isValid = progress.completedSteps === progress.totalSteps
    set({
      progress,
      isValid,
      isComplete: isValid
    })
  },

  // Form actions
  submitQuestionnaire: async () => {
    try {
      // Validate all steps before submission
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        const validation = get().validateStep(step)
        if (!validation.isValid) {
          throw new Error(`Step ${step} is invalid: ${validation.errors.join(", ")}`)
        }
      }

      set({ isSubmitting: true, error: null })
      const { questionnaireId, stepData } = get()

      if (!questionnaireId) throw new Error('No questionnaire to submit')

      const { error } = await supabase
        .from('questionnaires')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          step_data: stepData
        })
        .eq('id', questionnaireId)

      if (error) throw error

      // Reset store after successful submission
      get().resetQuestionnaire()
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isSubmitting: false })
    }
  },

  resetQuestionnaire: () => {
    set({
      currentStep: 1,
      stepData: {},
      questionnaireId: null,
      error: null,
      isSubmitting: false,
      isLoading: false,
      isValid: false,
      isComplete: false,
      progress: createInitialProgress()
    })
  },

  initializeQuestionnaire: async () => {
    try {
      set({ isLoading: true, error: null })

      // Check for existing draft questionnaire
      const { data: questionnaire, error } = await supabase
        .from('questionnaires')
        .select()
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned

      if (questionnaire) {
        set((state: any) => ({
          questionnaireId: questionnaire.id,
          stepData: questionnaire.step_data as StepData,
          currentStep: state.currentStep > 1 ? state.currentStep : 1
        }))
        get().updateProgress()
      }
    } catch (error) {
      set({ error: error as Error })
    } finally {
      set({ isLoading: false })
    }
  },

  // Loading states
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: Error | null) => set({ error })
}))
