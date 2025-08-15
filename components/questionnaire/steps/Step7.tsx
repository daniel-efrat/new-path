import { useState, useEffect } from "react";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP7_QUESTIONS } from "@/lib/constants/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { ShapeQuestion } from "@/lib/constants/questions";
import { fetchStep7Answers } from "@/lib/utils/answerFetcher";
import type { AnswerState } from "@/lib/types/questionnaire";
import { motion, AnimatePresence } from "framer-motion";

interface Step7Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => void;
}

export default function Step7({ onNext, onPrevious, onComplete }: Step7Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(STEP7_QUESTIONS.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(45);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  const currentQ = STEP7_QUESTIONS[currentQuestion];

  // Dynamic instructions per question ranges
  const getInstructionText = (qIndex: number): string => {
    // 1-3: existing instructions
    if (qIndex >= 0 && qIndex <= 2) {
      return "התבוננו בדפוס המורכב למעלה ובחרו איזה מהצורות הפשוטות למטה מופיעה בתוכו.";
    }
    // 4
    if (qIndex === 3) {
      return "התבוננו בצמד השמאלי, גלו מהו השינוי מצורה א’ לצורה ב’ (כיוון/היפוך/החלפת צבעים), החילו את אותה פעולה על הצורה שבצמד הימני, ובחרו את התוצאה הנכונה.";
    }
    // 5-6
    if (qIndex >= 4 && qIndex <= 5) {
      return "התבוננו בריבועים בלוח, מצאו את החוקיות של הצורות ובחרו מבין האפשרויות את הריבוע שמשלים את הדפוס במיקום הריק.";
    }
    // 7-8
    if (qIndex >= 6 && qIndex <= 7) {
      return "התבוננו במבנה הקוביות התלת־ממדי, דמיינו אותו במבט מלמעלה, ובחרו מבין האפשרויות את התבנית הדו־ממדית (סידור הריבועים) התואמת למבנה.";
    }
    // 9-14
    return "התבוננו בריבועים בלוח, מצאו את החוקיות של הצורות והעיגולים, ובחרו מבין האפשרויות את הריבוע שמשלים את הדפוס במיקום הריק.";
  };

  // Development restart function
  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedShape(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setTimer(45);
    setShowResults(false);
    setAnswers(Array(STEP7_QUESTIONS.length).fill(null));
    // Clear stored answers from the store as well
    STEP7_QUESTIONS.forEach((q) => {
      try {
        setAnswer(q.id, null);
      } catch (error) {
        console.warn("Failed to clear answer for question:", q.id);
      }
    });
  };

  // Load answers on component mount
  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = STEP7_QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep7Answers(questionIds);

        // Convert fetched answers to local format and calculate score
        const newAnswers = STEP7_QUESTIONS.map((q) => {
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

        // Calculate score based on fetched answers
        const newScore = newAnswers.reduce((acc, answer, index) => {
          if (
            answer !== null &&
            answer === STEP7_QUESTIONS[index].correct_option
          ) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setScore(newScore);

        // If all questions are answered, show results view
        const answeredCount = newAnswers.filter(
          (answer) => answer !== null
        ).length;
        if (answeredCount === STEP7_QUESTIONS.length) {
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error loading Step 6 answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadStepAnswers();
  }, []);

  // Timer effect - auto advance when timer reaches 0
  useEffect(() => {
    if (showResults || showFeedback) return;
    if (timer === 0) {
      // Auto-advance to next question when timer runs out
      handleNextQuestion();
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showResults, showFeedback]);

  // Reset timer when changing questions
  useEffect(() => {
    setTimer(45);
    // Check if current question already has an answer
    const currentAnswer = answers[currentQuestion];
    if (currentAnswer !== null) {
      setSelectedShape(currentAnswer);
      const isCorrect = currentAnswer === currentQ.correct_option;
      setIsCorrect(isCorrect);
      setShowFeedback(true);
    } else {
      setSelectedShape(null);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  }, [currentQuestion, answers, currentQ.correct_option]);

  const handleShapeSelect = (shapeId: number) => {
    if (showFeedback) return; // Prevent selection after feedback is shown

    setSelectedShape(shapeId);
    const correct = shapeId === currentQ.correct_option;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = shapeId;
    setAnswers(newAnswers);

    // Update score
    if (correct && answers[currentQuestion] === null) {
      setScore((prev) => prev + 1);
    }

    // Store the answer (only store the selected shape ID)
    try {
      setAnswer(currentQ.id, shapeId);
    } catch (error) {
      console.warn("Failed to save Step7 answer to database:", error);
      // Continue without database storage - answers are still tracked locally
    }

    // Auto-advance to next question after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < STEP7_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedShape(answers[currentQuestion + 1]);
      setShowFeedback(answers[currentQuestion + 1] !== null);
      if (answers[currentQuestion + 1] !== null) {
        setIsCorrect(
          answers[currentQuestion + 1] ===
            STEP7_QUESTIONS[currentQuestion + 1].correct_option
        );
      }
      setTimer(45); // Reset timer for new question
      setAnimationKey((prev) => prev + 1); // Trigger animation reset
    } else {
      // All questions completed
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setSelectedShape(answers[currentQuestion - 1]);
      setShowFeedback(answers[currentQuestion - 1] !== null);
      if (answers[currentQuestion - 1] !== null) {
        setIsCorrect(
          answers[currentQuestion - 1] ===
            STEP7_QUESTIONS[currentQuestion - 1].correct_option
        );
      }
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (showResults) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold my-6">תוצאות המבחן</h1>
        <div className="text-xl mb-8">
          הניקוד שלך: {score} מתוך {STEP7_QUESTIONS.length} (
          {Math.round((score / STEP7_QUESTIONS.length) * 100)}%)
        </div>

        {/* Results summary */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">סיכום תשובות:</h3>
          <div className="space-y-4">
            {STEP7_QUESTIONS.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correct_option;
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <span>שאלה {q.number}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      תשובתך: {userAnswer !== null ? userAnswer + 1 : "לא נענה"}
                    </span>
                    {isCorrect ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={handleRestart} className="text-xs">
            🔄 Restart Quiz (Dev)
          </Button>
          <Button
            onClick={handleComplete}
            className="bg-blue-600 hover:bg-blue-700"
          >
            המשך לשלב הבא
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey} // Use animationKey to trigger re-animation
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <motion.h1
            className="text-2xl font-bold mb-6 mt-6 text-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0 }}
          >
            זיהוי דפוסים
          </motion.h1>

          {/* Progress indicator */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-lg font-semibold">
              שאלה {currentQuestion + 1} מתוך {STEP7_QUESTIONS.length}
            </span>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  הוראות:
                </h3>
                <div className="text-right leading-relaxed text-gray-800 bg-white p-4 rounded border">
                  {getInstructionText(currentQuestion)}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main pattern image */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">{currentQ.level}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    זמן נותר: {timer}
                  </span>
                  {/* <Button
                    onClick={handleRestart}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    התחל מחדש (dev)
                  </Button> */}
                </div>
              </div>
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Image
                    src={currentQ.question}
                    alt="דפוס לזיהוי"
                    width={300}
                    height={300}
                    className="rounded border"
                  />
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Shape options */}
          <Card className="p-6 mb-6">
            <motion.h3
              className="text-lg font-semibold mb-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              בחרו את הצורה הנכונה:
            </motion.h3>

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
              dir="ltr"
            >
              {currentQ.options.map((optionSrc, idx) => (
                <div
                  key={`${currentQ.id}-${idx}-${animationKey}`}
                  className="relative"
                >
                  <motion.button
                    onClick={() => handleShapeSelect(idx)}
                    disabled={showFeedback}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.7 + idx * 0.1,
                    }}
                    className={`
                      relative w-full p-4 border-2 rounded-lg cursor-pointer bg-white transition-all duration-200
                      ${
                        selectedShape === idx
                          ? showFeedback
                            ? isCorrect
                              ? "border-green-500 bg-green-50 shadow-lg"
                              : "border-red-500 bg-red-50 shadow-lg"
                            : "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                      }
                      ${
                        showFeedback &&
                        idx === currentQ.correct_option &&
                        !isCorrect &&
                        "border-green-500 bg-green-50 shadow-md"
                      }
                      ${
                        showFeedback &&
                        selectedShape === idx &&
                        !isCorrect &&
                        "opacity-50"
                      }
                    `}
                  >
                    <Image
                      src={optionSrc}
                      alt={`Shape option ${idx + 1}`}
                      width={100}
                      height={100}
                      className="mx-auto"
                    />

                    {/* Selection indicator */}
                    {selectedShape === idx && (
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white z-10"></div>
                    )}

                    {/* Feedback indicators */}
                    {showFeedback && selectedShape === idx && (
                      <div className="absolute -top-2 -right-2 z-10">
                        {isCorrect ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show correct answer indicator */}
                    {showFeedback &&
                      idx === currentQ.correct_option &&
                      selectedShape !== currentQ.correct_option && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                  </motion.button>
                </div>
              ))}
            </div>

            {/* Feedback message */}
            {showFeedback && (
              <div className="mt-6 text-center" dir="rtl">
                <div
                  className={`text-lg font-semibold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "נכון!" : "לא נכון. הצורה הנכונה מסומנת."}
                </div>
              </div>
            )}
          </Card>

          {/* Navigation Buttons - Consistent across all steps */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center mx-4">
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
              {showFeedback && (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentQuestion < STEP7_QUESTIONS.length - 1
                    ? "שאלה הבאה"
                    : "סיום המבחן"}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
