import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP1_QUESTIONS } from "@/lib/constants/questions";
import { fetchStep1Answers } from "@/lib/utils/answerFetcher";
import { cn } from "@/lib/utils";
import type { AnswerState } from "@/lib/types/questionnaire";

// Define props for the selector to receive state and actions
interface TraitsSelectorProps {
  questions: { id: string; text: string }[];
  selectedTraitIds: string[];
  toggleTrait: (questionId: string) => Promise<void>;
  isLoading: boolean;
}

interface Step1Props {
  onNext: () => void;
}

import { motion, AnimatePresence } from "framer-motion";

export default function Step1({ onNext }: Step1Props) {
  const { setAnswer, isLoading: storeLoading } = useQuestionnaireStore();
  const [stepAnswers, setStepAnswers] = useState<Record<string, AnswerState>>(
    {}
  );
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Fetch answers directly from Supabase on component mount
  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = STEP1_QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep1Answers(questionIds);
        setStepAnswers(fetchedAnswers);
      } catch (error) {
        console.error("Error loading Step 1 answers:", error);
        setError("שגיאה בטעינת התשובות הקודמות");
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadStepAnswers();
  }, []);

  const selectedTraitIds = useMemo(() => {
    const selected = STEP1_QUESTIONS.filter((q) => {
      const answer = stepAnswers[q.id];
      if (!answer) return false;

      // Handle both string 'true' and boolean true values
      const value = answer.value;
      return value === "true" || value === true;
    }).map((q) => q.id);

    // Debug logging
    console.log("Step1 - stepAnswers:", stepAnswers);
    console.log("Step1 - selectedTraitIds:", selected);

    return selected;
  }, [stepAnswers]);

  const traitsCount = selectedTraitIds.length;
  const totalProgress = Math.min(Math.round((traitsCount / 10) * 100), 100);
  const canContinue =
    traitsCount > 0 &&
    traitsCount <= 10 &&
    !storeLoading &&
    !isUpdating &&
    !isLoadingAnswers;

  // Centralized function to handle trait toggling
  const toggleTrait = async (questionId: string) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      setError(null);

      const isCurrentlySelected = selectedTraitIds.includes(questionId);

      if (selectedTraitIds.length >= 10 && !isCurrentlySelected) {
        setError("ניתן לבחור עד 10 תכונות בלבד");
        return;
      }

      // The new value will be the opposite of the current selection state.
      const newValue = !isCurrentlySelected;
      await setAnswer(questionId, String(newValue), undefined, 1);

      // Update local state immediately for better UX
      setStepAnswers((prev) => ({
        ...prev,
        [questionId]: { value: String(newValue), timestamp: new Date() },
      }));
    } catch (err) {
      setError("שגיאה בשמירת הבחירה. נסה שנית.");
      console.error(
        `Error toggling trait for ID ${questionId}:`,
        JSON.stringify(err, Object.getOwnPropertyNames(err))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mt-6 mb-4 text-center">
            שלב 1: הערכה מקצועית
          </h1>
          <p className="text-lg text-center max-w-2xl mx-auto text-[color:var(--muted-foreground)]">
            בחר את התכונות המאפיינות אותך וענה על שאלון הקריירה
          </p>
          {totalProgress > 0 && (
            <div className="mt-4 text-sm text-center text-[color:var(--muted-foreground)]">
              {totalProgress}% מהשאלון הושלם
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-4xl mx-auto bg-[color:var(--card)] rounded-lg shadow-lg p-6"
        >
          <TraitsSelector
            questions={STEP1_QUESTIONS}
            selectedTraitIds={selectedTraitIds}
            toggleTrait={toggleTrait}
            isLoading={isUpdating}
          />

          {/* Status Messages */}
          <div className="mt-6 text-center">
            {error && (
              <p className="text-[color:var(--destructive)] text-sm">{error}</p>
            )}
            {!canContinue && !error && (
              <ul className="text-[color:var(--destructive)] text-sm list-disc list-inside">
                {traitsCount === 0 && <li>יש לבחור לפחות תכונה אחת</li>}
              </ul>
            )}
            {canContinue && !error && (
              <p className="text-[color:var(--primary)] text-sm">
                ✓ כל הנתונים הוזנו בהצלחה
              </p>
            )}
          </div>

          {/* Navigation Buttons - Consistent across all steps */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center mx-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="text-xs"
                >
                  🔄 Restart Quiz (Dev)
                </Button>
              </div>
              <Button
                onClick={onNext}
                disabled={!canContinue}
                className="px-8 py-3 text-lg font-semibold"
                size="lg"
              >
                המשך לשלב הבא
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const TRAITS: string[] = [
  "חשיבה יצירתית",
  "יכולת הנהגה",
  "סדר ודיוק",
  "עבודה בצוות",
  "קבלת החלטות",
  "למידה מהירה",
  "הובלת תהליכים",
  "יחסי אנוש מצוינים",
  "מחויבות",
  "גישה שירותית",
  "רגישות",
  "חריצות",
  "מודעות עצמית",
  "יזמות",
  "כאריזמה",
  "מנהיגות",
  "לקיחת אחריות",
  "אומץ",
  "נחישות",
  "משפחתי",
  "ידיים טובות",
  "טכנולוגי",
  "יעילות",
  '"מתקתק" דברים',
  "אינטליגנציה רגשית",
  "אינטלקט מפותח",
  "חברותי",
  "סקרנות",
  "זריזות מחשבתית",
  "חמימות",
  "יכולת הקשבה",
  "כשרון אומנותי",
  "בטחון עצמי",
  "צניעות",
  "מראה אסתטי",
  "אסרטיבי",
  "אמינות",
  "פתיחות",
  "נאמנות",
  "מקוריות",
  "אופטימיות",
  "יצירתיות",
  "אהבה לבעלי חיים",
  "חוש הומור",
  "אופנתיות וסטייל",
  "רוחניות",
  "שאפתנות",
  "אותנטיות",
  "משיכה לטבע",
  "הורות טובה",
  "כח פיזי",
  "חיבור לשפע",
  "ביצועיסט",
  "נמרצות אנרגטיות",
  "חשיבה אנליטית",
  "ייצוגיות",
  "חדות",
  "חושניות",
];

function TraitsSelector({
  questions,
  selectedTraitIds,
  toggleTrait,
  isLoading,
}: TraitsSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [focusedTrait, setFocusedTrait] = useState<number>(-1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLoading) return;

      if ((e.key === " " || e.key === "Enter") && focusedTrait !== -1) {
        e.preventDefault();
        toggleTrait(questions[focusedTrait].id);
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedTrait((prev) => Math.min(prev + 1, questions.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedTrait((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusedTrait, isLoading, toggleTrait]);

  return (
    <section className="space-y-10" dir="rtl">
      <div className="space-y-4" role="region" aria-label="בחירת תכונות">
        <h2 className="text-xl font-semibold text-right">
          בחר/י עד 10 תכונות המתארות אותך
        </h2>
        <p
          className="text-sm text-muted-foreground text-right"
          aria-live="polite"
        >
          נבחרו {selectedTraitIds.length} מתוך 10 תכונות אפשריות
        </p>
        <div className="text-xs text-muted-foreground mb-2">
          ניתן ללחוץ על החץ למעלה/למטה לניווט, SPACE לבחירה
        </div>
        <div
          className={cn(
            "grid gap-4 transition-opacity duration-200",
            isLoading && "opacity-50"
          )}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {questions.map((question, index) => (
            <Card
              key={question.id}
              className={cn(
                "cursor-pointer transition-all duration-200",
                selectedTraitIds.includes(question.id)
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:shadow-md hover:scale-[1.02]",
                focusedTrait === index && "ring-2 ring-primary",
                !mounted && "opacity-0"
              )}
              onClick={() => toggleTrait(question.id)}
              onFocus={() => setFocusedTrait(index)}
              onBlur={() => setFocusedTrait(-1)}
              tabIndex={0}
              role="checkbox"
              aria-checked={selectedTraitIds.includes(question.id)}
            >
              <CardHeader className="flex items-center justify-between p-4">
                <span>{question.text}</span>
                <Checkbox
                  checked={selectedTraitIds.includes(question.id)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none"
                  disabled={isLoading}
                />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
