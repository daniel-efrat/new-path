import { useState, useEffect } from "react";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STEP6_QUESTIONS } from "@/lib/constants/questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { ShapeQuestion } from "@/lib/constants/questions";

interface Step6Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void>;
}

export default function Step6({ onNext, onPrevious, onComplete }: Step6Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedShape, setSelectedShape] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(STEP6_QUESTIONS.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(45);

  const currentQ = STEP6_QUESTIONS[currentQuestion];

  // Development restart function
  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedShape(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setTimer(45);
    setShowResults(false);
    setAnswers(Array(STEP6_QUESTIONS.length).fill(null));
    // Clear stored answers from the store as well
    STEP6_QUESTIONS.forEach((q) => {
      try {
        setAnswer(q.id, null);
      } catch (error) {
        console.warn("Failed to clear answer for question:", q.id);
      }
    });
  };

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
      console.warn("Failed to save Step6 answer to database:", error);
      // Continue without database storage - answers are still tracked locally
    }

    // Auto-advance to next question after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < STEP6_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedShape(answers[currentQuestion + 1]);
      setShowFeedback(answers[currentQuestion + 1] !== null);
      if (answers[currentQuestion + 1] !== null) {
        setIsCorrect(
          answers[currentQuestion + 1] ===
            STEP6_QUESTIONS[currentQuestion + 1].correct_option
        );
      }
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
            STEP6_QUESTIONS[currentQuestion - 1].correct_option
        );
      }
    }
  };

  const handleComplete = () => {
    if (onNext) {
      onNext();
    }
  };

  // Show results screen after all questions are completed
  if (showResults) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">
          {score === STEP6_QUESTIONS.length ? "🎉 כל הכבוד!" : "תוצאות המבחן"}
        </h1>
        <div className="text-xl mb-8">
          הניקוד שלך: {score} מתוך {STEP6_QUESTIONS.length} (
          {Math.round((score / STEP6_QUESTIONS.length) * 100)}%)
        </div>

        {/* Results summary */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">סיכום תשובות:</h3>
          <div className="space-y-4">
            {STEP6_QUESTIONS.map((q, idx) => {
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

        <div className="flex justify-between">
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
      <h1 className="text-2xl font-bold mb-6 text-center">זיהוי דפוסים</h1>

      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <span className="text-lg font-semibold">
          שאלה {currentQuestion + 1} מתוך {STEP6_QUESTIONS.length}
        </span>
      </div>

      {/* Instructions */}
      <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">הוראות:</h3>
          <div className="text-right leading-relaxed text-gray-800 bg-white p-4 rounded border">
            התבוננו בדפוס המורכב למעלה ובחרו איזה מהצורות הפשוטות למטה מופיעה
            בתוכו.
          </div>
        </div>
      </Card>

      {/* Main pattern image */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">{currentQ.level}</span>
          <span
            className={`font-mono text-lg ${
              timer <= 10 ? "text-red-500" : "text-gray-700"
            }`}
          >
            {timer}ש
          </span>
        </div>
        <div className="text-center mb-4">
          <div className="flex justify-center">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <Image
                src={currentQ.question}
                alt={`Pattern ${currentQuestion + 1} to analyze`}
                width={400}
                height={300}
                className="max-w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Shape options */}
      <Card className="p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-4">בחרו את הצורה הנכונה:</h3>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          dir="ltr"
        >
          {currentQ.options.map((optionSrc, idx) => (
            <button
              key={idx}
              onClick={() => handleShapeSelect(idx)}
              disabled={showFeedback}
              className={`
                relative p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer bg-white
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
                  selectedShape !== currentQ.correct_option
                    ? "border-green-500 bg-green-50"
                    : ""
                }
                disabled:cursor-not-allowed
              `}
            >
              <div className="flex flex-col items-center">
                <Image
                  src={optionSrc}
                  alt={`Shape option ${idx + 1}`}
                  width={currentQ.number === 4 ? 20 : 80}
                  height={currentQ.number === 4 ? 20 : 80}
                  className="mb-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  {idx + 1}
                </span>
              </div>

              {/* Feedback indicators */}
              {showFeedback && selectedShape === idx && (
                <div className="absolute -top-2 -right-2">
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
                  <div className="absolute -top-2 -right-2">
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
            </button>
          ))}
        </div>

        {/* Feedback message */}
        {showFeedback && (
          <div className="mt-6 text-center">
            <div
              className={`text-lg font-semibold ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCorrect
                ? "כל הכבוד! בחרתם נכון."
                : "לא נכון. הצורה הנכונה מסומנת."}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrevious}>
            שלב קודם
          </Button>
          {currentQuestion > 0 && (
            <Button variant="outline" onClick={handlePreviousQuestion}>
              שאלה קודמת
            </Button>
          )}
          <Button variant="outline" onClick={handleRestart} className="text-xs">
            🔄 Restart Quiz (Dev)
          </Button>
        </div>

        {showFeedback && (
          <Button
            onClick={handleNextQuestion}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentQuestion < STEP6_QUESTIONS.length - 1
              ? "שאלה הבאה"
              : "סיום המבחן"}
          </Button>
        )}
      </div>
    </div>
  );
}
