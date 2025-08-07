import { create } from 'zustand';
import supabase from '@/lib/supabase';
import { validateStep, stepValidators } from '@/lib/validators/questionnaire';
import {
  STEP1_QUESTIONS,
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP4_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
} from '@/lib/constants/questions';
import type {
  AnswerState,
  InsertAnswer,
  StepData,
  ValidationResult,
} from '@/lib/types/questionnaire';

// Define the state structure
interface QuestionnaireState {
  submissionId: string | null;
  currentStep: number;
  answers: Record<string, AnswerState>;
  isSubmitting: boolean;
  isLoading: boolean;
  error: Error | null;
  isComplete: boolean;
  progress: number;
}

// Define the store's actions
interface QuestionnaireStore extends QuestionnaireState {
  createSubmission: () => Promise<string | null>;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canNavigate: (targetStep: number) => boolean;
  setAnswer: (
    questionId: string,
    value: any,
    is_correct?: boolean,
    step?: number
  ) => Promise<void>;
  validateStep: (step: number) => ValidationResult;
  validateCurrentStep: () => ValidationResult;
  getStepData: (step: number) => StepData;
  updateProgress: () => void;
  initialize: () => Promise<void>;
  reset: () => void;
  loadSubmission: () => Promise<void>;
  submit: () => Promise<void>;
  syncStepCompletion: () => Promise<void>;
}

const TOTAL_STEPS = Object.keys(stepValidators).length;
const QUESTIONNAIRE_ID = 'fbbee5e5-33c0-4b73-8514-0407633e05a2'; // Main questionnaire ID

// Define the initial state
const initialState: QuestionnaireState = {
  submissionId: null,
  currentStep: 1,
  answers: {},
  isSubmitting: false,
  isLoading: false,
  error: null,
  isComplete: false,
  progress: 0,
};

export const useQuestionnaireStore = create<QuestionnaireStore>((set, get) => ({
  ...initialState,

  createSubmission: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ error: new Error('User not authenticated for submission.') });
      return null;
    }

    const { data, error } = await supabase
      .from('questionnaire_submissions')
      .insert({ user_id: user.id, questionnaire_id: QUESTIONNAIRE_ID })
      .select('id')
      .single();

    if (error) {
      set({ error });
      return null;
    }

    set({ submissionId: data.id });
    return data.id;
  },

  // Navigation
  setCurrentStep: (step: number) => {
    if (step > 0 && step <= TOTAL_STEPS) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS) {
      get().setCurrentStep(currentStep + 1);
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      get().setCurrentStep(currentStep - 1);
    }
  },

  canNavigate: (targetStep: number) => {
    const { currentStep } = get();
    if (targetStep === currentStep) return true;
    if (targetStep < 1 || targetStep > TOTAL_STEPS) return false;
    if (targetStep < currentStep) return true;

    for (let step = 1; step < targetStep; step++) {
      if (!get().validateStep(step).isValid) return false;
    }
    return true;
  },

  // Data Management
  setAnswer: async (questionId: string, value: any, is_correct?: boolean, step?: number) => {
    try {
      let { submissionId } = get();

      if (!submissionId) {
        submissionId = await get().createSubmission();
        if (!submissionId) throw new Error('Failed to create a submission.');
      }

      const dbValue = typeof value === 'string' ? value : JSON.stringify(value);

      set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: { value: dbValue, timestamp: new Date() },
        },
      }));

      console.log('setAnswer: About to upsert to database:', {
        submission_id: submissionId,
        question_id: questionId,
        answer_value: dbValue
      });

      const { error } = await supabase.from('answers').upsert(
        {
          submission_id: submissionId,
          question_id: questionId,
          answer_value: dbValue,
          is_correct,
          step,
        } as InsertAnswer,
        { onConflict: 'submission_id, question_id' }
      );

      console.log('setAnswer: Database response:', { error });

      if (error) {
        // The original error from Supabase might not be an Error instance
        const dbError = new Error(`Database error on upsert: ${JSON.stringify(error)}`);
        console.error('setAnswer: Database error:', dbError);
        throw dbError;
      }
      get().updateProgress();
    } catch (error) {
      const newError = error instanceof Error ? error : new Error(`An unexpected error occurred: ${JSON.stringify(error)}`);
      set({ error: newError });
      // Re-throw the error so the calling component knows about it
      throw newError;
    }
  },

  // Validation & Progress
  validateStep: (step: number) => {
    const stepData = get().getStepData(step);
    return validateStep(step, stepData);
  },

  validateCurrentStep: () => {
    return get().validateStep(get().currentStep);
  },

  getStepData: (step: number): StepData => {
    const stepQuestionIds = new Set(
      step === 1
        ? STEP1_QUESTIONS.map((q: any) => q.id)
        : step === 2
        ? STEP2_QUESTIONS.map((q: any) => q.id)
        : step === 3
        ? STEP3_QUESTIONS.map((q: any) => q.id)
        : step === 4
        ? STEP4_QUESTIONS.map((q: any) => q.id)
        : step === 5
        ? STEP5_QUESTIONS.map((q: any) => q.id)
        : step === 6
        ? STEP6_QUESTIONS.map((q: any) => q.id)
        : step === 7
        ? STEP7_QUESTIONS.map((q: any) => q.id)
        : []
    );

    return Object.entries(get().answers).reduce<StepData>(
      (acc, [questionId, answer]) => {
        if (stepQuestionIds.has(questionId)) {
          acc[questionId] = { value: answer.value };
        }
        return acc;
      },
      {}
    );
  },

  updateProgress: () => {
    const totalQuestions = 50; // Placeholder
    const answeredCount = Object.keys(get().answers).length;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    set({ progress: Math.min(100, progress) });
  },

  // Lifecycle
  initialize: async () => {
    await get().loadSubmission();
    // Sync step completion state with loaded answers
    await get().syncStepCompletion();
  },

  reset: () => {
    set(initialState);
  },

  loadSubmission: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: submissionData, error: submissionError } = await supabase
        .from('questionnaire_submissions')
        .select('id, answers(question_id, answer_value, created_at)')
        .eq('user_id', user.id)
        .eq('questionnaire_id', QUESTIONNAIRE_ID)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        throw submissionError;
      }

      if (submissionData) {
        const { id: submissionId, answers } = submissionData;
        const answerMap = (answers as any[]).reduce<Record<string, AnswerState>>((acc, dbAnswer) => {
          let parsedValue: any;
          try {
            parsedValue = JSON.parse(dbAnswer.answer_value);
          } catch (e) {
            parsedValue = dbAnswer.answer_value;
          }
          acc[dbAnswer.question_id] = { value: parsedValue, timestamp: new Date(dbAnswer.created_at) };
          return acc;
        }, {});
        set({ submissionId, answers: answerMap });
        get().updateProgress();
      }
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  submit: async () => {
    set({ isSubmitting: true, error: null });
    try {
      const { submissionId } = get();
      if (!submissionId) throw new Error('No submission to submit.');

      for (let step = 1; step <= TOTAL_STEPS; step++) {
        const validation = get().validateStep(step);
        if (!validation.isValid) {
          throw new Error(`Step ${step} is invalid: ${validation.errors.join(', ')}`);
        }
      }

      const { error } = await supabase
        .from('questionnaire_submissions')
        .update({ status: 'completed' })
        .eq('id', submissionId);

      if (error) throw error;

      console.log('Questionnaire submitted successfully with answers:', get().answers);
      set({ isSubmitting: false, isComplete: true });
    } catch (error) {
      set({ isSubmitting: false, error: error as Error });
    }
  },

  syncStepCompletion: async () => {
    try {
      // Import the step store dynamically to avoid circular dependencies
      const { useStepStore } = await import('@/lib/stores/stepStore');
      const stepStore = useStepStore.getState();
      
      // Initialize steps if not already done
      if (stepStore.steps.length === 0) {
        stepStore.initializeSteps();
      }
      
      const { answers } = get();
      
      // Check each step for completion based on validation
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        const validation = get().validateStep(step);
        const isCompleted = validation.isValid;
        
        // Update step completion in the step store
        stepStore.setStepCompletion(step, isCompleted);
      }
      
      console.log('Step completion synced with Supabase answers');
    } catch (error) {
      console.error('Error syncing step completion:', error);
      // Don't throw - this is not critical for app functionality
    }
  },
}));
