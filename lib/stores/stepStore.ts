import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Step {
  id: number
  isCompleted: boolean
  isLocked: boolean
}

interface StepState {
  steps: Step[]
  setStepCompletion: (stepId: number, isCompleted: boolean) => void
  initializeSteps: () => void
  resetSteps: () => void
  resetFromStep: (stepId: number) => void
}

export const useStepStore = create<StepState>()(
  persist(
    (set) => ({
      steps: [],

      setStepCompletion: (stepId, isCompleted) =>
        set((state) => {
          const newSteps = state.steps.map((step) => {
            // Update the target step
            if (step.id === stepId) {
              return { ...step, isCompleted }
            }
            
            // If completing a step, unlock the next step
            if (step.id === stepId + 1 && isCompleted) {
              return { ...step, isLocked: false }
            }

            // If un-completing a step, lock and un-complete all following steps
            if (step.id > stepId && !isCompleted) {
              return { ...step, isLocked: true, isCompleted: false }
            }

            return step
          })
          return { steps: newSteps }
        }),

      resetFromStep: (stepId) =>
        set((state) => {
          const newSteps = state.steps.map((step) => {
            if (step.id >= stepId) {
              return {
                ...step,
                isCompleted: false,
                isLocked: step.id > stepId
              }
            }
            return step
          })
          return { steps: newSteps }
        }),

      resetSteps: () =>
        set((state) => ({
          steps: state.steps.map((step, index) => ({
            ...step,
            isCompleted: false,
            isLocked: index > 0
          }))
        })),

      initializeSteps: () =>
        set({
          steps: [
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
          ],
        }),
    }),
    {
      name: 'step-storage',
    }
  )
)
