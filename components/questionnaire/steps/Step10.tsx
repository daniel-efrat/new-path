"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const STEP_NUMBER = 12;
const QUESTIONS = STEP10_QUESTIONS;
const RATING_OPTIONS = [
  { src: "/slice1.png", label: "מתאים לי מאוד", value: 5 },
  { src: "/slice2.png", label: "מתאים לי", value: 4 },
  { src: "/slice3.png", label: "בינוני", value: 3 },
  { src: "/slice4.png", label: "מעט מתאים לי", value: 2 },
  { src: "/slice5.png", label: "בכלל לא מתאים לי", value: 1 },
];

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
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const answeredCount = QUESTIONS.filter((question) =>
    Number.isInteger(answers[question.id])
  ).length;
  const isComplete = answeredCount === QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentIndex];
  const selected = currentQuestion ? answers[currentQuestion.id] : undefined;

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

        setAnswers(nextAnswers);
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
  }, []);

  const handleSelect = async (questionId: string, value: number) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    await setAnswer(questionId, value, undefined, STEP_NUMBER);
  };

  const handleNextQuestion = async () => {
    if (!Number.isInteger(selected)) return;

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    await handleShowResult();
  };

  const handleShowResult = async () => {
    if (!isComplete) return;
    if (resultsMode) {
      setShowResult(true);
      return;
    }
    await handleContinue();
  };

  const handleContinue = async () => {
    if (resultsMode) {
      onBackToReport?.();
      return;
    }
    if (!isComplete) return;
    await onComplete?.();
    onNext?.();
  };

  const ratingContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  } as const;

  const ratingItem = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  } as const;

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
            <CardHeader className="flex flex-col gap-3 p-2 sm:p-6">
              <div className="flex w-full items-center justify-between gap-3 text-sm text-gray-700">
                <span>
                  שאלה {currentIndex + 1} / {QUESTIONS.length}
                </span>
                <span>
                  נענו {answeredCount}/{QUESTIONS.length}
                </span>
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary">{currentQuestion.categoryLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="mb-4 sm:mb-6 text-right text-xl font-semibold leading-relaxed text-background">
                {currentQuestion.statement}
              </div>

              <div className="mb-1 sm:mb-2 overflow-hidden">
                <motion.div
                  className="flex items-center justify-between gap-0.5 sm:gap-2 overflow-x-auto"
                  dir="ltr"
                  variants={ratingContainer}
                  initial="hidden"
                  animate="show"
                >
                  {RATING_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(currentQuestion.id, option.value)}
                      className={`flex flex-col items-center p-0.5 sm:p-2 rounded-lg transition-colors focus-visible:outline-none border min-w-[52px] sm:min-w-[80px] ${
                        selected === option.value
                          ? "border-primary ring-2 ring-blue-200"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                      aria-pressed={selected === option.value}
                      aria-label={option.label}
                      variants={ratingItem}
                    >
                      <div className="w-[40px] h-[40px] sm:w-[56px] sm:h-[56px] flex items-center justify-center">
                        <Image
                          src={option.src}
                          alt={option.label}
                          width={56}
                          height={56}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <span className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleNextQuestion}
                  disabled={!Number.isInteger(selected)}
                >
                  {currentIndex < QUESTIONS.length - 1
                    ? "שאלה הבאה"
                    : resultsMode
                    ? "הצג סיכום"
                    : "סיום השלב"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
