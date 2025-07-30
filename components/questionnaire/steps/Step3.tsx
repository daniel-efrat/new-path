// English Language Assessment Step

import { useState, useEffect } from "react";
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

  // Use questions in their original order (no shuffling)
  const QUESTIONS = STEP3_QUESTIONS;

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [fireworksConductor, setFireworksConductor] = useState<any>(null);
  // Use store's isSubmitting state instead of local state
  const isSubmitting = storeIsSubmitting;
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const passed = score / QUESTIONS.length >= 0.7;

  // Fetch previously saved answers on mount
  useEffect(() => {
    const loadAnswers = async () => {
      try {
        const questionIds = STEP3_QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStepAnswers(questionIds);

        console.log("Fetched Step 3 answers:", fetchedAnswers);

        // Convert fetched answers to local state format
        const localAnswers: Record<string, string | null> = {};
        let currentScore = 0;

        STEP3_QUESTIONS.forEach((question) => {
          const fetchedAnswer = fetchedAnswers[question.id];
          if (fetchedAnswer) {
            const answerValue = fetchedAnswer.value;
            localAnswers[question.id] = answerValue;

            // Calculate score for correct answers
            if (answerValue === question.options[question.correct_option]) {
              currentScore++;
            }
          }
        });

        setAnswers(localAnswers);
        setScore(currentScore);

        // If all questions are answered, show completion screen
        const answeredCount = Object.keys(localAnswers).length;
        if (answeredCount === STEP3_QUESTIONS.length) {
          setIsFinished(true);
        } else if (answeredCount > 0) {
          // Resume from where user left off
          setCurrent(answeredCount);
        }
      } catch (error) {
        console.error("Error fetching Step 3 answers:", error);
      }
    };

    loadAnswers();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isFinished) return;
    if (timer === 0) {
      handleNext(true); // Auto-skip if timer runs out
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isFinished]);

  // Reset state for next question
  useEffect(() => {
    setTimer(30);
    setSelected(null);
    setFeedback(false);
  }, [current]);

  // Fireworks effect
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
    const questionId = question.id;
    const optionIndex = question.options.indexOf(option);
    const isCorrect = optionIndex === question.correct_option;

    setSelected(option);
    setFeedback(isCorrect);
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex.toString() }));

    if (isCorrect) setScore((prev) => prev + 1);

    try {
      await setAnswer(questionId, optionIndex.toString());
    } catch (error) {
      console.error(`Failed to save answer for question ${questionId}:`, error);
    }

    setTimeout(() => {
      handleNext(false);
    }, 1200);
  };

  const handleSubmit = async () => {
    setSubmissionError(null);

    try {
      await submit();
      onNext();
    } catch (error: any) {
      setSubmissionError(error.message);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center relative">
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
        <h2 className="text-2xl font-bold mb-4">השלמת מבחן</h2>
        <p className="mb-2">
          הציון שלך: {score} מתוך {QUESTIONS.length}
        </p>
        {/* <p
          className={`font-bold mb-4 ${
            passed ? "text-green-600" : "text-red-600"
          }`}
        >
          {passed ? "עברת!" : "לא עברת"}
        </p> */}
        <div className="w-full max-w-4xl overflow-auto">
          <table dir="ltr" className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">שאלה</th>
                <th className="p-2 border">תשובתך</th>
                <th className="p-2 border">תשובה נכונה</th>
                <th className="p-2 border">תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = Number(userAnswer) === q.correct_option;
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
        <Button className="mt-8" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "שולח..." : "המשך לשלב הבא"}
        </Button>
        {submissionError && (
          <p className="text-red-500 mt-4">שגיאה: {submissionError}</p>
        )}
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div dir="ltr">
      <h1 className="text-2xl font-bold mb-4 text-center">
        English Language Assessment
      </h1>
      <div className="flex justify-center mb-4">
        <span className="text-lg font-semibold">
          Question {current + 1} / {QUESTIONS.length}
        </span>
      </div>
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
        <div className="mb-4 font-medium">{q.question}</div>
        <div className="space-y-2">
          {q.options.map((opt) => (
            <Button
              key={opt}
              className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${
                selected !== null
                  ? q.options.indexOf(opt) === q.correct_option
                    ? "bg-green-200 hover:bg-green-200"
                    : opt === selected && !feedback
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
            className={`mt-4 text-center font-semibold ${
              feedback ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback ? "Correct!" : "Incorrect"}
          </div>
        )}
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onPrevious}>
          Previous Step
        </Button>
        <span className="text-gray-500">Score: {score}</span>
      </div>
    </div>
  );
}
