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
  onComplete: () => Promise<void>;
  resultsMode?: boolean;
  onBackToReport?: () => void;
  waitForBreakReminderIfDue?: () => Promise<void>;
  pauseQuestionTimer?: boolean;
}

export default function Step7({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
  waitForBreakReminderIfDue,
  pauseQuestionTimer = false,
}: Step7Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
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
        if (answeredCount === STEP7_QUESTIONS.length && resultsMode) {
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
    if (showResults || pauseQuestionTimer) return;
    if (timer === 0) {
      // Auto-advance to next question when timer runs out
      void handleNextQuestion();
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, showResults, pauseQuestionTimer]);

  // Reset timer when changing questions
  useEffect(() => {
    setTimer(45);
    setSelectedShape(null);
  }, [currentQuestion]);

  const handleShapeSelect = async (shapeId: number) => {
    if (selectedShape !== null) return;

    setSelectedShape(shapeId);
    const correct = shapeId === currentQ.correct_option;

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
      await setAnswer(currentQ.id, shapeId, undefined, 6);
    } catch (error) {
      console.warn("Failed to save Step7 answer to database:", error);
      // Continue without database storage - answers are still tracked locally
    }

    await handleNextQuestion();
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < STEP7_QUESTIONS.length - 1) {
      await waitForBreakReminderIfDue?.();
      setCurrentQuestion((prev) => prev + 1);
      setSelectedShape(null);
      setTimer(45); // Reset timer for new question
      setAnimationKey((prev) => prev + 1); // Trigger animation reset
    } else {
      // All questions completed
      if (resultsMode) {
        await waitForBreakReminderIfDue?.();
        setShowResults(true);
      } else {
        await waitForBreakReminderIfDue?.();
        await onComplete();
        if (onNext) onNext();
      }
    }
  };

  const handleComplete = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    try {
      await onComplete();
      if (onNext) onNext();
    } catch (error) {
      console.error("Error completing step 7:", error);
    }
  };

  if (showResults) {
    return (
      <div
        dir="rtl"
        className="min-h-[400px] flex flex-col items-center justify-center relative"
      >
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold my-6">תוצאות המבחן</h1>
          <div className="text-xl mb-8">
            הניקוד שלך: {score} מתוך {STEP7_QUESTIONS.length} (
            {Math.round((score / STEP7_QUESTIONS.length) * 100)}%)
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
                {STEP7_QUESTIONS.map((q, idx) => {
                  const userAnswer = answers[idx];
                  const correctIdx = q.correct_option;
                  const isCorrect = userAnswer === correctIdx;

                  return (
                    <tr
                      key={q.id}
                      className={isCorrect ? "bg-green-50" : "bg-red-50"}
                    >
                      <td className="p-2 border text-background text-center">
                        {q.number}
                      </td>
                      <td className="p-2 border text-background">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-xs text-gray-600">
                            {q.level}
                          </span>
                          <Image
                            src={q.question}
                            alt={`שאלה ${q.number}`}
                            width={88}
                            height={88}
                            className="rounded border bg-white"
                          />
                        </div>
                      </td>
                      <td className="p-2 border text-background">
                        {userAnswer !== null ? (
                          <div className="flex flex-col items-center gap-2">
                            <Image
                              src={q.options[userAnswer]}
                              alt={`התשובה שלך לשאלה ${q.number}`}
                              width={56}
                              height={56}
                              className="rounded border bg-white"
                            />
                            <span>אפשרות {userAnswer + 1}</span>
                          </div>
                        ) : (
                          "דילגת"
                        )}
                      </td>
                      <td className="p-2 border text-background">
                        <div className="flex flex-col items-center gap-2">
                          <Image
                            src={q.options[correctIdx]}
                            alt={`התשובה הנכונה לשאלה ${q.number}`}
                            width={56}
                            height={56}
                            className="rounded border bg-white"
                          />
                          <span>אפשרות {correctIdx + 1}</span>
                        </div>
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
            <Button onClick={handleComplete}>חזרה לדו״ח הראשי</Button>
          </div>
        </div>
      </div>
    );
  }

  const questionLabel = `שאלה ${currentQuestion + 1} מתוך ${STEP7_QUESTIONS.length}`;

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
                <h3 className="text-lg font-semibold text-primary mb-3">
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
                <span className="text-sm text-muted-foreground ">
                  {currentQ.level}
                </span>
                <span
                  className={`font-mono text-lg ${
                    timer <= 15 ? "text-orange-300" : "text-muted-foreground"
                  }`}
                >
                  {timer} שניות
                </span>
              </div>
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Image
                    src={currentQ.question}
                    alt={`דפוס חזותי לזיהוי, ${questionLabel}`}
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
              {currentQ.options.map((optionSrc, idx) => {
                const optionLabel = `אפשרות ${idx + 1} עבור ${questionLabel}`;
                return (
                  <div
                    key={`${currentQ.id}-${idx}-${animationKey}`}
                    className="relative"
                  >
                  <motion.button
                    onClick={() => handleShapeSelect(idx)}
                    disabled={selectedShape !== null}
                    aria-label={optionLabel}
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
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                      }
                    `}
                  >
                    <Image
                      src={optionSrc}
                      alt={optionLabel}
                      width={100}
                      height={100}
                      className="mx-auto"
                    />

                    {/* Selection indicator */}
                    {selectedShape === idx && (
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white z-10"></div>
                    )}

                  </motion.button>
                </div>
                );
              })}
            </div>

          </Card>

          {/* Navigation Buttons - Consistent across all steps */}
          <div className="max-w-4xl mx-auto mt-8" aria-hidden="true" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
