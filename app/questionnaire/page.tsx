"use client"

import Step1 from "@/components/questionnaire/steps/Step1"
import Step2 from "@/components/questionnaire/steps/Step2"
import Step3 from "@/components/questionnaire/steps/Step3"
import QuestionnaireProgress from "@/components/ui/QuestionnaireProgress"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { useStepStore } from "@/lib/stores/stepStore"
import { useEffect, useState } from "react"
import KeyboardShortcuts from "@/components/questionnaire/KeyboardShortcuts"

export default function QuestionnairePage() {
  const {
    setAnswer,
    getProgress,
    validateStep,
    currentStep,
    initialize,
    reset,
    isLoading,
  } = useQuestionnaireStore()
  const { steps } = useStepStore()
  const [mounted, setMounted] = useState(false)

  // Progress calculation based on step store (shared with dashboard)
  const completedSteps = steps.filter((step: any) => step.isCompleted).length
  const totalSteps = steps.length || 5
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  useEffect(() => {
    const init = async () => {
      try {
        // Try to initialize questionnaire, but don't block on database errors
        await initialize()
      } catch (error) {
        console.warn(
          "Failed to initialize questionnaire from database, continuing with local state:",
          error
        )
        // Continue anyway - the store will work with local state
      } finally {
        setMounted(true)
      }
    }
    init()
  }, [initialize])

  // Show loading skeleton
  if (!mounted) {
    return (
      <div className="container mx-auto pb-8 px-4 min-h-screen pt-40">
        <div className="max-w-4xl mx-auto mt-12">
          {/* Progress bar skeleton */}
          <div className="mb-8">
            <div className="h-2  bg-gray-200 rounded">
              <div
                className="h-full bg-blue-500 rounded animate-pulse"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>
                {completedSteps} מתוך {totalSteps} שלבים הושלמו
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white">
      {/* Main content */}
      <div className="container mx-auto py-8 px-4 min-h-screen pt-24">
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <QuestionnaireProgress
            value={progressPercentage}
            completed={completedSteps}
            total={totalSteps}
          />
        </div>

        {/* Current step */}
        <div className="animate-in slide-in-from-top">
          {currentStep === 1 && (
            <Step1
              onNext={async () => {
                const validation = validateStep(currentStep)
                if (validation.isValid) {
                  // Mark this step as completed in the dashboard store
                  // and advance to the next step
                  try {
                    // Dynamically import to avoid circular dependency
                    const { useStepStore } = await import(
                      "@/lib/stores/stepStore"
                    )
                    useStepStore.getState().setStepCompletion(currentStep, true)
                  } catch (e) {
                    console.error(
                      "Failed to mark step as completed in dashboard:",
                      e
                    )
                  }
                  useQuestionnaireStore
                    .getState()
                    .setCurrentStep(currentStep + 1)
                } else {
                  console.error("Validation errors:", validation.errors)
                }
              }}
            />
          )}
          {currentStep === 2 && (
            <Step2
              onNext={async () => {
                const validation = validateStep(currentStep)
                if (validation.isValid) {
                  try {
                    const { useStepStore } = await import(
                      "@/lib/stores/stepStore"
                    )
                    useStepStore.getState().setStepCompletion(currentStep, true)
                  } catch (e) {
                    console.error(
                      "Failed to mark step as completed in dashboard:",
                      e
                    )
                  }
                  useQuestionnaireStore
                    .getState()
                    .setCurrentStep(currentStep + 1)
                } else {
                  console.error("Validation errors:", validation.errors)
                }
              }}
              onPrevious={() => {
                useQuestionnaireStore.getState().setCurrentStep(currentStep - 1)
              }}
            />
          )}
          {currentStep === 3 && (
            <Step3
              onNext={async () => {
                const validation = validateStep(currentStep)
                if (validation.isValid) {
                  try {
                    const { useStepStore } = await import(
                      "@/lib/stores/stepStore"
                    )
                    useStepStore.getState().setStepCompletion(currentStep, true)
                  } catch (e) {
                    console.error(
                      "Failed to mark step as completed in dashboard:",
                      e
                    )
                  }
                  useQuestionnaireStore
                    .getState()
                    .setCurrentStep(currentStep + 1)
                } else {
                  console.error("Validation errors:", validation.errors)
                }
              }}
              onPrevious={() => {
                useQuestionnaireStore.getState().setCurrentStep(currentStep - 1)
              }}
            />
          )}
          {/* Add Step4, Step5, etc. here as needed */}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="hidden sm:fixed bottom-4 right-4 z-50">
       
        <KeyboardShortcuts />
      </div>
    </div>
  )
}
