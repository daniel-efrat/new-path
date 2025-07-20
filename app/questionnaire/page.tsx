"use client"

import Step1 from "@/components/questionnaire/steps/Step1"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { useEffect, useState } from "react"
import KeyboardShortcuts from "@/components/questionnaire/KeyboardShortcuts"

export default function QuestionnairePage() {
  const { setAnswer, getProgress, validateStep, currentStep, initializeQuestionnaire, isLoading } = useQuestionnaireStore()
  const [mounted, setMounted] = useState(false)

  // Get progress for the loading state - with fallback
  let progress
  try {
    progress = getProgress()
  } catch (error) {
    console.error("Error getting progress:", error)
    progress = { percentage: 0, completed: 0, total: 5, currentStep: 1, totalSteps: 5, completedSteps: 0, stepProgress: {} }
  }

  useEffect(() => {
    const init = async () => {
      try {
        // Try to initialize questionnaire, but don't block on database errors
        await initializeQuestionnaire()
      } catch (error) {
        console.warn("Failed to initialize questionnaire from database, continuing with local state:", error)
        // Continue anyway - the store will work with local state
      } finally {
        setMounted(true)
      }
    }
    init()
  }, [initializeQuestionnaire])

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
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
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
          <div 
            className="h-2 bg-gray-200 rounded overflow-hidden mt-4"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
          >
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-500">
              {progress.completed} מתוך {progress.total} פריטים הושלמו
            </span>
            <span className="text-sm font-medium" aria-live="polite">
              {progress.percentage}%
            </span>
          </div>
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
                    const { useStepStore } = await import("@/lib/stores/stepStore");
                    useStepStore.getState().setStepCompletion(currentStep, true);
                  } catch (e) {
                    console.error("Failed to mark step as completed in dashboard:", e);
                  }
                  useQuestionnaireStore.getState().setCurrentStep(currentStep + 1)
                } else {
                  console.error("Validation errors:", validation.errors)
                }
              }}
            />
          )}
          {currentStep === 2 && (
            <div className="text-center py-20 text-2xl font-bold">
              שלב 2: (placeholder) השלב הבא בטופס
            </div>
          )}
          {/* Add Step3, Step4, etc. here as needed */}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts />

      {/* Mobile instruction text */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t text-center text-sm text-gray-500"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        ניתן להשתמש במקשי המספרים לבחירת ערכים בסולם 0-10
      </div>
    </div>
  )
}
