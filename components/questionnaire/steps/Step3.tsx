// English Language Assessment Step

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP3_QUESTIONS } from "@/lib/constants/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Fireworks from "react-canvas-confetti";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step3Props {
  onNext: () => void;
  onComplete: () => Promise<void> | void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
  waitForBreakReminderIfDue?: () => Promise<void>;
  pauseQuestionTimer?: boolean;
}

function getEnglishGrade(score: number) {
  if (score >= 14) return "טוב מאד";
  if (score >= 12) return "טוב";
  if (score >= 9) return "בינוני";
  if (score >= 6) return "חלש";
  return "חלש מאד";
}

export default function Step3({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
  waitForBreakReminderIfDue,
  pauseQuestionTimer = false,
}: Step3Props) {
  const {
    setAnswer,
    answers: allAnswers,
    submit,
    isSubmitting: storeIsSubmitting,
  } = useQuestionnaireStore();

  const QUESTIONS = STEP3_QUESTIONS;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [fireworksConductor, setFireworksConductor] = useState<any>(null);
  const isSubmitting = storeIsSubmitting;
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const passed = score >= 12;

  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const questionIds = STEP3_QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStepAnswers(questionIds);
        console.log("Fetched Step 3 answers:", fetchedAnswers);
        const localAnswers: Record<string, string | null> = {};
        let currentScore = 0;
        STEP3_QUESTIONS.forEach((question) => {
          const fetchedAnswer = fetchedAnswers[question.id];
          if (fetchedAnswer) {
            const answerValue = fetchedAnswer.value;
            localAnswers[question.id] = answerValue;
            if (answerValue === question.options[question.correct_option]) {
              currentScore++;
            }
          }
        });
        setAnswers(localAnswers);
        setScore(currentScore);
        const answeredCount = Object.keys(localAnswers).length;
        if (answeredCount === STEP3_QUESTIONS.length && resultsMode) {
          setIsFinished(true);
        }
      } catch (error) {
        console.error("Error fetching Step 3 answers:", error);
      }
    };
    loadAnswers();
  }, [resultsMode]);

  useEffect(() => {
    if (isFinished || pauseQuestionTimer) return;
    if (timer === 0) {
      void handleNext(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isFinished, pauseQuestionTimer]);

  useEffect(() => {
    setTimer(30);
    setSelected(null);
    setAnimationKey((prev) => prev + 1);
  }, [current]);

  useEffect(() => {
    if (isFinished && passed && fireworksConductor) {
      fireworksConductor.run({ speed: 3, duration: 2000 });
    }
  }, [isFinished, fireworksConductor, passed]);

  const handleNext = async (skipped: boolean) => {
    if (skipped) {
      setAnswers((prev) => ({
        ...prev,
        [QUESTIONS[current].id]: null,
      }));
    }
    if (current < QUESTIONS.length - 1) {
      await waitForBreakReminderIfDue?.();
      setCurrent((c) => c + 1);
    } else {
      if (resultsMode) {
        await waitForBreakReminderIfDue?.();
        setIsFinished(true);
      } else {
        await waitForBreakReminderIfDue?.();
        await handleSubmit();
      }
    }
  };

  const handleSelect = async (option: string) => {
    if (selected !== null) return;
    const question = QUESTIONS[current];
    const isCorrect =
      question.options.indexOf(option) === question.correct_option;
    setSelected(option);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    await setAnswer(question.id, option, isCorrect, 3);
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    await handleNext(false);
  };

  const handleSubmit = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    setSubmissionError(null);
    try {
      await submit();
      await onComplete();
      onNext();
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmissionError("Failed to submit answers. Please try again.");
    }
  };

  const q = QUESTIONS[current];

  return (
    <AnimatePresence mode="wait">
      {isFinished ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="min-h-[400px] flex flex-col items-center justify-center relative"
        >
          <Fireworks
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 50,
            }}
            onInit={({ conductor }) => setFireworksConductor(conductor)}
          />
          <div className="w-full max-w-4xl" dir="rtl">
            <h1 className="text-3xl font-bold my-6">תוצאות המבחן</h1>
            <div className="text-xl mb-8">
              הניקוד שלך: {score} מתוך {QUESTIONS.length} -{" "}
              {getEnglishGrade(score)}
            </div>
            <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-white rounded-sm overflow-x-auto">
              <table className="p-2 w-full border text-right text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-background">#</th>
                    <th className="p-2 border text-background">שאלה</th>
                    <th className="p-2 border text-background">התשובה שלך</th>
                    <th className="p-2 border text-background">תשובה נכונה</th>
                    <th className="p-2 border text-background">ציון</th>
                  </tr>
                </thead>
                <tbody>
                  {QUESTIONS.map((q, index) => {
                    const userAnswer = answers[q.id];
                    const isCorrect =
                      userAnswer === q.options[q.correct_option];
                    return (
                      <tr
                        key={q.id}
                        className={isCorrect ? "bg-green-50" : "bg-red-50"}
                      >
                        <td className="p-2 border text-background text-center">
                          {index + 1}
                        </td>
                        <td className="p-2 border text-background">
                          {q.question}
                        </td>
                        <td className="p-2 border text-background">
                          {userAnswer ?? (
                            <span className="italic text-gray-700">דילגת</span>
                          )}
                        </td>
                        <td className="p-2 border text-background">
                          {q.options[q.correct_option]}
                        </td>
                        <td className="p-2 border text-background text-center">
                          {isCorrect ? (
                            <span
                              title="נכון!"
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
            <div className="flex justify-center gap-4 mt-8">
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "שולח..." : "חזרה לדו״ח הראשי"}
              </Button>
            </div>
            {submissionError && (
              <p className="text-red-300 mt-4">שגיאה: {submissionError}</p>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          dir="ltr"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold mt-6 mb-4 text-center"
          >
            English Language Assessment
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <span className="text-lg font-semibold">
              Question {current + 1} / {QUESTIONS.length}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="max-w-xl mx-auto p-6 mb-6">
              <div className="flex justify-end items-center mb-2">
                <span
                  className={`font-mono text-lg ${
                    timer <= 10 ? "text-orange-300" : "text-muted-foreground"
                  }`}
                >
                  {timer}s
                </span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                dir="ltr"
                className="mb-4 font-medium text-lg"
              >
                {q.question}
              </motion.div>
              <div dir="ltr" className="space-y-2">
                {q.options.map((opt, idx) => (
                  <motion.div
                    key={opt}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <Button
                      className="w-full justify-center p-4 h-auto text-base whitespace-normal text-foreground hover:bg-white/10 disabled:opacity-100"
                      variant="outline"
                      disabled={selected !== null}
                      onClick={() => handleSelect(opt)}
                    >
                      {opt}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
          {/* Navigation Buttons - Consistent across all steps */}
          <div className="max-w-xl mx-auto mt-4" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
