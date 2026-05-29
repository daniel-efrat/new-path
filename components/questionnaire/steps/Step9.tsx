"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STEP9_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step9Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
}

const QUESTIONS = STEP9_QUESTIONS;
const STEP_NUMBER = 11;
const QUESTION_SECONDS = 25;
const DEFAULT_STIMULUS_SECONDS = 7;

type StimulusState = {
  questionId: string | null;
  secondsLeft: number;
};

export default function Step9({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
}: Step9Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUESTIONS.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(QUESTION_SECONDS);
  const [showResult, setShowResult] = useState(false);
  const [showIntro, setShowIntro] = useState(!resultsMode);
  const [stimulus, setStimulus] = useState<StimulusState>({
    questionId: null,
    secondsLeft: 0,
  });

  const question = QUESTIONS[current];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const showStimulus =
    stimulus.questionId === question.id && stimulus.secondsLeft > 0;

  const prepareQuestion = useCallback(
    (questionIndex: number) => {
      const nextQuestion = QUESTIONS[questionIndex];
      const shouldShowStimulus = Boolean(nextQuestion.stimulus);

      setTimer(QUESTION_SECONDS);
      setSelected(null);
      setStimulus({
        questionId: shouldShowStimulus ? nextQuestion.id : null,
        secondsLeft: shouldShowStimulus ? DEFAULT_STIMULUS_SECONDS : 0,
      });
    },
    []
  );

  const categoryScores = useMemo(() => {
    return QUESTIONS.reduce<Record<string, { correct: number; total: number }>>(
      (acc, item, index) => {
        const row = acc[item.category] || { correct: 0, total: 0 };
        row.total += 1;
        if (answers[index] === item.correct_option) {
          row.correct += 1;
        }
        acc[item.category] = row;
        return acc;
      },
      {}
    );
  }, [answers]);

  const completeOrAdvance = useCallback(
    (nextAnswers: (number | null)[]) => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((value) => value + 1);
        return;
      }

      setScore(
        nextAnswers.reduce<number>(
          (total, answer, index) =>
            answer === QUESTIONS[index].correct_option ? total + 1 : total,
          0
        )
      );
      if (resultsMode) {
        setShowResult(true);
      } else {
        void (async () => {
          await onComplete?.();
          onNext?.();
        })();
      }
    },
    [current, onComplete, onNext, resultsMode]
  );

  const handleSkip = useCallback(async () => {
    if (answers[current] !== null) {
      completeOrAdvance(answers);
      return;
    }

    const nextAnswers = [...answers];
    nextAnswers[current] = -1;
    setAnswers(nextAnswers);
    await setAnswer(question.id, -1, false, STEP_NUMBER);
    completeOrAdvance(nextAnswers);
  }, [answers, completeOrAdvance, current, question.id, setAnswer]);

  const handleSelect = useCallback(
    async (optionIndex: number) => {
      if (selected !== null || showStimulus) return;

      const isCorrect = optionIndex === question.correct_option;
      const nextAnswers = [...answers];
      nextAnswers[current] = optionIndex;

      setSelected(optionIndex);
      setAnswers(nextAnswers);
      setScore(
        nextAnswers.reduce<number>(
          (total, answer, index) =>
            answer === QUESTIONS[index].correct_option ? total + 1 : total,
          0
        )
      );

      await setAnswer(question.id, optionIndex, isCorrect, STEP_NUMBER);
      setSelected(null);
      completeOrAdvance(nextAnswers);
    },
    [
      answers,
      completeOrAdvance,
      current,
      question.correct_option,
      question.id,
      selected,
      setAnswer,
      showStimulus,
    ]
  );

  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const fetchedAnswers = await fetchStepAnswers(
          QUESTIONS.map((item) => item.id)
        );
        const nextAnswers = QUESTIONS.map((item) => {
          const stored = fetchedAnswers[item.id]?.value;
          if (stored === undefined || stored === null) return null;
          const value =
            typeof stored === "string" ? parseInt(stored) : Number(stored);
          return Number.isFinite(value) ? value : null;
        });

        setAnswers(nextAnswers);
        setScore(
          nextAnswers.reduce<number>(
            (total, answer, index) =>
              answer === QUESTIONS[index].correct_option ? total + 1 : total,
            0
          )
        );

        if (nextAnswers.every((answer) => answer !== null) && resultsMode) {
          setShowResult(true);
        }
      } catch (error) {
        console.error("Error loading attention and memory answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadAnswers();
  }, [resultsMode]);

  useEffect(() => {
    if (showResult || showIntro || isLoadingAnswers) {
      setStimulus({ questionId: null, secondsLeft: 0 });
      return;
    }

    prepareQuestion(current);
  }, [
    current,
    isLoadingAnswers,
    prepareQuestion,
    showIntro,
    showResult,
  ]);

  useEffect(() => {
    if (showResult || showIntro || selected !== null || showStimulus) return;
    if (timer === 0) {
      handleSkip();
      return;
    }

    const interval = setInterval(() => {
      setTimer((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [handleSkip, selected, showIntro, showResult, timer, showStimulus]);

  useEffect(() => {
    if (!showStimulus) return;

    const timeout = window.setTimeout(() => {
      setStimulus((currentStimulus) => {
        if (currentStimulus.questionId !== question.id) {
          return currentStimulus;
        }

        return {
          ...currentStimulus,
          secondsLeft: Math.max(0, currentStimulus.secondsLeft - 1),
        };
      });
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [question.id, showStimulus, stimulus.secondsLeft]);

  const handleContinue = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    await onComplete?.();
    onNext?.();
  };

  const handleStartIntro = () => {
    prepareQuestion(current);
    setShowIntro(false);
  };

  if (isLoadingAnswers) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="attention-memory-intro"
          className="mx-auto max-w-2xl space-y-5 p-4"
          dir="rtl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              מבדק קשב, סינון מידע וזיכרון
            </h1>
            <p className="mt-2 text-sm text-white/75">
              לפני שמתחילים, הנה מה שצפוי בשלב הזה
            </p>
          </div>

          <Card className="bg-white text-background">
            <CardContent className="space-y-5 p-5">
              <div className="space-y-3 text-right">
                <h2 className="text-xl font-semibold">
                  איך השלב הזה עובד?
                </h2>
                <p className="leading-7 text-gray-700">
                  בשלב הבא יוצגו 15 שאלות קצרות שבודקות קשב, סינון מידע
                  וזיכרון עבודה. בחלק מהשאלות יופיע פריט לצפייה למספר שניות,
                  ולאחר מכן הוא יוסתר.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border bg-gray-50 p-4">
                  <div className="text-sm font-semibold">זמן לכל שאלה</div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    לכל שאלה מוקצות 25 שניות.
                  </div>
                </div>
                <div className="rounded-md border bg-gray-50 p-4">
                  <div className="text-sm font-semibold">פריטים קצרים</div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    כשפריט מופיע, התבוננו בו וענו לאחר שהוא מוסתר.
                  </div>
                </div>
                <div className="rounded-md border bg-gray-50 p-4">
                  <div className="text-sm font-semibold">בחירת תשובה</div>
                  <div className="mt-2 text-sm leading-6 text-gray-600">
                    אם אינכם בטוחים, בחרו את האפשרות הטובה ביותר או דלגו.
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button type="button" onClick={handleStartIntro}>
                  התחילו את השלב
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (showResult) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">תוצאות מבדק קשב וזיכרון</h1>
          <p className="mt-3 text-lg">
            הניקוד שלך: {score} מתוך {QUESTIONS.length} (
            {Math.round((score / QUESTIONS.length) * 100)}%)
          </p>
        </div>

        <Card className="bg-white text-background">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-semibold">פירוט לפי תחום</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(categoryScores).map(([category, result]) => (
                <div key={category} className="rounded-md border p-4">
                  <div className="font-semibold">{category}</div>
                  <div className="mt-2 text-sm text-gray-600">
                    {result.correct} מתוך {result.total}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-white rounded-sm overflow-x-auto">
          <table className="p-2 w-full border text-right text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-background">#</th>
                <th className="p-2 border text-background">תחום</th>
                <th className="p-2 border text-background">שאלה</th>
                <th className="p-2 border text-background">התשובה שלך</th>
                <th className="p-2 border text-background">תשובה נכונה</th>
                <th className="p-2 border text-background">ציון</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((item, index) => {
                const answer = answers[index];
                const isCorrect = answer === item.correct_option;
                return (
                  <tr
                    key={item.id}
                    className={isCorrect ? "bg-green-50" : "bg-red-50"}
                  >
                    <td className="p-2 border text-background text-center">
                      {item.number}
                    </td>
                    <td className="p-2 border text-background">
                      {item.category}
                    </td>
                    <td className="p-2 border text-background">
                      {item.question}
                    </td>
                    <td className="p-2 border text-background">
                      {answer !== null && answer >= 0
                        ? item.options[answer]
                        : "לא נענה"}
                    </td>
                    <td className="p-2 border text-background">
                      {item.options[item.correct_option]}
                    </td>
                    <td className="p-2 border text-background text-center">
                      {isCorrect ? (
                        <span
                          title="נכון"
                          style={{ color: "#16a34a", fontSize: "1.2em" }}
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          title="לא נכון"
                          style={{ color: "#dc2626", fontSize: "1.2em" }}
                        >
                          ✗
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleContinue}>חזרה לדו״ח הראשי</Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        className="w-full max-w-2xl mx-auto"
        dir="rtl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
      >
        <h1 className="text-2xl font-bold mb-4 mt-6 text-center">
          מבדק קשב, סינון מידע וזיכרון
        </h1>
        <div className="flex justify-center mb-4">
          <span className="text-lg font-semibold">
            שאלה {question.number} / {QUESTIONS.length}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="max-w-xl mx-auto p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {question.level}
              </span>
              {!showStimulus ? (
                <span
                  className={`font-mono text-lg ${
                    timer <= 10 ? "text-orange-300" : "text-muted-foreground"
                  }`}
                >
                  {timer} שניות
                </span>
              ) : (
                <span
                  className={`font-mono text-lg ${
                    stimulus.secondsLeft <= 3
                      ? "text-orange-300"
                      : "text-muted-foreground"
                  }`}
                >
                  {stimulus.secondsLeft} שניות
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {showStimulus ? (
                <motion.div
                  key="stimulus-container"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center py-6 text-center space-y-6"
                >
                  <div className="text-sm text-muted-foreground">
                    התבוננו בפריט וזכרו אותו:
                  </div>

                  <div className="text-3xl md:text-4xl font-bold tracking-wider bg-muted rounded border px-8 py-6 min-w-[200px] select-none">
                    {question.stimulus}
                  </div>

                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="38"
                        className="stroke-slate-200"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="38"
                        className={`${
                          stimulus.secondsLeft <= 3
                            ? "stroke-orange-400"
                            : "stroke-primary"
                        }`}
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 38}
                        animate={{
                          strokeDashoffset:
                            (2 * Math.PI * 38) *
                            (1 - stimulus.secondsLeft / DEFAULT_STIMULUS_SECONDS),
                        }}
                        transition={{ duration: 0.2, ease: "linear" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <motion.span
                        key={stimulus.secondsLeft}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-2xl font-bold font-mono ${
                          stimulus.secondsLeft <= 3
                            ? "text-orange-400 animate-pulse"
                            : "text-foreground"
                        }`}
                      >
                        {stimulus.secondsLeft}
                      </motion.span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        שניות
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="question-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="mb-4 font-medium text-lg text-right text-foreground">
                    {question.question}
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <motion.div
                        key={`${question.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          disabled={selected !== null}
                          onClick={() => handleSelect(index)}
                          className="w-full justify-center p-4 h-auto text-base whitespace-normal text-foreground hover:bg-white/10 disabled:opacity-100"
                        >
                          {option}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between px-2 max-w-xl mx-auto">
          <span className="text-sm text-white/70 font-medium">
            נענו {answeredCount}/{QUESTIONS.length}
          </span>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={showStimulus || selected !== null}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-lg px-5 disabled:opacity-30"
          >
            דלג
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
