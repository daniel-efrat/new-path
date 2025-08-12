import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP4_QUESTIONS } from "@/lib/constants/questions";
import { cn } from "@/lib/utils";

interface Step4Props {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step4({ onNext, onPrevious }: Step4Props) {
  const { answers, setAnswer } = useQuestionnaireStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Local state for anchors - start with stored values or defaults
  const [localAnchors, setLocalAnchors] = useState<number[]>(() => {
    // Initialize with stored values from individual question IDs or defaults
    return STEP4_QUESTIONS.map((question) => {
      const storedAnswer = answers[question.id];
      if (storedAnswer && storedAnswer.value !== undefined) {
        const value =
          typeof storedAnswer.value === "string"
            ? parseInt(storedAnswer.value)
            : storedAnswer.value;
        return isNaN(value) ? 5 : value;
      }
      return 5; // Default value
    });
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local state only (no DB save)
  const updateAnchor = (index: number, value: number[]) => {
    const newAnchors = [...localAnchors];
    newAnchors[index] = value[0];
    setLocalAnchors(newAnchors);
  };

  const handleNext = () => {
    // Navigate immediately
    onNext();

    // Save answers in the background
    const saveAnswersInBackground = async () => {
      try {
        // Save each anchor value as individual question ID
        for (let i = 0; i < STEP4_QUESTIONS.length; i++) {
          const questionId = STEP4_QUESTIONS[i].id;
          const value = localAnchors[i];
          // The setAnswer function will handle its own errors, no need to await
          setAnswer(questionId, String(value), undefined, 4);
        }
      } catch (err) {
        // Since this runs in the background, we can't set state on an unmounted component.
        // We'll log the error for debugging.
        console.error("Error saving Step 4 answers in the background:", err);
      }
    };

    saveAnswersInBackground();
  };

  if (error) {
    return (
      <motion.div
        role="alert"
        className="p-4 bg-red-50 text-red-700 rounded-md"
        aria-live="polite"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm underline hover:text-red-800"
        >
          נסה שנית
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        שלב 4: עוגני קריירה
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg mb-8 text-center max-w-2xl mx-auto space-y-4"
      >
        <p>לפניכם שאלון. ענו עליו בכנות.</p>
        <p>
          השתדלו לא להיות "גיבורי על", אלא התחברו למה שמושך אתכם באופן טבעי
          ומעסיק את מחשבתכם.
        </p>
        <p>
          סמנו מספר בין 0 ל-10 ליד כל משפט, שמבטא את המידה בה תוכן המשפט נכון
          עבורכם:
        </p>
        <p>
          <strong>0 = בכלל לא נכון</strong>
        </p>
        <p>
          <strong>10 = נכון מאוד</strong>
        </p>
      </motion.div>
      <Card className="max-w-3xl mx-auto bg-white p-6">
        <div
          className={cn(
            "space-y-6 transition-opacity duration-200",
            isLoading && "opacity-50"
          )}
        >
          {STEP4_QUESTIONS.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.05, duration: 0.5 }}
            >
              <Card
                className={cn(
                  "p-4 transition-all duration-200 hover:shadow-md"
                )}
              >
                <CardHeader className="flex justify-between items-start">
                  <p className="font-medium leading-relaxed text-right">
                    {q.text}
                  </p>
                </CardHeader>
                <CardContent>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[localAnchors[idx]]}
                    onValueChange={(val: number[]) => updateAnchor(idx, val)}
                    disabled={isLoading}
                    aria-label={q.text}
                  />
                  <ul
                    className="flex justify-between text-[10px] mt-1 rtl:space-x-reverse"
                    dir="ltr"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <li key={i} className="w-4 text-center">
                        {i}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-xs mt-1 rtl:space-x-reverse">
                    <span>נכון מאוד</span>
                    <span>לא נכון בכלל</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Navigation Buttons - Consistent across all steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5 + STEP4_QUESTIONS.length * 0.05,
            duration: 0.5,
          }}
          className="flex justify-between items-center mt-8 mx-4"
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={onPrevious}>
              שלב קודם
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              🔄 Restart Quiz (Dev)
            </Button>
          </div>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? "שומר..." : "המשך לשלב הבא"}
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}
