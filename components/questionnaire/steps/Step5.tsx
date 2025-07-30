import { useState, useEffect } from "react";
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
  const [stepAnswers, setStepAnswers] = useState<Record<string, AnswerState>>(
    {}
  );
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

  const [fireworksConductor, setFireworksConductor] = useState<any>(null);

  const passed = score / QUESTIONS.length >= 0.7;

  // Development restart function
  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setScore(0);
    setTimer(90);
    setShowResult(false);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setStepAnswers({});
    // Clear stored answers from the store as well
    QUESTIONS.forEach((q) => {
      setAnswer(q.id, { value: null, isCorrect: false });
    });
  };

  // Fetch answers directly from Supabase on component mount
  useEffect(() => {
    const loadStepAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const questionIds = QUESTIONS.map((q) => q.id);
        const fetchedAnswers = await fetchStep5Answers(questionIds);
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
        console.error("Error loading Step 5 answers:", error);
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
    setTimer(90);
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
  }, [current, answers]);

  const handleContinue = () => {
    console.log("handleContinue called in Step5");
    console.log("onNext prop exists:", !!onNext);
    if (onNext) {
      console.log("Calling onNext from Step5");
      onNext();
    } else {
      console.log("onNext prop is not available");
    }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;

    setSelected(idx);
    const isCorrect = QUESTIONS[current].correct_option === idx;
    setFeedback(isCorrect);

    // Update answers array
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);

    // Update score
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Store answer in the store
    setAnswer(QUESTIONS[current].id, {
      value: idx,
      isCorrect: isCorrect,
    });

    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleNext(false);
    }, 2000);
  };

  const handleNext = (skipped: boolean) => {
    if (skipped && selected === null) {
      // Store null answer for skipped question
      setAnswer(QUESTIONS[current].id, {
        value: null,
        isCorrect: false,
      });
    }

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
      if (passed && fireworksConductor) {
        fireworksConductor();
      }
    }
  };

  if (isLoadingAnswers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען תשובות קודמות...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div dir="rtl" className="text-center">
        <Fireworks onInit={({ conductor }) => setFireworksConductor(conductor)} />
        <h1 className="text-3xl font-bold mb-6">
          {passed ? "🎉 כל הכבוד!" : "😔 לא עברת"}
        </h1>
        <div className="text-xl mb-8">
          הניקוד שלך: {score} מתוך {QUESTIONS.length} (
          {Math.round((score / QUESTIONS.length) * 100)}%)
        </div>
        <div className="mb-8">
          {passed
            ? "עברת בהצלחה את מבחן הלוגיקה!"
            : "נדרש ציון של 70% לפחות כדי לעבור."}
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-semibold mb-4">סיכום תשובות:</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">שאלה</th>
                <th className="border border-gray-300 p-2">התשובה שלך</th>
                <th className="border border-gray-300 p-2">תשובה נכונה</th>
                <th className="border border-gray-300 p-2">תוצאה</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((q, idx) => {
                const userAnswer = answers[idx];
                const isCorrect = userAnswer === q.correct_option;
                return (
                  <tr key={q.id} className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                    <td className="border border-gray-300 p-2 font-medium">
                      {q.number}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {userAnswer !== null ? q.options[userAnswer] : "לא נענה"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {q.options[q.correct_option]}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {isCorrect ? (
                          <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
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
      </div>
    );
  }

  const q = QUESTIONS[current];

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold mb-4 text-center">מבחן לוגיקה</h1>
      
      {/* Instructions */}
      <Card className="max-w-4xl mx-auto p-6 mb-6 bg-blue-50 border-blue-200">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">הוראות:</h3>
          <div className="text-right leading-relaxed text-gray-800 bg-white p-4 rounded border">
            ענו לפי המידע שמופיע בכל שאלה בלבד. אל תניחו עובדות שלא ניתנו. זכרו: מטענה כללית ("כל…") אי‑אפשר להסיק קיום פרטים; מטענת קיום ("יש…") לא מסיקים כלל על כולם. הבחינו בין "אם… אז…" (תנאי מספיק), "רק אם…" (תנאי הכרחי), ו"אם ורק אם…".
          </div>
        </div>
      </Card>

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
              timer <= 15 ? "text-red-500" : "text-gray-700"
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
      <div className="flex justify-between mt-4">
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
      </div>
    </div>
  );
}
