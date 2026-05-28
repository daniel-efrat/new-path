"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PERSONALITY_SCALE_OPTIONS,
  STEP10_QUESTIONS,
  type PersonalityDimension,
} from "@/lib/constants/questions";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";

interface Step10Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void> | void;
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
const SCALE_VALUES = [1, 2, 3, 4, 5];

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

export default function Step10({ onNext, onPrevious, onComplete }: Step10Props) {
  const { setAnswer } = useQuestionnaireStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const answeredCount = QUESTIONS.filter((question) =>
    Number.isInteger(answers[question.id])
  ).length;
  const isComplete = answeredCount === QUESTIONS.length;

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
        setShowResult(Object.keys(nextAnswers).length === QUESTIONS.length);
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

  const handleShowResult = () => {
    if (isComplete) setShowResult(true);
  };

  const handleEdit = () => {
    setShowResult(false);
  };

  const handleRestart = async () => {
    setAnswers({});
    setShowResult(false);
    await Promise.all(
      QUESTIONS.map((question) =>
        setAnswer(question.id, null, undefined, STEP_NUMBER)
      )
    );
  };

  const handleContinue = async () => {
    if (!isComplete) return;
    await onComplete?.();
    onNext?.();
  };

  if (isLoadingAnswers) {
    return <div className="p-6 text-center">טוען...</div>;
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
          <Button variant="outline" onClick={handleEdit}>
            עריכת תשובות
          </Button>
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            התחלה מחדש
          </Button>
          <Button onClick={handleContinue}>
            <CheckCircle2 className="h-4 w-4" />
            המשך לשלב הבא
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-3xl font-bold">מבחני אישיות</h1>
        <p className="mt-3 text-white/75">
          דרג/י כל היגד מ-1 עד 5 לפי מידת ההתאמה אליך
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white/10 px-4 py-3">
        <div className="text-sm text-white/80">
          נענו {answeredCount}/{QUESTIONS.length}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-white/80">
          {PERSONALITY_SCALE_OPTIONS.map((label, index) => (
            <span key={label}>
              {index + 1} - {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {QUESTIONS.map((question) => {
          const selected = answers[question.id];

          return (
            <Card key={question.id} className="bg-white text-background">
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary">{question.categoryLabel}</Badge>
                    <h2 className="mt-3 text-lg font-semibold leading-8">
                      {question.number}. {question.statement}
                    </h2>
                  </div>
                  {Number.isInteger(selected) ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-700" />
                  ) : null}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {SCALE_VALUES.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={selected === value ? "default" : "outline"}
                      className="h-auto min-h-[58px] whitespace-normal px-2 py-2 text-center text-sm"
                      aria-label={`${question.statement}: ${value}`}
                      onClick={() => handleSelect(question.id, value)}
                    >
                      <span className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold">{value}</span>
                        <span className="text-xs leading-4">
                          {value === 1
                            ? "בכלל לא"
                            : value === 2
                            ? "מעט"
                            : value === 3
                            ? "בינוני"
                            : value === 4
                            ? "מתאים"
                            : "מאוד"}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md bg-background/95 p-3 shadow-lg backdrop-blur">
        <Button variant="outline" onClick={onPrevious}>
          שלב קודם
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/70">
            {isComplete ? "כל ההיגדים מולאו" : "יש להשלים את כל ההיגדים"}
          </span>
          <Button onClick={handleShowResult} disabled={!isComplete}>
            הצג סיכום
          </Button>
        </div>
      </div>
    </div>
  );
}
