import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STEP7_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStep7Answers } from "@/lib/utils/answerFetcher";
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

interface Step7Props {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step7({ onNext, onPrevious }: Step7Props) {
  const QUESTIONS: Question[] = STEP7_QUESTIONS;

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
      setAnswer(q.id, { value: null, isCorrect: false });
    });
  };

  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep7Answers(questionIds);
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

  const handleContinue = () => {
    onNext();
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    const isCorrect = QUESTIONS[current].correct_option === idx;
    setSelected(idx);
    setFeedback(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setAnswer(QUESTIONS[current].id, { value: idx, isCorrect });

    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);

    setTimeout(() => {
      handleNext(false);
    }, 1200);
  };

  const handleNext = (skipped: boolean) => {
    if (skipped && selected === null) {
      setAnswer(QUESTIONS[current].id, { value: null, isCorrect: false });
    }

    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setFeedback(null);
      setTimer(40);
      setAnimationKey((prev) => prev + 1);
    } else {
      setShowResult(true);
      setAnimationKey((prev) => prev + 1);
    }
  };

  if (isLoadingAnswers) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">טוען נתונים...</div>
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <AnimatePresence mode="wait">
      {showResult ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto p-8">
            <h2 className="text-2xl font-bold mb-4">
              {passed ? "כל הכבוד, עברת!" : "לא נורא, נסה שוב"}
            </h2>
            <p className="text-lg mb-6">
              הציון שלך: {score} מתוך {QUESTIONS.length}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart}>נסה שוב</Button>
              <Button
                onClick={handleContinue}
                disabled={!passed}
                className={!passed ? "cursor-not-allowed" : ""}
              >
                המשך לשלב הבא
              </Button>
            </div>
          </Card>
          {passed && (
            <Fireworks
              onInit={({ conductor }) => {
                setFireworksConductor(conductor);
                conductor.fire();
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
              }}
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-2xl mx-auto"
        >
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
                      className={`w-full text-left justify-start p-4 h-auto text-base ${
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
