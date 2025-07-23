import { cn } from "@/lib/utils"

interface StepProgressProps {
  currentStep: number
  totalSteps: number
}

export default function StepProgress({
  currentStep,
  totalSteps,
}: StepProgressProps) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      {/* Progress text */}
      <div className="flex justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          שלב {currentStep} מתוך {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}% הושלם
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300",
                step === currentStep
                  ? "bg-blue-600 ring-4 ring-blue-100"
                  : step < currentStep
                  ? "bg-secondary"
                  : "bg-gray-200"
              )}
            />
            {step < totalSteps && (
              <div
                className={cn(
                  "h-1 w-full",
                  step < currentStep ? "bg-secondary" : "bg-gray-200"
                )}
                style={{ width: "100px" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
