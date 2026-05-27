import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP4_QUESTIONS } from "@/lib/constants/questions";
import { cn } from "@/lib/utils";

interface Step4Props {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void> | void;
}

function initialAnchorValue(value: unknown): number {
  const parsed =
    typeof value === "string"
      ? parseInt(value, 10)
      : typeof value === "number"
      ? value
      : NaN;

  return Number.isNaN(parsed) ? 5 : Math.min(10, Math.max(0, parsed));
}

export default function Step4({ onNext, onPrevious, onComplete }: Step4Props) {
  const { answers, setAnswer } = useQuestionnaireStore();
  const [current, setCurrent] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAnchors, setLocalAnchors] = useState<number[]>(() =>
    STEP4_QUESTIONS.map((question) =>
      initialAnchorValue(answers[question.id]?.value)
    )
  );

  const currentQuestion = STEP4_QUESTIONS[current];

  const updateCurrentAnchor = (value: number[]) => {
    setLocalAnchors((previous) => {
      const next = [...previous];
      next[current] = value[0];
      return next;
    });
  };

  const saveCurrentAnswer = async () => {
    await setAnswer(
      currentQuestion.id,
      String(localAnchors[current]),
      undefined,
      4
    );
  };

  const handlePrevious = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveCurrentAnswer();
      if (current === 0) {
        onPrevious();
      } else {
        setCurrent((index) => index - 1);
      }
    } catch (err) {
      console.error("Error saving Step 4 answer:", err);
      setError("שגיאה בשמירת התשובה. נסה שנית.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await saveCurrentAnswer();

      if (current < STEP4_QUESTIONS.length - 1) {
        setCurrent((index) => index + 1);
        return;
      }

      await onComplete();
      onNext();
    } catch (err) {
      console.error("Error saving Step 4 answer:", err);
      setError("שגיאה בשמירת התשובה. נסה שנית.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold mt-6 mb-4 text-center"
      >
        עוגני קריירה
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-2 mb-4 text-center"
      >
        <span className="text-lg font-semibold">
          שאלה {current + 1} / {STEP4_QUESTIONS.length}
        </span>
        <p className="text-sm text-muted-foreground">
          דרגו עד כמה המשפט נכון עבורכם: 0 = בכלל לא נכון, 10 = נכון מאוד
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={cn(
              "max-w-xl mx-auto p-6 mb-6 bg-white text-background",
              isSaving && "opacity-60"
            )}
          >
            <CardContent className="p-0">
              <p className="mb-8 font-medium text-lg leading-relaxed text-right">
                {currentQuestion.text}
              </p>

              <div className="rounded-lg bg-gray-50 px-4 py-5">
                <div className="mb-5 text-center">
                  <span
                    className="inline-flex min-w-12 items-center justify-center rounded-full bg-primary px-4 py-2 text-xl font-semibold text-primary-foreground"
                    aria-live="polite"
                  >
                    {localAnchors[current]}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[localAnchors[current]]}
                  onValueChange={updateCurrentAnchor}
                  disabled={isSaving}
                  aria-label={currentQuestion.text}
                />
                <ol
                  className="flex justify-between text-[11px] mt-2 text-gray-600"
                  dir="ltr"
                >
                  {Array.from({ length: 11 }, (_, value) => (
                    <li key={value} className="w-4 text-center">
                      {value}
                    </li>
                  ))}
                </ol>
                <div className="flex justify-between text-xs mt-3 text-gray-700">
                  <span>נכון מאוד</span>
                  <span>בכלל לא נכון</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {error && (
        <p role="alert" className="text-center text-red-600 mb-4">
          {error}
        </p>
      )}

      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mx-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isSaving}
          >
            {current === 0 ? "שלב קודם" : "שאלה קודמת"}
          </Button>
          <Button onClick={handleNext} disabled={isSaving}>
            {isSaving
              ? "שומר..."
              : current < STEP4_QUESTIONS.length - 1
              ? "שאלה הבאה"
              : "המשך לשלב הבא"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
