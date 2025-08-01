// English Language Assessment Step

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP3_QUESTIONS } from "@/lib/constants/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Fireworks from "react-canvas-confetti";
import { Answer } from "@/lib/types";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step3Props {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step3({ onNext, onPrevious }: Step3Props) {
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
  const [feedback, setFeedback] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [fireworksConductor, setFireworksConductor] = useState<any>(null);
  const isSubmitting = storeIsSubmitting;
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const passed = score / QUESTIONS.length >= 0.7;

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
        if (answeredCount === STEP3_QUESTIONS.length) {
          setIsFinished(true);
        } else if (answeredCount > 0) {
          setCurrent(answeredCount);
        }
      } catch (error) {
        console.error("Error fetching Step 3 answers:", error);
      }
    };
    loadAnswers();
  }, []);

  useEffect(() => {
    if (isFinished) return;
    if (timer === 0) {
      handleNext(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isFinished]);

  useEffect(() => {
    setTimer(30);
    setSelected(null);
    setFeedback(false);
    setAnimationKey((prev) => prev + 1);
  }, [current]);

  useEffect(() => {
    if (isFinished && passed && fireworksConductor) {
      fireworksConductor.run({ speed: 3, duration: 2000 });
    }
  }, [isFinished, fireworksConductor, passed]);

  const handleNext = (skipped: boolean) => {
    if (skipped) {
      setAnswers((prev) => ({
        ...prev,
        [QUESTIONS[current].id]: null,
      }));
    }
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleSelect = async (option: string) => {
    if (selected !== null) return;
    const question = QUESTIONS[current];
    const isCorrect =
      question.options.indexOf(option) === question.correct_option;
    setSelected(option);
    setFeedback(isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setAnswer(question.id, option);
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    setTimeout(() => {
      handleNext(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    setSubmissionError(null);
    try {
      await submit();
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
            <h2 className="text-3xl font-bold text-center mb-6">
              {passed ? "Congratulations!" : "Review your answers"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">שאלה</th>
                    <th className="p-2 border">תשובה</th>
                    <th className="p-2 border">תשובה נכונה</th>
                    <th className="p-2 border">תוצאה</th>
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
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{q.question}</td>
                        <td className="p-2 border">
                          {userAnswer ?? (
                            <span className="italic text-gray-500">דילגת</span>
                          )}
                        </td>
                        <td className="p-2 border">
                          {q.options[q.correct_option]}
                        </td>
                        <td className="p-2 border text-center">
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
            <Button
              className="mt-8"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "שולח..." : "המשך לשלב הבא"}
            </Button>
            {submissionError && (
              <p className="text-red-500 mt-4">שגיאה: {submissionError}</p>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl font-bold mb-4 text-center"
          >
            English Language Assessment
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center mb-4"
          >
            <span className="text-lg font-semibold">
              Question {current + 1} / {QUESTIONS.length}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="max-w-xl mx-auto p-6 mb-6">
              <div className="flex justify-end items-center mb-2">
                <span
                  className={`font-mono text-lg ${
                    timer <= 10 ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {timer}s
                </span>
              </div>
              <div dir="ltr" className="mb-4 font-medium">
                {q.question}
              </div>
              <div dir="ltr" className="space-y-2">
                {q.options.map((opt) => (
                  <Button
                    key={opt}
                    className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${
                      selected !== null
                        ? q.options.indexOf(opt) === q.correct_option
                          ? "bg-green-200 hover:bg-green-200"
                          : opt === selected
                          ? "bg-red-200 hover:bg-red-200"
                          : ""
                        : ""
                    }`}
                    variant={selected === opt ? "default" : "outline"}
                    disabled={selected !== null}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
              {selected !== null && (
                <div
                  dir="ltr"
                  className={`mt-4 text-center font-semibold ${
                    feedback ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {feedback ? "Correct!" : "Incorrect"}
                </div>
              )}
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex justify-between mt-4"
          >
            <Button variant="outline" onClick={onPrevious}>
              Previous Step
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
