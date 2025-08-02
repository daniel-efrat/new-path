import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STEP5_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStep5Answers } from "@/lib/utils/answerFetcher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Fireworks from "react-canvas-confetti";
import type { AnswerState } from "@/lib/types/questionnaire";
import type { LogicalQuestion } from "@/lib/constants/questions";

interface Step5Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void>;
}

export default function Step5({ onNext, onPrevious, onComplete }: Step5Props) {
  const QUESTIONS: LogicalQuestion[] = STEP5_QUESTIONS;

  const { setAnswer } = useQuestionnaireStore();
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(90);
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
    setTimer(90);
    setShowResult(false);
    setAnswers(Array(QUESTIONS.length).fill(null));
    QUESTIONS.forEach((q) => {
      setAnswer(q.id, { value: null, isCorrect: false });
    });
  };

  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep5Answers(questionIds);
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
        const answeredCount = newAnswers.filter((a) => a !== null).length;
        if (answeredCount === QUESTIONS.length) {
          setShowResult(true);
        }
      } catch (error) {
        console.error("Error loading Step 5 answers:", error);
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
    const interval = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [timer, showResult]);

  useEffect(() => {
    setTimer(90);
    setSelected(null);
    setFeedback(null);
    setAnimationKey((prev) => prev + 1);
  }, [current]);

  const handleContinue = async () => {
    try {
      await onComplete();
      if (onNext) onNext();
    } catch (error) {
      console.error("Error completing step 5:", error);
    }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    const isCorrect = idx === QUESTIONS[current].correct_option;
    setSelected(idx);
    setFeedback(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
    setAnswer(QUESTIONS[current].id, { value: idx, isCorrect });
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
    setTimeout(() => handleNext(false), 1200);
  };

  const handleNext = (skipped: boolean) => {
    if (skipped) {
      const newAnswers = [...answers];
      newAnswers[current] = null;
      setAnswers(newAnswers);
      setAnswer(QUESTIONS[current].id, { value: null, isCorrect: false });
    }
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
    }
  };

  if (isLoadingAnswers) {
    return <div className="text-center p-8">טוען שאלות...</div>;
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
          className="min-h-[600px] flex flex-col items-center justify-center relative"
          dir="rtl"
        >
          <Fireworks
            onInit={({ conductor }) => setFireworksConductor(conductor)}
            style={{ zIndex: 1000, position: "fixed", top: 0, left: 0 }}
          />

          <h1 className="text-3xl font-bold mb-6">תוצאות המבחן</h1>
          <div className="text-xl mb-8">
            הניקוד שלך: {score} מתוך {QUESTIONS.length} (
            {Math.round((score / QUESTIONS.length) * 100)}%)
          </div>
          <div className="max-w-2xl mx-auto bg-white p-4 rounded-lg shadow-md">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="p-2">שאלה</th>
                  <th className="p-2">תשובה</th>
                  <th className="p-2">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map((q, idx) => {
                  const userAnswerIndex = answers[idx];
                  const isCorrect = userAnswerIndex === q.correct_option;
                  const userAnswer =
                    userAnswerIndex !== null
                      ? q.options[userAnswerIndex]
                      : "לא נענה";
                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{q.question}</td>
                      <td className="p-2">{userAnswer}</td>
                      <td className="p-2 text-center">
                        {isCorrect ? (
                          <span
                            role="img"
                            aria-label="Correct"
                            className="text-green-500"
                          >
                            ✓
                          </span>
                        ) : (
                          <span
                            role="img"
                            aria-label="Incorrect"
                            className="text-red-500"
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
              variant="destructive"
              size="lg"
              onClick={handleRestart}
              className="text-lg bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4"
            >
              🔄 RESTART QUIZ - DEV BUTTON
            </Button>
            <Button onClick={handleContinue}>המשך לשלב הבא</Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          dir="rtl"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl font-bold mb-4 text-center"
          >
            מבחן לוגיקה
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="max-w-4xl mx-auto p-6 mb-6 bg-blue-50 border-blue-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  הוראות:
                </h3>
                <div className="text-right leading-relaxed text-gray-800 bg-white p-4 rounded border">
                  ענו לפי המידע שמופיע בכל שאלה בלבד. אל תניחו עובדות שלא ניתנו.
                  זכרו: מטענה כללית ("כל…") אי‑אפשר להסיק קיום פרטים; מטענת קיום
                  ("יש…") לא מסיקים כלל על כולם. הבחינו בין "אם… אז…" (תנאי
                  מספיק), "רק אם…" (תנאי הכרחי), ו"אם ורק אם…" .
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex justify-center mb-4"
          >
            <span className="text-lg font-semibold">
              שאלה {q.number} / {QUESTIONS.length}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card className="max-w-xl mx-auto p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{q.level}</span>
                <span
                  className={`font-mono text-lg ${
                    timer <= 15 ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {timer}ש
                </span>
              </div>
              <div className="mb-4 font-medium text-lg text-right">
                {q.question}
              </div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    className={`w-full text-right justify-start p-4 h-auto text-base ${
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
                ))}
              </div>
              {selected !== null && (
                <div
                  className={`mt-4 text-center font-semibold ${
                    feedback ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feedback ? "נכון!" : "לא נכון"}
                </div>
              )}
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex justify-between mt-4"
          >
            <Button variant="outline" onClick={onPrevious}>
              שלב קודם
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRestart}
                className="text-xs"
              >
                🔄 Restart Quiz (Dev)
              </Button>
              <span className="text-gray-500">ניקוד: {score}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
