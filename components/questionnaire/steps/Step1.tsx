import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { QUESTIONNAIRE_CONFIG } from "@/lib/constants/questionnaire";
import { STEP1_QUESTIONS } from "@/lib/constants/questions";
import { fetchStep1Answers } from "@/lib/utils/answerFetcher";
import { cn } from "@/lib/utils";
import type { AnswerState } from "@/lib/types/questionnaire";
import { X } from "lucide-react";

// Define props for the selector to receive state and actions
interface TraitsSelectorProps {
  questions: { id: string; text: string }[];
  selectedTraitIds: string[];
  toggleTrait: (questionId: string) => Promise<void>;
  pendingTraitIds: Set<string>;
}

interface Step1Props {
  onNext: () => void;
  onComplete: () => Promise<void> | void;
}

import { motion, AnimatePresence } from "framer-motion";

export default function Step1({ onNext, onComplete }: Step1Props) {
  const { setAnswer, isLoading: storeLoading } = useQuestionnaireStore();
  const [stepAnswers, setStepAnswers] = useState<Record<string, AnswerState>>(
    {}
  );
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [pendingTraitIds, setPendingTraitIds] = useState<Set<string>>(
    () => new Set()
  );
  const [error, setError] = useState<string | null>(null);

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

    return selected;
  }, [stepAnswers]);

  const traitsCount = selectedTraitIds.length;
  const maxTraits = QUESTIONNAIRE_CONFIG.MAX_TRAITS;
  const totalProgress = Math.min(
    Math.round((traitsCount / maxTraits) * 100),
    100
  );
  const canContinue =
    traitsCount > 0 &&
    traitsCount <= maxTraits &&
    !storeLoading &&
    pendingTraitIds.size === 0 &&
    !isLoadingAnswers;

  // Centralized function to handle trait toggling
  const toggleTrait = async (questionId: string) => {
    if (pendingTraitIds.has(questionId)) return;

    const isCurrentlySelected = selectedTraitIds.includes(questionId);

    if (selectedTraitIds.length >= maxTraits && !isCurrentlySelected) {
      setError(`ניתן לבחור עד ${maxTraits} תכונות בלבד`);
      return;
    }

    const previousAnswer = stepAnswers[questionId];
    const newValue = !isCurrentlySelected;

    setError(null);
    setPendingTraitIds((prev) => new Set(prev).add(questionId));
    setStepAnswers((prev) => ({
      ...prev,
      [questionId]: { value: String(newValue), timestamp: new Date() },
    }));

    try {
      await setAnswer(questionId, String(newValue), undefined, 1);
    } catch (err) {
      setError("שגיאה בשמירת הבחירה. נסה שנית.");
      setStepAnswers((prev) => {
        const next = { ...prev };
        if (previousAnswer) {
          next[questionId] = previousAnswer;
        } else {
          delete next[questionId];
        }
        return next;
      });
      console.error(
        `Error toggling trait for ID ${questionId}:`,
        JSON.stringify(err, Object.getOwnPropertyNames(err))
      );
    } finally {
      setPendingTraitIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  const handleContinue = async () => {
    await onComplete();
    onNext();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
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
            שלב 1: תכונות ליבה
          </h1>
          <p className="text-lg text-center max-w-2xl mx-auto text-[color:var(--muted-foreground)]">
            סמנ/י את החוזקות האישיות המובילות שלך
          </p>
          {totalProgress > 0 && (
            <div className="mt-4 text-sm text-center text-[color:var(--muted-foreground)]">
              {totalProgress}% מהשאלון הושלם
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-4xl mx-auto bg-[color:var(--card)] rounded-lg shadow-lg p-6"
        >
          <TraitsSelector
            questions={STEP1_QUESTIONS}
            selectedTraitIds={selectedTraitIds}
            toggleTrait={toggleTrait}
            pendingTraitIds={pendingTraitIds}
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
            <div className="flex justify-end items-center mx-4">
              <Button
                onClick={handleContinue}
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
  pendingTraitIds,
}: TraitsSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [focusedTrait, setFocusedTrait] = useState<number>(-1);
  const selectedTraits = questions.filter((question) =>
    selectedTraitIds.includes(question.id)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && focusedTrait !== -1) {
        e.preventDefault();
        const questionId = questions[focusedTrait].id;
        if (!pendingTraitIds.has(questionId)) {
          toggleTrait(questionId);
        }
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
  }, [focusedTrait, pendingTraitIds, questions, toggleTrait]);

  return (
    <section className="space-y-4" dir="rtl">
      <div className="space-y-4" role="region" aria-label="בחירת תכונות">
        <div className="fixed left-1/2 top-32 z-40 max-h-[42vh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 overflow-y-auto rounded-lg border border-primary/20 bg-card/95 p-3 text-right shadow-lg shadow-blue-950/10 backdrop-blur">
          <h2 className="text-xl font-semibold">
            בחר/י עד {QUESTIONNAIRE_CONFIG.MAX_TRAITS} תכונות המתארות אותך
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            נבחרו {selectedTraitIds.length} מתוך{" "}
            {QUESTIONNAIRE_CONFIG.MAX_TRAITS} תכונות אפשריות
          </p>
          {selectedTraits.length > 0 && (
            <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="mb-2 text-sm font-semibold text-primary">
                התכונות שבחרת
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTraits.map((trait) => {
                  const isPending = pendingTraitIds.has(trait.id);
                  return (
                    <button
                      key={trait.id}
                      type="button"
                      onClick={() => toggleTrait(trait.id)}
                      disabled={isPending}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background px-3 py-1 text-sm text-foreground transition-colors hover:bg-primary/10",
                        isPending && "cursor-wait opacity-60"
                      )}
                      aria-label={`הסר ${trait.text}`}
                    >
                      {trait.text}
                      <span
                        aria-hidden="true"
                        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground"
                      >
                        <X className="size-3.5" strokeWidth={2.5} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            ניתן ללחוץ על החץ למעלה/למטה לניווט, SPACE לבחירה
          </div>
        </div>
        <div
          aria-hidden="true"
          className={selectedTraits.length > 0 ? "h-40 sm:h-36" : "h-28"}
        />
        <div
          className="grid gap-4 transition-opacity duration-200"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {questions.map((question, index) => {
            const isSelected = selectedTraitIds.includes(question.id);
            const isPending = pendingTraitIds.has(question.id);
            return (
              <Card
                key={question.id}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  isSelected
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md hover:scale-[1.02]",
                  focusedTrait === index && "ring-2 ring-primary",
                  isPending && "cursor-wait opacity-60",
                  !mounted && "opacity-0"
                )}
                onClick={() => {
                  if (!isPending) toggleTrait(question.id);
                }}
                onFocus={() => setFocusedTrait(index)}
                onBlur={() => setFocusedTrait(-1)}
                tabIndex={0}
                role="checkbox"
                aria-checked={isSelected}
                aria-busy={isPending}
              >
                <CardHeader className="flex items-center justify-between p-4">
                  <span>{question.text}</span>
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none"
                    disabled={isPending}
                  />
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
