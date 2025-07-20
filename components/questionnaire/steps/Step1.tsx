import { Button } from "@/components/ui/button"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { cn } from "@/lib/utils"
import PreMeetingQuestionnaire from "../PreMeetingQuestionnaire"

interface Step1Props {
  onNext: () => void
}

interface QuestionnaireAnswers {
  traits?: string[]
  anchors?: number[]
}

export default function Step1({ onNext }: Step1Props) {
  const { answers } = useQuestionnaireStore()
  const typedAnswers = answers as QuestionnaireAnswers

  const traitsCount = typedAnswers.traits?.length ?? 0
  const anchorsCount = typedAnswers.anchors?.filter((val) => val !== undefined)
    .length ?? 0

  const totalProgress = Math.round(
    ((traitsCount / 10 + anchorsCount / 18) / 2) * 100
  )

  const canContinue = traitsCount > 0 && anchorsCount === 18

  return (
    <div className="relative">
      <div className="mb-8 animate-in slide-in-from-top duration-700">
        <h1 className="text-3xl font-bold mb-4 text-center">
          שלב 1: הערכה מקצועית
        </h1>
        <p className="text-lg text-center max-w-2xl mx-auto text-gray-600">
          בחר את התכונות המאפיינות אותך וענה על שאלון הקריירה
        </p>
        {totalProgress > 0 && (
          <div className="mt-4 text-sm text-center text-gray-500">
            {totalProgress}% מהשאלון הושלם
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <PreMeetingQuestionnaire />

        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center">
            <div className="text-right">
              {!canContinue && (
                <ul className="text-red-500 text-sm list-disc list-inside">
                  {traitsCount === 0 && (
                    <li>יש לבחור לפחות תכונה אחת</li>
                  )}
                  {anchorsCount < 18 && (
                    <li>
                      יש להשלים את כל שאלון עוגני הקריירה (
                      {18 - anchorsCount} שאלות נותרו)
                    </li>
                  )}
                </ul>
              )}
              {canContinue && (
                <p className="text-green-600 text-sm">
                  ✓ כל הנתונים הוזנו בהצלחה
                </p>
              )}
            </div>
            <Button
              onClick={onNext}
              disabled={!canContinue}
              className={cn(
                "mr-4 transition-all duration-300",
                canContinue && "animate-pulse"
              )}
              aria-label={
                canContinue
                  ? "המשך לשלב הבא"
                  : "יש להשלים את כל השדות לפני המעבר לשלב הבא"
              }
            >
              המשך לשלב הבא
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
