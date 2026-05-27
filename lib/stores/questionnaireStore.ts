import { create } from "zustand";
import { createBrowserClient } from '@supabase/ssr';
import { validateStep, stepValidators } from "@/lib/validators/questionnaire";
import {
  STEP1_QUESTIONS,
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP4_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP11_QUESTIONS,
} from "@/lib/constants/questions";
import type {
  AnswerState as AnswerStateDefinition,
  StepData,
  ValidationResult,
} from "@/lib/types/questionnaire";

// Redefine AnswerState locally to include step
interface AnswerState extends AnswerStateDefinition {
  step?: number;
}

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
  submitAnswers: (answers: { id: string; value: any; timestamp: Date }[]) => Promise<{ riasec_vector: Record<string, number>, riasec_code: string } | null>;
  syncStepCompletion: () => Promise<void>;
}

const TOTAL_STEPS = Object.keys(stepValidators).length;
const QUESTIONNAIRE_ID = "fbbee5e5-33c0-4b73-8514-0407633e05a2"; // Main questionnaire ID

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

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useQuestionnaireStore = create<QuestionnaireStore>()((set, get) => ({
  ...initialState,

  createSubmission: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: new Error("User not authenticated for submission.") });
      return null;
    }

    const userId = user.id;
    const questionnaireId = QUESTIONNAIRE_ID;

    const { data, error } = await supabase
      .from('questionnaire_submissions')
      .insert({
        user_id: userId,
        questionnaire_id: questionnaireId,
        status: 'in-progress',
      })
      .select('id')
      .single();

    if (error) {
      console.error("Failed to create submission in database:", error);
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
  setAnswer: async (
    questionId: string,
    value: any,
    is_correct?: boolean,
    step?: number
  ) => {
    try {
      let { submissionId } = get();

      if (!submissionId) {
        submissionId = await get().createSubmission();
        if (!submissionId) {
          throw new Error("Failed to create a new submission.");
        }
      }

      const stepNumber = step || get().currentStep;

      const newAnswer: AnswerState = {
        value,
        timestamp: new Date(),
        is_correct,
        step: stepNumber,
      };

      set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: newAnswer,
        },
      }));

      const { error } = await supabase
        .from("answers")
        .upsert(
          {
            submission_id: submissionId,
            question_id: questionId,
            answer_value: String(value),
            is_correct,
            step: stepNumber,
          },
          { onConflict: "submission_id,question_id" }
        );

      if (error) {
        console.error("Failed to save answer to database:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        set({ error: new Error(`Database error: ${error.message}`) });
      } else {
        get().updateProgress();
        await get().syncStepCompletion();
      }
    } catch (error) {
      console.error("Error in setAnswer:", error);
      set({ error: error as Error });
    }
  },

  submitAnswers: async (answers: { id: string; value: any; timestamp: Date }[]) => {
    set({ isSubmitting: true, error: null });
    try {
      // Get the current session to ensure authentication and access token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // API expects each answer as { id, value }. Ensure numeric values and drop invalid ones
      const formattedAnswers = answers
        .map((answer) => ({ id: answer.id, value: Number((answer as any).value) }))
        .filter((a) => Number.isFinite(a.value));

      const response = await fetch('/api/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Send bearer token for API routes that validate Authorization header
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answers: formattedAnswers }),
        credentials: 'include', // Also send cookies for auth-helpers cookie flow
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit answers');

      // Return the RIASEC results for the frontend to display
      return {
        riasec_vector: data.riasec_vector,
        riasec_code: data.riasec_code,
      };
    } catch (error) {
      set({ error: error as Error });
      return null;
    } finally {
      set({ isSubmitting: false });
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
    const { answers } = get();
    const stepAnswers: StepData = {};

    // Filter answers for the given step
    for (const questionId in answers) {
      if (answers[questionId].step === step) {
        stepAnswers[questionId] = answers[questionId];
      }
    }

    return stepAnswers;
  },

  updateProgress: () => {
    const { currentStep } = get();
    const stepData = get().getStepData(currentStep);
    const answeredCount = Object.keys(stepData).length;
    const totalQuestions =
      currentStep === 1
        ? STEP1_QUESTIONS.length
        : currentStep === 2
        ? STEP2_QUESTIONS.length
        : currentStep === 3
        ? STEP3_QUESTIONS.length
        : currentStep === 4
        ? STEP4_QUESTIONS.length
        : currentStep === 5
        ? STEP5_QUESTIONS.length
        : currentStep === 6
        ? STEP6_QUESTIONS.length
        : currentStep === 7
        ? STEP7_QUESTIONS.length
        : currentStep === 8
        ? STEP8_QUESTIONS.length
        : currentStep === 11
        ? STEP11_QUESTIONS.length
        : 0;

    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    set({ progress });
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await get().loadSubmission();
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set(initialState),

  loadSubmission: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: new Error("User not authenticated for submission.") });
      return;
    }

    // Load the latest submission for the user
    const { data: submission, error: submissionError } = await supabase
      .from("questionnaire_submissions")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (submissionError) {
      console.error("Failed to load submission for user:", submissionError);
      set({ error: submissionError });
      return;
    }

    if (!submission) {
      return;
    }

    set({ submissionId: submission.id });

    // Load answers for the submission
    const { data: answers, error: answersError } = await supabase
      .from("answers")
      .select("question_id, answer_value, answered_at, step")
      .eq("submission_id", submission.id);

    if (answersError) {
      console.warn("Failed to load answers for submission.", answersError);
      return;
    }

    const answersMap: Record<string, AnswerState> = {};
    answers.forEach((answer) => {
      answersMap[answer.question_id] = {
        value: answer.answer_value,
        timestamp: new Date(answer.answered_at),
        step: answer.step,
      };
    });

    set({ answers: answersMap });
    get().updateProgress();
    get().syncStepCompletion();
  },

  submit: async () => {
    set({ isSubmitting: true, error: null });
    try {
      const { submissionId } = get();
      if (!submissionId) throw new Error("No submission ID found.");

      const { error } = await supabase
        .from("questionnaire_submissions")
        .update({ status: "completed", updated_at: new Date() })
        .eq("id", submissionId);

      if (error) throw error;

      set({ isComplete: true });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isSubmitting: false });
    }
  },

  syncStepCompletion: async () => {
    try {
      // Placeholder for future implementation
      console.log("syncStepCompletion called");
      const { useStepStore } = await import("@/lib/stores/stepStore");
      const stepStore = useStepStore.getState();

      // Initialize steps if not already done
      if (stepStore.steps.length === 0) {
        stepStore.initializeSteps();
      }

      // Check each step for completion based on validation
      for (let step = 1; step <= TOTAL_STEPS; step++) {
        const validation = get().validateStep(step);
        const isCompleted = validation.isValid;

        // Update step completion in the step store
        stepStore.setStepCompletion(step, isCompleted);
      }

      console.log("Step completion synced with Supabase answers");
    } catch (error: any) {
      console.error("Error syncing step completion:", error);
      // Don't throw - this is not critical for app functionality
    }
  },
}));
