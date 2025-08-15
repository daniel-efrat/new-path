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
  onPrevious: () => void;
  onComplete?: () => Promise<void> | void;
}

export default function Step8({ onNext, onPrevious, onComplete }: Step8Props) {
  const QUESTIONS: Question[] = STEP8_QUESTIONS;

  const { setAnswer } = useQuestionnaireStore();
  const [stepAnswers, setStepAnswers] = useState<Record<string, AnswerState>>(
    {}
  );
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(40);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUESTIONS.length).fill(null)
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [fireworksConductor, setFireworksConductor] = useState<any>(null);

  const passed = score / QUESTIONS.length >= 0.7;

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setTimer(40);
    setShowResult(false);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setStepAnswers({});
    setAnimationKey((prev) => prev + 1);
    QUESTIONS.forEach((q) => {
      setAnswer(q.id, null, false);
    });
  };

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
        if (answeredCount === QUESTIONS.length) {
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
    if (showResult) return;
    if (timer === 0) {
      handleNext(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showResult]);

  useEffect(() => {
    setTimer(40);
    const currentAnswer = answers[current];
    if (currentAnswer !== null) {
      setSelected(currentAnswer);
      const isCorrect = QUESTIONS[current].correct_option === currentAnswer;
      setFeedback(isCorrect);
    } else {
      setSelected(null);
      setFeedback(null);
    }
  }, [current, answers, QUESTIONS]);

  const handleContinue = async () => {
    // Mark step completed before advancing
    if (onComplete) await onComplete();
    onNext();
  };

  const handleSelect = async (idx: number) => {
    if (selected !== null) return;

    const question = QUESTIONS[current];
    const isCorrect = idx === question.correct_option;

    setSelected(idx);
    setFeedback(isCorrect);
    if (isCorrect) setScore((s) => s + 1);

    try {
      await setAnswer(question.id, idx, isCorrect);
      const newAnswers = [...answers];
      newAnswers[current] = idx;
      setAnswers(newAnswers);
    } catch (error) {
      console.error("Failed to save answer for question:", question.id, error);
    }

    setTimeout(() => {
      handleNext(false);
    }, 1000);
  };

  const handleNext = (skipped: boolean) => {
    if (skipped) {
      const newAnswers = [...answers];
      newAnswers[current] = -1; // Using -1 to denote skipped
      setAnswers(newAnswers);
    }

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setFeedback(null);
      setAnimationKey((prev) => prev + 1);
    } else {
      setShowResult(true);
      setAnimationKey((prev) => prev + 1);
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
            הניקוד שלך: {score} מתוך {QUESTIONS.length} (
            {Math.round((score / QUESTIONS.length) * 100)}%)
          </div>
          <div className="w-full max-w-3xl mt-6">
            <table className="w-full border text-right text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">שאלה</th>
                  <th className="p-2 border">התשובה שלך</th>
                  <th className="p-2 border">תשובה נכונה</th>
                  <th className="p-2 border">ציון</th>
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
                      <td className="p-2 border text-center">{q.number}</td>
                      <td className="p-2 border">{q.question}</td>
                      <td className="p-2 border">
                        {userAns !== null && userAns !== -1
                          ? q.options[userAns]
                          : "לא נענה"}
                      </td>
                      <td className="p-2 border">{q.options[correctIdx]}</td>
                      <td className="p-2 border text-center">
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
            <Button
              variant="outline"
              onClick={handleRestart}
              className="text-xs"
            >
              🔄 Restart Quiz (Dev)
            </Button>
            <Button onClick={handleContinue}>המשך לשלב הבא</Button>
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
                <span className="text-sm text-gray-500">{q.level}</span>
                <span
                  className={`font-mono text-lg ${
                    timer <= 10 ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {timer}ש
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
                      className={`w-full justify-center p-4 h-auto text-base whitespace-normal ${
                        selected !== null
                          ? idx === q.correct_option
                            ? "bg-green-100 hover:bg-green-200 border-green-400"
                            : idx === selected && !feedback
                            ? "bg-red-100 hover:bg-red-200 border-red-400"
                            : "bg-gray-50"
                          : "hover:bg-gray-100"
                      }`}
                      variant="outline"
                      disabled={selected !== null}
                      onClick={() => handleSelect(idx)}
                    >
                      {opt}
                    </Button>
                  </motion.div>
                ))}
              </div>
              {selected !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`mt-4 text-center font-semibold ${
                    feedback ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feedback ? "נכון!" : "לא נכון"}
                </motion.div>
              )}
            </Card>
          </motion.div>
          {/* Navigation Buttons - Consistent across all steps */}
          <div className="max-w-xl mx-auto mt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center mx-4"
            >
              <div className="flex gap-2">
                <Button variant="outline" onClick={onPrevious}>
                  שלב קודם
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="text-xs"
                >
                  🔄 Restart Quiz (Dev)
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
