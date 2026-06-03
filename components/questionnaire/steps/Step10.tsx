"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RatingScale } from "@/components/questionnaire/RatingScale";
import {
  STEP10_QUESTIONS,
  type PersonalityDimension,
} from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step10Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
}

interface DimensionCopy {
  title: string;
  high: string;
  growth: string;
}

interface DimensionResult extends DimensionCopy {
  key: PersonalityDimension;
  score: number;
  answered: number;
  total: number;
}

const STEP_NUMBER = 9;
const QUESTIONS = STEP10_QUESTIONS;
const AUTO_ADVANCE_MS = 300;
const SAVE_ERROR_MESSAGE =
  "לא הצלחנו לשמור את התשובה. בדקו את החיבור ונסו שוב.";

const DIMENSION_COPY: Record<PersonalityDimension, DimensionCopy> = {
  organization: {
    title: "סדר והתמדה",
    high: "עבודה שיטתית, עקביות וסגירת קצוות",
    growth: "מסגרת עבודה, תעדוף ותזכורות יעזרו לשמור על רצף",
  },
  social: {
    title: "חברתיות ועבודת צוות",
    high: "תקשורת, שיתוף פעולה וכניסה נוחה לסביבות חדשות",
    growth: "כדאי לבחור סביבות עם גבולות ברורים בין עבודה עצמאית לצוות",
  },
  resilience: {
    title: "יציבות וגמישות",
    high: "התמודדות טובה עם שינוי, לחץ ומשוב",
    growth: "שגרות קצרות ותיאום ציפיות יכולים להפחית עומס ואי-ודאות",
  },
  curiosity: {
    title: "למידה וחדשנות",
    high: "סקרנות, למידה מהירה וחיפוש פתרונות חדשים",
    growth: "כדאי לשלב חדשנות בהדרגה כדי לא לפגוע בקצב הביצוע",
  },
  empathy: {
    title: "אמפתיה ושיתוף פעולה",
    high: "הקשבה, רגישות לאחרים וקבלת החלטות מתחשבת",
    growth: "חשוב לאזן בין צרכי אחרים לבין החלטיות וגבולות אישיים",
  },
  initiative: {
    title: "יוזמה ועצמאות",
    high: "לקיחת אחריות, פעולה עצמאית וחיפוש פתרונות",
    growth: "הגדרת יעדים ברורה תעזור להפוך יוזמה להתקדמות עקבית",
  },
};

function parseAnswer(value: unknown): number | null {
  if (value === undefined || value === null || value === "null") return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number") return null;
  if (!Number.isInteger(parsed)) return null;
  return parsed >= 1 && parsed <= 5 ? parsed : null;
}

function scoreQuestion(value: number, reverse?: boolean) {
  return reverse ? 6 - value : value;
}

function getBand(score: number) {
  if (score >= 4.2) return "גבוה מאוד";
  if (score >= 3.6) return "גבוה";
  if (score >= 2.8) return "מאוזן";
  return "דורש תמיכה";
}

export default function Step10({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
}: Step10Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const answeredCount = QUESTIONS.filter((question) =>
    Number.isInteger(answers[question.id])
  ).length;
  const isComplete = answeredCount === QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentIndex];
  const selected = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progressPercentage = Math.round(
    ((currentIndex + 1) / QUESTIONS.length) * 100
  );

  const dimensionResults = useMemo<DimensionResult[]>(() => {
    const grouped = QUESTIONS.reduce<
      Record<PersonalityDimension, { total: number; answered: number }>
    >((acc, question) => {
      const row = acc[question.category] || { total: 0, answered: 0 };
      const value = answers[question.id];

      if (Number.isInteger(value)) {
        row.total += scoreQuestion(value, question.reverse);
        row.answered += 1;
      }

      acc[question.category] = row;
      return acc;
    }, {} as Record<PersonalityDimension, { total: number; answered: number }>);

    return Object.entries(DIMENSION_COPY).map(([key, copy]) => {
      const typedKey = key as PersonalityDimension;
      const row = grouped[typedKey] || { total: 0, answered: 0 };

      return {
        key: typedKey,
        ...copy,
        score: row.answered > 0 ? row.total / row.answered : 0,
        answered: row.answered,
        total: QUESTIONS.filter((question) => question.category === typedKey)
          .length,
      };
    });
  }, [answers]);

  const sortedResults = useMemo(
    () => [...dimensionResults].sort((a, b) => b.score - a.score),
    [dimensionResults]
  );

  const strengths = useMemo(() => {
    const highScores = sortedResults.filter((result) => result.score >= 3.6);
    return (highScores.length >= 3 ? highScores : sortedResults).slice(0, 4);
  }, [sortedResults]);

  const growthAreas = useMemo(() => {
    return [...dimensionResults]
      .filter((result) => result.answered === result.total)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
  }, [dimensionResults]);

  const workStyle = useMemo(() => {
    const top = strengths.slice(0, 2).map((item) => item.title);
    if (top.length === 0) return "פרופיל העבודה יתבהר אחרי השלמת השאלון.";
    return `סגנון העבודה הבולט: ${top.join(" + ")}.`;
  }, [strengths]);

  useEffect(() => {
    const loadAnswers = async () => {
      setIsLoadingAnswers(true);

      try {
        const fetchedAnswers = await fetchStepAnswers(
          QUESTIONS.map((question) => question.id)
        );
        const nextAnswers = QUESTIONS.reduce<Record<string, number>>(
          (acc, question) => {
            const value = parseAnswer(fetchedAnswers[question.id]?.value);
            if (value !== null) acc[question.id] = value;
            return acc;
          },
          {}
        );

        const firstUnansweredIndex = QUESTIONS.findIndex(
          (question) => nextAnswers[question.id] === undefined
        );

        setAnswers(nextAnswers);
        setCurrentIndex(firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex);
        setShowResult(
          resultsMode && Object.keys(nextAnswers).length === QUESTIONS.length
        );
      } catch (error) {
        console.error("Error loading personality answers:", error);
      } finally {
        setIsLoadingAnswers(false);
      }
    };

    loadAnswers();
  }, [resultsMode]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearAutoAdvance(), [clearAutoAdvance]);

  const persistAnswer = useCallback(
    async (questionId: string, value: number) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const saved = await setAnswer(questionId, value, undefined, STEP_NUMBER);
        if (!saved) {
          setSaveError(SAVE_ERROR_MESSAGE);
          return false;
        }

        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [setAnswer]
  );

  const handleSelect = useCallback(
    async (questionId: string, value: number) => {
      clearAutoAdvance();
      const previousValue = answers[questionId];

      setAnswers((current) => ({ ...current, [questionId]: value }));
      const saved = await persistAnswer(questionId, value);

      if (!saved) {
        setAnswers((current) => {
          const nextAnswers = { ...current };
          if (previousValue === undefined) {
            delete nextAnswers[questionId];
          } else {
            nextAnswers[questionId] = previousValue;
          }
          return nextAnswers;
        });
        return;
      }

      if (currentIndex >= QUESTIONS.length - 1) return;

      autoAdvanceTimer.current = setTimeout(() => {
        setCurrentIndex((index) =>
          index === currentIndex ? Math.min(index + 1, QUESTIONS.length - 1) : index
        );
      }, AUTO_ADVANCE_MS);
    },
    [answers, clearAutoAdvance, currentIndex, persistAnswer]
  );

  const handleNextQuestion = async () => {
    clearAutoAdvance();

    if (!Number.isInteger(selected)) return;

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    await handleShowResult();
  };

  const handlePreviousQuestion = () => {
    clearAutoAdvance();
    setSaveError(null);
    setCurrentIndex((value) => Math.max(0, value - 1));
  };

  const handleShowResult = async () => {
    clearAutoAdvance();
    if (!isComplete) return;
    if (resultsMode) {
      setShowResult(true);
      return;
    }
    await handleContinue();
  };

  const handleContinue = async () => {
    clearAutoAdvance();
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    if (!isComplete) return;
    await onComplete?.();
    onNext?.();
  };

  if (isLoadingAnswers) {
    return <div className="p-6 text-center">טוען...</div>;
  }

  if (!currentQuestion) {
    return null;
  }

  if (showResult) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4" dir="rtl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">סיכום מבחני אישיות</h1>
          <p className="mt-3 text-white/75">
            מבוסס על {answeredCount} מתוך {QUESTIONS.length} היגדים
          </p>
        </div>

        <Card className="bg-white text-background">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-xl font-semibold">פרופיל עבודה קצר</h2>
            </div>
            <p className="text-lg font-semibold">{workStyle}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-4">
                <h3 className="font-semibold">חוזקות בולטות</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {strengths.map((item) => (
                    <li key={item.key}>
                      {item.title}: {item.high}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border p-4">
                <h3 className="font-semibold">מוקדי התפתחות</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {growthAreas.map((item) => (
                    <li key={item.key}>
                      {item.title}: {item.growth}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          {dimensionResults.map((result) => (
            <Card key={result.key} className="bg-white text-background">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{result.title}</h3>
                  <Badge variant="secondary">{getBand(result.score)}</Badge>
                </div>
                <div className="mt-3 text-3xl font-bold">
                  {result.score.toFixed(1)}
                  <span className="text-base font-normal text-gray-500">/5</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{result.high}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={handleContinue}>
            חזרה לדו״ח הראשי
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
      className="w-full mt-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-3xl font-bold my-6 text-center"
      >
        מבחני אישיות
      </motion.h1>

      <p className="mx-auto mb-6 max-w-2xl text-center text-white/75">
        דרג/י כל היגד מ-1 עד 5 לפי מידת ההתאמה אליך
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-3xl mx-auto bg-white text-background p-2 sm:p-6">
            <CardHeader className="p-2 sm:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
                  <span>
                    שאלה {currentIndex + 1} / {QUESTIONS.length}
                  </span>
                </div>
                <Progress
                  value={progressPercentage}
                  className="h-2 bg-gray-200"
                  aria-label={`התקדמות ${progressPercentage}%`}
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="mb-4 text-right text-lg leading-relaxed text-background sm:mb-6">
                {currentQuestion.statement}
              </div>

              <RatingScale
                value={selected}
                onSelect={(value) => handleSelect(currentQuestion.id, value)}
                disabled={isSaving}
              />

              <div className="mt-4 min-h-6 text-sm" aria-live="polite">
                {saveError ? (
                  <p className="font-medium text-destructive">{saveError}</p>
                ) : isSaving ? (
                  <p className="text-gray-600">שומר...</p>
                ) : selected !== undefined ? (
                  <p className="text-emerald-700">נשמר אוטומטית</p>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0 || isSaving}
                  className="gap-2"
                >
                  <ChevronRight className="size-4" />
                  שאלה קודמת
                </Button>

                <Button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!Number.isInteger(selected) || isSaving}
                  className="gap-2"
                >
                  {currentIndex < QUESTIONS.length - 1 ? (
                    <>
                      שאלה הבאה
                      <ChevronLeft className="size-4" />
                    </>
                  ) : resultsMode ? (
                    "הצג סיכום"
                  ) : (
                    "סיום השלב"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
