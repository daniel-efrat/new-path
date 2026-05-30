"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronRight, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP11_QUESTIONS } from "@/lib/constants/questions";
import { cn } from "@/lib/utils";

interface Step11Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
}

const ANSWER_STEP_NUMBER = 3;
const AUTO_ADVANCE_MS = 300;
const INTRO_PREVIEW_VALUE = 3;
const REQUIRED_ANSWER_MESSAGE = "יש לבחור תשובה לפני המעבר לשאלה הבאה.";
const SAVE_ERROR_MESSAGE =
  "לא הצלחנו לשמור את התשובה. בדקו את החיבור ונסו שוב.";
const SUBMIT_ERROR_MESSAGE = "לא הצלחנו לחשב את תוצאות הולנד. נסו שוב.";

const RATING_OPTIONS = [
  { src: "/slice1.png", label: "אוהב מאוד", val: 5 },
  { src: "/slice2.png", label: "אוהב", val: 4 },
  { src: "/slice3.png", label: "לא בטוח", val: 3 },
  { src: "/slice4.png", label: "לא אוהב", val: 2 },
  { src: "/slice5.png", label: "לא אוהב בכלל", val: 1 },
] as const;

const ratingContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
} as const;

const ratingItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
} as const;

function toRatingValue(stored: unknown): number | undefined {
  if (
    stored === undefined ||
    stored === null ||
    stored === "" ||
    stored === "null"
  ) {
    return undefined;
  }

  const numericValue = Number(stored);

  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
    return undefined;
  }

  return numericValue;
}

export default function Step11({ onNext, onComplete }: Step11Props) {
  const { answers, setAnswer, submitAnswers } = useQuestionnaireStore();
  const [index, setIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [resumeChecked, setResumeChecked] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, number>>({});
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion = STEP11_QUESTIONS[index];
  const currentQuestionId = currentQuestion?.id;

  const savedValues = useMemo(() => {
    const values: Record<string, number> = {};

    for (const question of STEP11_QUESTIONS) {
      const rating = toRatingValue(answers[question.id]?.value);
      if (rating !== undefined) {
        values[question.id] = rating;
      }
    }

    return values;
  }, [answers]);

  useEffect(() => {
    setLocalValues((previousValues) => ({
      ...savedValues,
      ...previousValues,
    }));
  }, [savedValues]);

  useEffect(() => {
    if (resumeChecked) return;

    const answeredIds = Object.keys(savedValues);
    if (answeredIds.length > 0) {
      const firstUnansweredIndex = STEP11_QUESTIONS.findIndex(
        (question) => savedValues[question.id] === undefined
      );
      setIndex(
        firstUnansweredIndex === -1
          ? STEP11_QUESTIONS.length - 1
          : firstUnansweredIndex
      );
      setShowIntro(false);
    }

    setResumeChecked(true);
  }, [resumeChecked, savedValues]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearAutoAdvance(), [clearAutoAdvance]);

  useEffect(() => {
    if (!isSaving && !isFinishing) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaving, isFinishing]);

  const getQuestionValue = useCallback(
    (questionId: string) =>
      localValues[questionId] ?? toRatingValue(answers[questionId]?.value),
    [answers, localValues]
  );

  const answeredCount = useMemo(
    () => Object.keys(savedValues).length,
    [savedValues]
  );

  const progressPercentage = Math.round(
    ((index + 1) / STEP11_QUESTIONS.length) * 100
  );

  const value = currentQuestionId
    ? getQuestionValue(currentQuestionId)
    : undefined;

  const persistAnswer = useCallback(
    async (questionId: string, nextValue: number) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const saved = await setAnswer(
          questionId,
          String(nextValue),
          undefined,
          ANSWER_STEP_NUMBER
        );

        if (!saved) {
          setSaveError(SAVE_ERROR_MESSAGE);
          return false;
        }

        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [setAnswer]
  );

  const handleStart = () => {
    setValidationMessage(null);
    setSaveError(null);
    setShowIntro(false);
  };

  const handlePreviousQuestion = () => {
    clearAutoAdvance();
    setValidationMessage(null);
    setSaveError(null);
    setIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const handleRatingSelect = useCallback(
    async (nextValue: number) => {
      if (!currentQuestionId) return;

      clearAutoAdvance();
      setValidationMessage(null);
      const previousValue = getQuestionValue(currentQuestionId);

      setLocalValues((previousValues) => ({
        ...previousValues,
        [currentQuestionId]: nextValue,
      }));

      const saved = await persistAnswer(currentQuestionId, nextValue);
      if (!saved) {
        setLocalValues((previousValues) => {
          const nextValues = { ...previousValues };
          if (previousValue === undefined) {
            delete nextValues[currentQuestionId];
          } else {
            nextValues[currentQuestionId] = previousValue;
          }
          return nextValues;
        });
        return;
      }

      if (index >= STEP11_QUESTIONS.length - 1) return;

      autoAdvanceTimer.current = setTimeout(() => {
        setIndex((currentIndex) =>
          currentIndex === index
            ? Math.min(currentIndex + 1, STEP11_QUESTIONS.length - 1)
            : currentIndex
        );
      }, AUTO_ADVANCE_MS);
    },
    [clearAutoAdvance, currentQuestionId, getQuestionValue, index, persistAnswer]
  );

  const handleNextQuestion = async () => {
    clearAutoAdvance();

    if (!currentQuestionId || value === undefined) {
      setValidationMessage(REQUIRED_ANSWER_MESSAGE);
      return;
    }

    setValidationMessage(null);
    const saved = await persistAnswer(currentQuestionId, value);
    if (!saved) return;

    if (index < STEP11_QUESTIONS.length - 1) {
      setIndex((currentIndex) =>
        Math.min(currentIndex + 1, STEP11_QUESTIONS.length - 1)
      );
      return;
    }

    setIsFinishing(true);
    try {
      const step11Answers = STEP11_QUESTIONS.map((question) => ({
        id: question.id,
        value: getQuestionValue(question.id),
        timestamp: new Date(),
      }));
      const firstMissingIndex = step11Answers.findIndex(
        (answer) => answer.value === undefined
      );

      if (firstMissingIndex !== -1) {
        setIndex(firstMissingIndex);
        setValidationMessage(REQUIRED_ANSWER_MESSAGE);
        return;
      }

      const results = await submitAnswers(
        step11Answers as { id: string; value: number; timestamp: Date }[]
      );

      if (!results) {
        setSaveError(SUBMIT_ERROR_MESSAGE);
        return;
      }

      const { useStepStore } = await import("@/lib/stores/stepStore");
      useStepStore.getState().setHollandResults(results);

      await onComplete?.();
      onNext?.();
    } finally {
      setIsFinishing(false);
    }
  };

  if (!currentQuestion) {
    return null;
  }

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
        transition={{ delay: 0.1, duration: 0.4 }}
        className="my-6 text-center text-3xl font-bold"
      >
        שאלון הולנד
      </motion.h1>

      {showIntro && index === 0 ? (
        <Card className="mx-auto max-w-3xl bg-white p-2 text-background sm:p-6">
          <CardContent className="p-2 sm:p-6">
            <div>
              <h2 className="mb-4 text-center text-2xl font-extrabold text-background">
                איך זה עובד
              </h2>
              <div className="space-y-3 text-center leading-relaxed text-gray-700">
                <p>
                  בשאלון יוצגו לך {STEP11_QUESTIONS.length} היגדים מתחומי
                  עבודה מגוונים, עפ"י{" "}
                  <a
                    className="text-blue-800 underline underline-offset-2 hover:text-blue-950"
                    href="/aboutHolland"
                  >
                    מבחן הולנד
                  </a>
                  .
                </p>
                <p>לגבי כל היגד סמנו עד כמה הוא מתאים לכם.</p>
                <p>
                  זה לא מבחן ואין תשובות נכונות. סמנו את התשובה שמתארת אתכם
                  באמת.
                </p>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50/80 p-3">
                <div
                  className="flex items-center justify-between gap-0.5 overflow-x-auto sm:gap-2"
                  dir="ltr"
                  aria-hidden="true"
                >
                  {RATING_OPTIONS.map((option) => {
                    const isPreviewSelected = option.val === INTRO_PREVIEW_VALUE;
                    return (
                      <div
                        key={option.src}
                        className={cn(
                          "flex min-w-[52px] flex-col items-center rounded-lg border p-0.5 sm:min-w-[80px] sm:p-2",
                          isPreviewSelected
                            ? "border-primary bg-primary text-white"
                            : "border-transparent bg-white"
                        )}
                      >
                        <div className="flex h-[40px] w-[40px] items-center justify-center sm:h-[56px] sm:w-[56px]">
                          <Image
                            src={option.src}
                            alt=""
                            width={56}
                            height={56}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <span
                          className={cn(
                            "mt-1 whitespace-nowrap text-[10px] sm:mt-2 sm:text-xs",
                            isPreviewSelected ? "text-white" : "text-gray-700"
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button onClick={handleStart}>בוא נתחיל</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mx-auto max-w-3xl bg-white p-2 text-background sm:p-6">
              <CardHeader className="p-2 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
                    <span>
                      שאלה {index + 1} / {STEP11_QUESTIONS.length}
                    </span>
                    <span>{answeredCount} תשובות נשמרו</span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-2 bg-gray-200"
                    aria-label={`התקדמות ${progressPercentage}%`}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-2 sm:p-6">
                <div className="mb-4 text-right text-lg leading-relaxed text-background sm:mb-6">
                  {currentQuestion.text}
                </div>

                <div className="mb-1 overflow-hidden sm:mb-2">
                  <motion.div
                    className="flex items-stretch justify-between gap-1 overflow-x-auto sm:gap-2"
                    dir="ltr"
                    variants={ratingContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {RATING_OPTIONS.map((option) => {
                      const isSelected = value === option.val;

                      return (
                        <motion.button
                          key={option.src}
                          type="button"
                          onClick={() => handleRatingSelect(option.val)}
                          className={cn(
                            "relative flex min-w-[58px] flex-1 flex-col items-center rounded-lg border p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-w-[90px] sm:p-2",
                            isSelected
                              ? "border-primary bg-primary text-white shadow-lg ring-2 ring-primary/25"
                              : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5"
                          )}
                          aria-pressed={isSelected}
                          aria-label={option.label}
                          variants={ratingItem}
                        >
                          {isSelected ? (
                            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                              <Check className="size-3.5" aria-hidden="true" />
                            </span>
                          ) : null}
                          <div className="flex h-[42px] w-[42px] items-center justify-center sm:h-[58px] sm:w-[58px]">
                            <Image
                              src={option.src}
                              alt={option.label}
                              width={58}
                              height={58}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <span
                            className={cn(
                              "mt-1 whitespace-nowrap text-[10px] font-semibold sm:mt-2 sm:text-xs",
                              isSelected ? "text-white" : "text-gray-700"
                            )}
                          >
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                <div className="mt-4 min-h-6 text-sm" aria-live="polite">
                  {validationMessage ? (
                    <p className="font-medium text-destructive">
                      {validationMessage}
                    </p>
                  ) : saveError ? (
                    <p className="font-medium text-destructive">{saveError}</p>
                  ) : isSaving ? (
                    <p className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="size-4 animate-spin" />
                      שומר...
                    </p>
                  ) : value !== undefined ? (
                    <p className="text-emerald-700">נשמר אוטומטית</p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={index === 0 || isFinishing}
                    className="gap-2"
                  >
                    <ChevronRight className="size-4" />
                    שאלה קודמת
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={isFinishing}
                  >
                    {isFinishing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        מסיים...
                      </>
                    ) : index < STEP11_QUESTIONS.length - 1 ? (
                      "שאלה הבאה"
                    ) : (
                      "סיום השלב"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
