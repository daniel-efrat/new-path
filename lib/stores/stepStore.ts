import { create } from "zustand";
import { persist } from "zustand/middleware";
import supabase from "@/lib/supabase";

interface Step {
  id: number;
  isCompleted: boolean;
  isLocked: boolean;
  flowVersion?: number;
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
  initializeSteps: () => Promise<void>;
  resetSteps: () => void;
  resetProgress: () => Promise<void>;
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

const CURRENT_FLOW_VERSION = 5;

const makeInitialSteps = () =>
  Array.from({ length: 13 }, (_, index) => ({
    id: index + 1,
    isCompleted: false,
    isLocked: index > 0,
    flowVersion: CURRENT_FLOW_VERSION,
  }));

function remapLegacySteps(persistedSteps: Step[]) {
  if (
    persistedSteps.length > 0 &&
    persistedSteps.every((step) => step.flowVersion === CURRENT_FLOW_VERSION)
  ) {
    return persistedSteps;
  }

  const byOldId = new Map(persistedSteps.map((step) => [step.id, step]));
  const isOldComplete = (id: number) => byOldId.get(id)?.isCompleted === true;

  const completedByNewStep: Record<number, boolean> = {
    1: isOldComplete(1),
    2: isOldComplete(5),
    3: isOldComplete(6),
    4: isOldComplete(2),
    5: isOldComplete(7) && isOldComplete(8),
    6: isOldComplete(9),
    7: isOldComplete(10),
    8: isOldComplete(11),
    9: isOldComplete(12),
    10: isOldComplete(3),
    11: isOldComplete(4),
    12: isOldComplete(13),
    13: false,
  };

  let locked = false;
  return makeInitialSteps().map((step) => {
    const isCompleted = completedByNewStep[step.id] === true;
    const next = {
      ...step,
      isCompleted,
      isLocked: step.id === 1 ? false : locked,
    };
    if (!isCompleted) locked = true;
    return next;
  });
}

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
          const nextStepId = stepId + 1;
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

        // Persist before allowing the next step to render so writes cannot land
        // out of order and restore an older lock state.
        const userId = state.userId;
        if (userId) {
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
        } else {
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

      resetSteps: () =>
        set({
          steps: makeInitialSteps(),
          isInitialized: false,
          hollandResults: null,
        }),

      resetProgress: async () => {
        const initialSteps = makeInitialSteps();
        const userId = get().userId;
        set({ steps: initialSteps, isInitialized: true, hollandResults: null });

        if (!userId) return;

        const { error } = await supabase
          .from("user_questionnaire_progress")
          .upsert(
            {
              user_id: userId,
              steps_progress: initialSteps,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id", ignoreDuplicates: false }
          );

        if (error) {
          console.error("Failed to reset progress:", error);
        }
      },

      initializeSteps: async () => {
        const userId = get().userId;
        if (userId) {
          await get().fetchUserProgress(userId);
        } else {
          set({ steps: makeInitialSteps(), isInitialized: true });
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
          if (!currentUserId) {
            set({
              steps: makeInitialSteps(),
              userId: undefined,
              isInitialized: false,
              hollandResults: null,
            });
          } else if (state.userId !== currentUserId) {
            // Never render state hydrated for a different signed-in user.
            set({
              steps: makeInitialSteps(),
              userId: currentUserId,
              isInitialized: false,
              hollandResults: null,
            });
            await get().fetchUserProgress(currentUserId);
          } else if (!state.isInitialized) {
            await get().fetchUserProgress(currentUserId);
          }
        } catch (e) {
          // Non-fatal: if something goes wrong, avoid breaking the UI
          console.error("ensureUser failed in stepStore:", e);
        }
      },

      setHollandResults: (results) => set({ hollandResults: results }),

      fetchUserProgress: async (userId) => {
        if (get().userId !== userId || get().isInitialized) return;

        try {
          const { data, error } = await supabase
            .from("user_questionnaire_progress")
            .select("steps_progress")
            .eq("user_id", userId)
            .maybeSingle();

          if (data && data.steps_progress) {
            const persistedSteps = remapLegacySteps(data.steps_progress as Step[]);
            const defaultSteps = makeInitialSteps();

            // Merge persisted steps with defaults so newly added steps
            // (e.g., step 13) are always present in the store.
            const mergedSteps: Step[] = defaultSteps.map((defaultStep) => {
              const existing = persistedSteps.find(
                (step) => step.id === defaultStep.id
              );
              return existing ?? defaultStep;
            });

            if (get().userId !== userId) return;
            set({ steps: mergedSteps, isInitialized: true });

            // Optionally persist the merged structure back so future loads
            // already include the new steps.
            try {
              const { error: updateError } = await supabase
                .from("user_questionnaire_progress")
                .update({
                  steps_progress: mergedSteps,
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId);

              if (updateError) {
                console.error(
                  "Failed to update merged user progress:",
                  updateError
                );
              }
            } catch (mergeError) {
              console.error("Exception while updating merged progress:", {
                message: (mergeError as any)?.message ?? String(mergeError),
              });
            }
          } else if (!error) {
            // No record found. Upsert makes concurrent initialization safe.
            const initialSteps = makeInitialSteps();
            if (get().userId !== userId) return;
            set({ steps: initialSteps, isInitialized: true });

            const { error: insertError } = await supabase
              .from("user_questionnaire_progress")
              .upsert(
                {
                  user_id: userId,
                  steps_progress: initialSteps,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id", ignoreDuplicates: true }
              );

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
          if (get().userId === userId && !get().isInitialized) {
            set({ steps: makeInitialSteps(), isInitialized: true });
          }
        }
      },
    }),
    {
      name: "step-storage",
      version: 4,
      // Progress is server-backed; do not retain user data in shared browser storage.
      partialize: (state) => ({ userId: state.userId }),
      // Validate the hydrated state against the current user before the UI renders
      onRehydrateStorage: () => (_state) => {
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
              await useStepStore.getState().ensureUser(currentUserId);
            } else if (currentUserId && !hydratedUserId) {
              await useStepStore.getState().ensureUser(currentUserId);
            }
          } catch (e) {
            console.error("onRehydrateStorage user validation failed:", e);
          }
        });
      },
      // Discard older locally stored progress so it cannot cross identities.
      migrate: (_persistedState: any, version: number) => {
        if (version < 4) {
          return {
            steps: makeInitialSteps(),
            userId: undefined,
            isInitialized: false,
            hollandResults: null,
          };
        }
        return _persistedState;
      },
    }
  )
);
