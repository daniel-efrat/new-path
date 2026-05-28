"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STEP9_QUESTIONS } from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step9Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
}

const QUESTIONS = STEP9_QUESTIONS;
const STEP_NUMBER = 11;
const QUESTION_SECONDS = 25;

export default function Step9({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
}: Step9Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUESTIONS.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(QUESTION_SECONDS);
  const [showResult, setShowResult] = useState(false);
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusLeft, setStimulusLeft] = useState(0);

  const question = QUESTIONS[current];
  const answeredCount = answers.filter((answer) => answer !== null).length;

  const categoryScores = useMemo(() => {
    return QUESTIONS.reduce<Record<string, { correct: number; total: number }>>(
      (acc, item, index) => {
        const row = acc[item.category] || { correct: 0, total: 0 };
        row.total += 1;
        if (answers[index] === item.correct_option) {
          row.correct += 1;
        }
        acc[item.category] = row;
        return acc;
      },
      {}
    );
  }, [answers]);

  const completeOrAdvance = useCallback(
    (nextAnswers: (number | null)[]) => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((value) => value + 1);
        return;
      }

      setScore(
        nextAnswers.reduce<number>(
          (total, answer, index) =>
            answer === QUESTIONS[index].correct_option ? total + 1 : total,
          0
        )
      );
      if (resultsMode) {
        setShowResult(true);
      } else {
        void (async () => {
          await onComplete?.();
          onNext?.();
        })();
      }
    },
    [current, onComplete, onNext, resultsMode]
  );

  const handleSkip = useCallback(async () => {
    if (answers[current] !== null) {
      completeOrAdvance(answers);
      return;
    }

    const nextAnswers = [...answers];
    nextAnswers[current] = -1;
    setAnswers(nextAnswers);
    await setAnswer(question.id, -1, false, STEP_NUMBER);
    completeOrAdvance(nextAnswers);
  }, [answers, completeOrAdvance, current, question.id, setAnswer]);

  const handleSelect = useCallback(
    async (optionIndex: number) => {
      if (selected !== null || showStimulus) return;

      const isCorrect = optionIndex === question.correct_option;
      const nextAnswers = [...answers];
      nextAnswers[current] = optionIndex;

      setSelected(optionIndex);
      setAnswers(nextAnswers);
      setScore(
        nextAnswers.reduce<number>(
          (total, answer, index) =>
            answer === QUESTIONS[index].correct_option ? total + 1 : total,
          0
        )
      );

      await setAnswer(question.id, optionIndex, isCorrect, STEP_NUMBER);
      setSelected(null);
      completeOrAdvance(nextAnswers);
    },
    [
      answers,
      completeOrAdvance,
      current,
      question.correct_option,
      question.id,
      selected,
      setAnswer,
      showStimulus,
    ]
  );

  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoadingAnswers(true);
      try {
        const fetchedAnswers = await fetchStepAnswers(
          QUESTIONS.map((item) => item.id)
        );
        const nextAnswers = QUESTIONS.map((item) => {
          const stored = fetchedAnswers[item.id]?.value;
          if (stored === undefined || stored === null) return null;
          const value =
            typeof stored === "string" ? parseInt(stored) : Number(stored);
          return Number.isFinite(value) ? value : null;
        });

        setAnswers(nextAnswers);
        setScore(
          nextAnswers.reduce<number>(
            (total, answer, index) =>
              answer === QUESTIONS[index].correct_option ? total + 1 : total,
            0
          )
        );

        if (nextAnswers.every((answer) => answer !== null) && resultsMode) {
          setShowResult(true);
        }
      } catch (error) {
        console.error("Error loading attention and memory answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadAnswers();
  }, []);

  useEffect(() => {
    if (showResult) return;

    setTimer(QUESTION_SECONDS);
    setSelected(null);

    if (question.stimulus && answers[current] === null) {
      setShowStimulus(true);
      setStimulusLeft(question.stimulusSeconds || 5);
    } else {
      setShowStimulus(false);
      setStimulusLeft(0);
    }
  }, [
    answers,
    current,
    question.stimulus,
    question.stimulusSeconds,
    showResult,
  ]);

  useEffect(() => {
    if (showResult || selected !== null) return;
    if (timer === 0) {
      handleSkip();
      return;
    }

    const interval = setInterval(() => {
      setTimer((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [handleSkip, selected, showResult, timer]);

  useEffect(() => {
    if (!showStimulus) return;
    if (stimulusLeft === 0) {
      setShowStimulus(false);
      return;
    }

    const interval = setInterval(() => {
      setStimulusLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [showStimulus, stimulusLeft]);

  const handleContinue = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    await onComplete?.();
    onNext?.();
  };

  if (isLoadingAnswers) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  if (showResult) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">תוצאות מבדק קשב וזיכרון</h1>
          <p className="mt-3 text-lg">
            הניקוד שלך: {score} מתוך {QUESTIONS.length} (
            {Math.round((score / QUESTIONS.length) * 100)}%)
          </p>
        </div>

        <Card className="bg-white text-background">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-xl font-semibold">פירוט לפי תחום</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(categoryScores).map(([category, result]) => (
                <div key={category} className="rounded-md border p-4">
                  <div className="font-semibold">{category}</div>
                  <div className="mt-2 text-sm text-gray-600">
                    {result.correct} מתוך {result.total}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-3xl mx-auto mt-6 p-4 bg-white rounded-sm overflow-x-auto">
          <table className="p-2 w-full border text-right text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-background">#</th>
                <th className="p-2 border text-background">תחום</th>
                <th className="p-2 border text-background">שאלה</th>
                <th className="p-2 border text-background">התשובה שלך</th>
                <th className="p-2 border text-background">תשובה נכונה</th>
                <th className="p-2 border text-background">ציון</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((item, index) => {
                const answer = answers[index];
                const isCorrect = answer === item.correct_option;
                return (
                  <tr
                    key={item.id}
                    className={isCorrect ? "bg-green-50" : "bg-red-50"}
                  >
                    <td className="p-2 border text-background text-center">
                      {item.number}
                    </td>
                    <td className="p-2 border text-background">
                      {item.category}
                    </td>
                    <td className="p-2 border text-background">
                      {item.question}
                    </td>
                    <td className="p-2 border text-background">
                      {answer !== null && answer >= 0
                        ? item.options[answer]
                        : "לא נענה"}
                    </td>
                    <td className="p-2 border text-background">
                      {item.options[item.correct_option]}
                    </td>
                    <td className="p-2 border text-background text-center">
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

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleContinue}>חזרה לדו״ח הראשי</Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        className="mx-auto max-w-2xl space-y-5 p-4"
        dir="rtl"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">מבדק קשב, סינון מידע וזיכרון</h1>
          <p className="mt-2 text-sm text-white/75">
            שאלה {question.number} מתוך {QUESTIONS.length}
          </p>
        </div>

        <Card className="bg-white text-background">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{question.category}</Badge>
                <span className="text-sm text-gray-600">{question.level}</span>
              </div>
              <span
                className={`font-mono text-lg ${
                  timer <= 8 ? "text-red-700" : "text-gray-700"
                }`}
              >
                {timer} שניות
              </span>
            </div>

            {question.stimulus ? (
              <div className="rounded-md border bg-gray-50 p-4 text-center">
                <div className="text-xs font-semibold text-gray-500">גירוי</div>
                <div className="mt-2 text-xl font-semibold tracking-normal">
                  {showStimulus ? question.stimulus : "הגירוי הוסתר"}
                </div>
                {showStimulus ? (
                  <div className="mt-2 text-xs text-gray-500">
                    נשארו {stimulusLeft} שניות לצפייה
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="text-lg font-semibold leading-8">
              {question.question}
            </div>

            <div className="grid gap-2">
              {question.options.map((option, index) => (
                <Button
                  key={option}
                  variant="outline"
                  disabled={showStimulus || selected !== null}
                  onClick={() => handleSelect(index)}
                  className={`h-auto justify-center whitespace-normal p-4 text-base disabled:opacity-100 ${
                    selected !== null
                      ? index === selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-900"
                      : ""
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>

          </CardContent>
        </Card>

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              נענו {answeredCount}/{QUESTIONS.length}
            </span>
            <Button variant="outline" onClick={handleSkip}>
              דלג
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
