import { useState, useEffect } from "react";
import { STEP2_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStep2Answers } from "@/lib/utils/answerFetcher";
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

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step2({ onNext, onPrevious }: Step2Props) {
  const QUESTIONS: Question[] = STEP2_QUESTIONS;

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

  const [fireworksConductor, setFireworksConductor] = useState<any>(null);

  const passed = score / QUESTIONS.length >= 0.7;

  // Fetch answers directly from Supabase on component mount
  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep2Answers(questionIds);
        setStepAnswers(fetchedAnswers);

        // Convert fetched answers to local format and calculate score
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

        // Calculate score based on fetched answers
        const newScore = newAnswers.reduce((acc, answer, index) => {
          if (answer !== null && answer === QUESTIONS[index].correct_option) {
            return acc + 1;
          }
          return acc;
        }, 0);
        setScore(newScore);
      } catch (error) {
        console.error("Error loading Step 2 answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadStepAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount; QUESTIONS are static

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
    // Check if current question already has an answer
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
    onNext();
  };

  useEffect(() => {
    if (showResult && passed && fireworksConductor) {
      fireworksConductor.run({ speed: 3, duration: 2000 });
    }
  }, [showResult, fireworksConductor, passed]);

  const handleSelect = async (idx: number) => {
    if (selected !== null) return;

    const question = QUESTIONS[current];
    const isCorrect = question.correct_option === idx;

    setSelected(idx);
    setFeedback(isCorrect);
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });

    if (isCorrect) setScore((s) => s + 1);

    try {
      await setAnswer(question.id, idx);

      // Update local step answers for immediate UI feedback
      setStepAnswers((prev) => ({
        ...prev,
        [question.id]: { value: String(idx), timestamp: new Date() },
      }));
    } catch (error) {
      console.error(
        `Failed to save answer for question ${question.id}:`,
        error
      );
    }

    setTimeout(() => {
      handleNext(false);
    }, 1200);
  };

  const handleNext = (skipped: boolean) => {
    if (skipped) {
      setAnswers((prev) => {
        const copy = [...prev];
        copy[current] = null;
        return copy;
      });
    }
    if (current < QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div
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
        <h2 className="text-2xl font-bold mb-4">השלמת מבחן</h2>
        <p className="mb-2">
          הציון שלך:{" "}
          <span className="font-bold">
            {score} / {QUESTIONS.length}
          </span>
        </p>
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
                      {userAns !== null ? q.options[userAns] : "דילגת"}
                    </td>
                    <td className="p-2 border">{q.options[correctIdx]}</td>
                    <td className="p-2 border text-center">
                      {isCorrect ? (
                        <span
                          title="Correct"
                          style={{ color: "#16a34a", fontSize: "1.2em" }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            style={{ display: "inline" }}
                          >
                            <path
                              fill="currentColor"
                              d="M7.629 15.314a1 1 0 0 1-1.415 0l-3.536-3.536a1 1 0 1 1 1.415-1.415l2.828 2.829 7.778-7.778a1 1 0 1 1 1.415 1.414l-8.485 8.486Z"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span
                          title="Incorrect"
                          style={{ color: "#dc2626", fontSize: "1.2em" }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            style={{ display: "inline" }}
                          >
                            <path
                              fill="currentColor"
                              d="M10 8.586 15.657 2.93a1 1 0 1 1 1.415 1.415L11.414 10l5.657 5.657a1 1 0 0 1-1.415 1.415L10 11.414l-5.657 5.657a1 1 0 0 1-1.415-1.415L8.586 10 2.929 4.343A1 1 0 1 1 4.343 2.93L10 8.586Z"
                            />
                          </svg>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button className="mt-8" onClick={handleContinue}>
          המשך לשלב הבא
        </Button>
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-center">מבחן בעברית</h1>
      <div className="flex justify-center mb-4">
        <span className="text-lg font-semibold">
          שאלה {q.number} / {QUESTIONS.length}
        </span>
      </div>
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
        <div className="mb-4 font-medium text-lg text-right">{q.question}</div>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <Button
              key={idx}
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
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onPrevious}>
          שלב קודם
        </Button>
        <span className="text-gray-500">ניקוד: {score}</span>
      </div>
    </div>
  );
}
