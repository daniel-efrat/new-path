import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "@/lib/supabase";

interface Step {
  id: number;
  isCompleted: boolean;
  isLocked: boolean;
}

interface StepState {
  steps: Step[];
  userId?: string;
  isInitialized: boolean;
  hollandResults?: {
    riasec_vector: Record<string, number>;
    riasec_code: string;
  } | null;
  setStepCompletion: (stepId: number, isCompleted: boolean) => Promise<void>;
  initializeSteps: () => void;
  resetSteps: () => void;
  resetFromStep: (stepId: number) => void;
  setUserId: (userId?: string) => void;
  setHollandResults: (
    results: {
      riasec_vector: Record<string, number>;
      riasec_code: string;
    } | null
  ) => void;
  ensureUser: (expectedUserId?: string) => Promise<void>;
  fetchUserProgress: (userId: string) => Promise<void>;
}

const makeInitialSteps = () => [
  { id: 1, isCompleted: false, isLocked: false },
  { id: 2, isCompleted: false, isLocked: true },
  { id: 3, isCompleted: false, isLocked: true },
  { id: 4, isCompleted: false, isLocked: true },
  { id: 5, isCompleted: false, isLocked: true },
  { id: 6, isCompleted: false, isLocked: true },
  { id: 7, isCompleted: false, isLocked: true },
  { id: 8, isCompleted: false, isLocked: true },
  { id: 9, isCompleted: false, isLocked: true },
  { id: 10, isCompleted: false, isLocked: true },
  { id: 11, isCompleted: false, isLocked: true },
  { id: 12, isCompleted: false, isLocked: true },
  { id: 13, isCompleted: false, isLocked: true },
];

// Temporary skip map: when completing a step, unlock the mapped next step instead
// This allows skipping placeholder steps (e.g., 9 and 10) so that completing 8 unlocks 11
const SKIP_UNLOCK_MAP: Record<number, number> = {
  8: 11,
};

export const useStepStore = create<StepState>()(
  persist(
    (set, get) => ({
      steps: [],
      userId: undefined,
      isInitialized: false,
      hollandResults: null,

      setStepCompletion: async (stepId, isCompleted) => {
        const state = get();
        const newSteps = state.steps.map((step) => {
          const nextStepId = SKIP_UNLOCK_MAP[stepId] ?? stepId + 1;
          if (step.id === stepId) {
            return { ...step, isCompleted };
          }
          if (step.id === nextStepId && isCompleted) {
            return { ...step, isLocked: false };
          }
          if (step.id > stepId && !isCompleted) {
            return { ...step, isLocked: true, isCompleted: false };
          }
          return step;
        });

        set({ steps: newSteps });

        // Persist the changes to Supabase (non-blocking) with robust logging
        const userId = state.userId;
        if (userId) {
          // Fire-and-forget with an async IIFE so UI is not blocked, but errors are logged
          (async () => {
            try {
              const { error } = await supabase
                .from("user_questionnaire_progress")
                .upsert(
                  {
                    user_id: userId,
                    steps_progress: newSteps,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "user_id",
                    ignoreDuplicates: false,
                  }
                );
              if (error) {
                console.error("Failed to save progress:", {
                  message: (error as any)?.message,
                  code: (error as any)?.code,
                  details: (error as any)?.details,
                  hint: (error as any)?.hint,
                });
              }
            } catch (e: unknown) {
              console.error("Save progress threw exception:", {
                message: (e as any)?.message ?? String(e),
              });
            }
          })();
        } else {
          // Helpful when auth/session not yet bound
          console.warn("Skipping save progress: no userId bound to step store");
        }
      },

      resetFromStep: (stepId) =>
        set((state) => {
          const newSteps = state.steps.map((step) => {
            if (step.id >= stepId) {
              return {
                ...step,
                isCompleted: false,
                isLocked: step.id > stepId,
              };
            }
            return step;
          });
          return { steps: newSteps };
        }),

      resetSteps: () => set({ steps: makeInitialSteps() }),

      initializeSteps: () => {
        const userId = get().userId;
        if (userId) {
          get().fetchUserProgress(userId);
        } else {
          set({ steps: makeInitialSteps() });
        }
      },

      setUserId: (userId) => set({ userId }),

      // Ensure the persisted state belongs to the current signed-in user.
      // If it doesn't, reset steps and rebind the store to the current user.
      ensureUser: async (expectedUserId) => {
        try {
          // Prefer the provided expectedUserId, otherwise read from Supabase
          let currentUserId = expectedUserId;
          if (!currentUserId) {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            currentUserId = user?.id;
          }

          const state = get();
          if (currentUserId && state.userId !== currentUserId) {
            // Bind to the new user and fetch their progress
            set({ userId: currentUserId, hollandResults: null });
            state.fetchUserProgress(currentUserId);
          } else if (!state.userId && currentUserId) {
            // This case handles initial hydration for a logged-in user
            set({ userId: currentUserId });
            state.fetchUserProgress(currentUserId);
          }
        } catch (e) {
          // Non-fatal: if something goes wrong, avoid breaking the UI
          console.error("ensureUser failed in stepStore:", e);
        }
      },

      setHollandResults: (results) => set({ hollandResults: results }),

      fetchUserProgress: async (userId) => {
        if (get().isInitialized) return;

        try {
          const { data, error } = await supabase
            .from("user_questionnaire_progress")
            .select("steps_progress")
            .eq("user_id", userId)
            .single();

          if (data && data.steps_progress) {
            set({ steps: data.steps_progress as Step[], isInitialized: true });
          } else if (error && error.code === "PGRST116") {
            // No record found, create one with initial steps
            const initialSteps = makeInitialSteps();
            set({ steps: initialSteps, isInitialized: true });

            const { error: insertError } = await supabase
              .from("user_questionnaire_progress")
              .insert({
                user_id: userId,
                steps_progress: initialSteps,
                updated_at: new Date().toISOString(),
              });

            if (insertError) {
              console.error(
                "Failed to create initial user progress:",
                insertError
              );
            }
          } else if (error) {
            throw error;
          }
        } catch (e) {
          console.error("Failed to fetch user progress:", e);
          // Fallback to default steps on error, but prevent looping
          if (!get().isInitialized) {
            set({ steps: makeInitialSteps(), isInitialized: true });
          }
        }
      },
    }),
    {
      name: "step-storage",
      version: 3,
      // Validate the hydrated state against the current user before the UI renders
      onRehydrateStorage: () => (state) => {
        // After hydration completes
        setTimeout(async () => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            const currentUserId = user?.id;
            const hydratedUserId = useStepStore.getState().userId;

            if (
              currentUserId &&
              hydratedUserId &&
              hydratedUserId !== currentUserId
            ) {
              // Different user -> fetch new user's progress
              useStepStore.getState().fetchUserProgress(currentUserId);
            } else if (currentUserId && !hydratedUserId) {
              // No user bound yet -> bind and fetch progress
              useStepStore.getState().fetchUserProgress(currentUserId);
            }
          } catch (e) {
            console.error("onRehydrateStorage user validation failed:", e);
          }
        });
      },
      // In case older persisted state didn't track user, migrate to include userId
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return { userId: undefined, hollandResults: null, ...persistedState };
        }
        if (version < 3) {
          return { hollandResults: null, ...persistedState };
        }
        return persistedState;
      },
    }
  )
);
