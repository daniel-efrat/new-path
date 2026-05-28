"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP11_QUESTIONS } from "@/lib/constants/questions";

interface Step11Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
}

const DEFAULT_RATING_VALUE = 3;

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

function toRatingValue(stored: unknown) {
  if (stored === undefined || stored === null) return DEFAULT_RATING_VALUE;
  const numericValue =
    typeof stored === "string" ? parseInt(stored, 10) : Number(stored);

  return Number.isNaN(numericValue)
    ? DEFAULT_RATING_VALUE
    : Math.min(5, Math.max(1, numericValue));
}

export default function Step11({
  onNext,
  onComplete,
}: Step11Props) {
  const { answers, setAnswer, submitAnswers } = useQuestionnaireStore();
  const [index, setIndex] = useState(0);
  const currentQuestion = STEP11_QUESTIONS[index];
  const currentQuestionId = currentQuestion?.id;

  // Intro state: show two instruction cards before the first question
  const [showIntro, setShowIntro] = useState(true);
  const [introIndex, setIntroIndex] = useState<0 | 1>(0); // 0..1
  const [introValue, setIntroValue] = useState(DEFAULT_RATING_VALUE);
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  const getQuestionValue = useCallback(
    (questionId: string) =>
      localValues[questionId] ?? toRatingValue(answers[questionId]?.value),
    [answers, localValues]
  );

  const saveCurrent = useCallback(async () => {
    if (!currentQuestionId) return;
    await setAnswer(
      currentQuestionId,
      String(getQuestionValue(currentQuestionId)),
      undefined,
      3
    );
  }, [currentQuestionId, getQuestionValue, setAnswer]);

  const handleRatingSelect = useCallback(
    (nextValue: number) => {
      if (!currentQuestionId) return;
      setLocalValues((previousValues) => ({
        ...previousValues,
        [currentQuestionId]: nextValue,
      }));
    },
    [currentQuestionId]
  );

  const value = currentQuestionId
    ? getQuestionValue(currentQuestionId)
    : DEFAULT_RATING_VALUE;

  const getSubmittedValue = useCallback(
    (questionId: string) => getQuestionValue(questionId),
    [getQuestionValue]
  );

  const handleStart = () => {
    if (currentQuestionId) {
      setLocalValues((previousValues) => {
        if (previousValues[currentQuestionId] !== undefined) {
          return previousValues;
        }

        return {
          ...previousValues,
          [currentQuestionId]: toRatingValue(answers[currentQuestionId]?.value),
        };
      });
    }

    setShowIntro(false);
  };

  const handleNextQuestion = async () => {
    await saveCurrent();
    if (index < STEP11_QUESTIONS.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Submit answers to API before proceeding
      const step11Answers = STEP11_QUESTIONS.map((q) => ({
        id: q.id,
        value: getSubmittedValue(q.id),
        timestamp: new Date(),
      }));

      const results = await submitAnswers(step11Answers);
      if (results) {
        // Store results in step store for display
        const { useStepStore } = await import("@/lib/stores/stepStore");
        useStepStore.getState().setHollandResults(results);
      }

      await onComplete?.();
      onNext?.();
    }
  };

  const isFirstIntro = introIndex === 0;

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
        className="text-3xl font-bold my-6 text-center"
      >
        שאלון הולנד
      </motion.h1>

      {/* Intro cards – shown only before the first question */}
      {showIntro && index === 0 ? (
        <Card className="max-w-3xl mx-auto bg-white text-background p-2 sm:p-6">
          <CardContent className="p-2 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`intro-${introIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                {isFirstIntro ? (
                  <div>
                    <h2 className="text-2xl font-extrabold text-center mb-4 text-background">
                      איך זה עובד
                    </h2>
                    <p className="text-center text-gray-600 leading-relaxed mb-4">
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
                    <p className="text-center text-gray-600 leading-relaxed mb-6">
                      לגבי כל היגד סמן/י עד כמה הוא מתאים לך.
                    </p>
                    <div className="mb-2 overflow-hidden">
                      {/* Image rating buttons (left to right: very like -> not at all) */}
                      <motion.div
                        className="flex items-center justify-between gap-0.5 sm:gap-2 overflow-x-auto"
                        dir="ltr"
                        variants={ratingContainer}
                        initial="hidden"
                        animate="show"
                      >
                        {RATING_OPTIONS.map((opt) => (
                          <motion.button
                            key={opt.src}
                            type="button"
                            onClick={() => setIntroValue(opt.val)}
                            className={`flex flex-col items-center p-0.5 sm:p-2 rounded-lg transition-colors focus-visible:outline-none border min-w-[52px] sm:min-w-[80px] ${
                              introValue === opt.val
                                ? "border-primary ring-2 ring-blue-200"
                                : "border-transparent hover:bg-gray-50"
                            }`}
                            aria-pressed={introValue === opt.val}
                            aria-label={opt.label}
                            variants={ratingItem}
                          >
                            <div className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] flex items-center justify-center">
                              <Image
                                src={opt.src}
                                alt={opt.label}
                                width={56}
                                height={56}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                              {opt.label}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>
                    <div className="flex justify-center mt-6">
                      <Button onClick={() => setIntroIndex(1)}>
                        ועוד דבר אחד חשוב
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-extrabold text-center mb-4 text-background">
                      כשאתם עונים על השאלון
                    </h2>
                    <div className="text-center text-gray-700 leading-relaxed space-y-2">
                      <p>
                        <span className="font-semibold">זכרו:</span> זה לא מבחן
                        ואין תשובות נכונות.
                      </p>
                      <p>
                        <span className="font-semibold">אל תחשבו</span> על
                        תשובה רצויה או נכונה; סמנו את התשובה שמתאימה לכם.
                      </p>
                      <p>
                        התייחסו לאופן שבו הייתם רוצים לעבוד ולהתבטא במקצוע.
                      </p>
                      <hr className="my-3 border-gray-200" />
                      <p>
                        בחרו את התשובה שמתאימה לכם ביותר והמשיכו לשאלה הבאה.
                      </p>
                    </div>
                    <div className="flex justify-center mt-6">
                      <Button onClick={handleStart}>בוא נתחיל</Button>
                    </div>
                  </div>
                )}
                {/* Pagination dots */}
                <div className="flex justify-center gap-1 my-6" dir="ltr">
                  <span
                    className={`h-2 w-8 rounded-full ${
                      isFirstIntro ? "bg-primary" : "bg-gray-300"
                    }`}
                  ></span>
                  <span
                    className={`h-2 w-8 rounded-full ${
                      !isFirstIntro ? "bg-primary" : "bg-gray-300"
                    }`}
                  ></span>
                </div>
              </motion.div>
            </AnimatePresence>
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
            <Card className="max-w-3xl mx-auto bg-white text-background p-2 sm:p-6">
              <CardHeader className="flex justify-between items-center p-2 sm:p-6">
                <div className="text-sm text-gray-700">
                  שאלה {index + 1} / {STEP11_QUESTIONS.length}
                </div>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="mb-4 sm:mb-6 text-right leading-relaxed text-background">
                  {currentQuestion?.text}
                </div>
                <div className="mb-1 sm:mb-2 overflow-hidden">
                  {/* Image rating buttons (left to right: very like -> not at all) */}
                  <motion.div
                    className="flex items-center justify-between gap-0.5 sm:gap-2 overflow-x-auto"
                    dir="ltr"
                    variants={ratingContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {RATING_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.src}
                        type="button"
                        onClick={() => handleRatingSelect(opt.val)}
                        className={`flex flex-col items-center p-0.5 sm:p-2 rounded-lg transition-colors focus-visible:outline-none border min-w-[52px] sm:min-w-[80px] ${
                          value === opt.val
                            ? "border-primary ring-2 ring-blue-200"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                        aria-pressed={value === opt.val}
                        aria-label={opt.label}
                        variants={ratingItem}
                      >
                        <div className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] flex items-center justify-center">
                          <Image
                            src={opt.src}
                            alt={opt.label}
                            width={56}
                            height={56}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                          {opt.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleNextQuestion}>
                    {index < STEP11_QUESTIONS.length - 1
                      ? "שאלה הבאה"
                      : "סיום השלב"}
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
