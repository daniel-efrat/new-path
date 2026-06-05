import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STEP8_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStep8Answers } from "@/lib/utils/answerFetcher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Fireworks from "react-canvas-confetti";
import type { AnswerState } from "@/lib/types/questionnaire";

interface Question {
  id: string;
  number?: number;
  level?: string;
  question: string;
  options: string[];
  correct_option: number;
}

interface Step8Props {
  onNext: () => void;
  onComplete?: () => Promise<void> | void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
  waitForBreakReminderIfDue?: () => Promise<void>;
  pauseQuestionTimer?: boolean;
}

function getGrade(score: number) {
  if (score >= 18) return "טוב מאד";
  if (score >= 15) return "טוב";
  if (score >= 12) return "בינוני";
  if (score >= 9) return "חלש";
  return "חלש מאד";
}

export default function Step8({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
  waitForBreakReminderIfDue,
  pauseQuestionTimer = false,
}: Step8Props) {
  const QUESTIONS: Question[] = STEP8_QUESTIONS;

  const { setAnswer } = useQuestionnaireStore();
  const [stepAnswers, setStepAnswers] = useState<Record<string, AnswerState>>(
    {}
  );
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(25);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUESTIONS.length).fill(null)
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [fireworksConductor, setFireworksConductor] = useState<any>(null);

  const passed = score >= 15;

  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep8Answers(questionIds);
        setStepAnswers(fetchedAnswers);

        const newAnswers = QUESTIONS.map((q) => {
          const storedAnswer = fetchedAnswers[q.id];
          if (storedAnswer && storedAnswer.value !== undefined) {
            const value =
              typeof storedAnswer.value === "string"
                ? parseInt(storedAnswer.value)
                : storedAnswer.value;
            return isNaN(value) ? null : value;
          }
          return null;
        });

        setAnswers(newAnswers);

        const newScore = newAnswers.reduce((acc, answer, index) => {
          if (answer !== null && answer === QUESTIONS[index].correct_option) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setScore(newScore);

        const answeredCount = newAnswers.filter(
          (answer) => answer !== null
        ).length;
        if (answeredCount === QUESTIONS.length && resultsMode) {
          setShowResult(true);
          setAnimationKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error loading Step 7 answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadStepAnswers();
  }, []);

  useEffect(() => {
    if (showResult || pauseQuestionTimer) return;
    if (timer === 0) {
      void handleNext(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showResult, pauseQuestionTimer]);

  useEffect(() => {
    setTimer(25);
    setSelected(null);
  }, [current]);

  const handleContinue = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    // Mark step completed before advancing
    if (onComplete) await onComplete();
    onNext();
  };

  const handleSelect = async (idx: number) => {
    if (selected !== null) return;

    const question = QUESTIONS[current];
    const isCorrect = idx === question.correct_option;
    const previousAnswer = answers[current];
    const wasCorrect = previousAnswer === question.correct_option;

    setSelected(idx);
    if (isCorrect !== wasCorrect) {
      setScore((s) => s + (isCorrect ? 1 : -1));
    }

    try {
      await setAnswer(question.id, idx, isCorrect, 7);
      const newAnswers = [...answers];
      newAnswers[current] = idx;
      setAnswers(newAnswers);
    } catch (error) {
      console.error("Failed to save answer for question:", question.id, error);
    }

    await handleNext(false);
  };

  const handleNext = async (skipped: boolean) => {
    if (skipped) {
      const newAnswers = [...answers];
      const wasCorrect = newAnswers[current] === QUESTIONS[current].correct_option;
      if (wasCorrect) setScore((s) => s - 1);
      newAnswers[current] = -1; // Using -1 to denote skipped
      setAnswers(newAnswers);
    }

    if (current < QUESTIONS.length - 1) {
      await waitForBreakReminderIfDue?.();
      setCurrent(current + 1);
      setSelected(null);
      setAnimationKey((prev) => prev + 1);
    } else {
      if (resultsMode) {
        await waitForBreakReminderIfDue?.();
        setShowResult(true);
        setAnimationKey((prev) => prev + 1);
      } else {
        await waitForBreakReminderIfDue?.();
        if (onComplete) await onComplete();
        onNext();
      }
    }
  };

  if (isLoadingAnswers) {
    return <div>טוען...</div>;
  }

  const q = QUESTIONS[current];

  return (
    <AnimatePresence mode="wait">
      {showResult ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="min-h-[400px] flex flex-col items-center justify-center relative"
          dir="rtl"
        >
          <Fireworks
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 50,
            }}
            onInit={({ conductor }) => setFireworksConductor(conductor)}
          />
          <h1 className="text-3xl font-bold my-6">תוצאות המבחן</h1>
          <div className="text-xl mb-8">
            הניקוד שלך: {Math.min(score, QUESTIONS.length)} מתוך{" "}
            {QUESTIONS.length} - {getGrade(Math.min(score, QUESTIONS.length))}
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
                {QUESTIONS.map((q, idx) => {
                  const userAns = answers[idx];
                  const correctIdx = q.correct_option;
                  const isCorrect = userAns === correctIdx;
                  return (
                    <tr
                      key={q.id}
                      className={isCorrect ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="p-2 border text-background text-center">
                        {q.number}
                      </td>
                      <td className="p-2 border text-background">
                        {q.question}
                      </td>
                      <td className="p-2 border text-background">
                        {userAns !== null && userAns !== -1
                          ? q.options[userAns]
                          : "לא נענה"}
                      </td>
                      <td className="p-2 border text-background">
                        {q.options[correctIdx]}
                      </td>
                      <td className="p-2 border text-background text-center">
                        {isCorrect ? (
                          <span
                            title="Correct"
                            style={{ color: "#16a34a", fontSize: "1.2em" }}
                          >
                            ✓
                          </span>
                        ) : (
                          <span
                            title="Incorrect"
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
            <Button onClick={handleContinue}>חזרה לדו״ח הראשי</Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl font-bold mb-4 mt-6 text-center"
          >
            ידע בסיסי במחשבים
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <span className="text-lg font-semibold">
              שאלה {q.number} / {QUESTIONS.length}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="max-w-xl mx-auto p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  {q.level}
                </span>
                <span
                  className={`font-mono text-lg ${
                    timer <= 10 ? "text-orange-300" : "text-muted-foreground"
                  }`}
                >
                  {timer} שניות
                </span>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-4 font-medium text-lg text-right"
              >
                {q.question}
              </motion.div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <Button
                      className="w-full justify-center p-4 h-auto text-base whitespace-normal text-foreground hover:bg-white/10 disabled:opacity-100"
                      variant="outline"
                      disabled={selected !== null}
                      onClick={() => handleSelect(idx)}
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
