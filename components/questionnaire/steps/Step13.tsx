"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";

interface Step13Props {
  onNext?: () => void;
  onComplete: () => Promise<void> | void;
}

interface CoreValueRow {
  name: string;
  // number for a chosen score, empty string when not set yet
  score: number | "";
  missing: string;
}

const ALL_VALUES: string[] = [
  "יושר",
  "עצמאות",
  "הוגנות",
  "הרחבת אופקים",
  "למידה",
  "כנות",
  "תמיכה",
  "הקשבה",
  "חווייתיות",
  "עוצמה",
  "דיוק",
  "נחישות",
  "רצינות",
  "פשטות",
  "סובלנות",
  "חמימות",
  "יוזמה",
  "מגע",
  "חיבור לטבע",
  "סביבה",
  "דבקות",
  "צדק",
  "גיוון",
  "עניין",
  "יסודיות",
  "דקדקנות",
  "מקצועיות",
  "מצויינות",
  "הובלה",
  "בכורה",
  "רגישות",
  "איכות",
  "שפע",
  "חושניות",
  "מיניות",
  "הישגיות",
  "פתיחות",
  "קבלה",
  "פעלתנות",
  "נתינה",
  "חוכמה",
  "שעשוע",
  "שובבות",
  "להט",
  "התפתחות אישית",
  "חיות",
  "דייקנות",
  "נהנתנות",
  "Fun",
  "מקוריות",
  "חדשנות",
  "נועזות",
  "הרפתקנות",
  "יוקרה",
  "אותנטיות",
  "צמיחה",
  "אסתטיקה",
  "יופי",
  "חופש",
  "מרחב",
  "יצירתיות",
  "ייחודיות",
  "מודעות רגשית",
  "מודעות גופנית",
  "בריאות",
  "משפחתיות",
  "אמהות",
  "אבהות",
  "משמעותיות",
  "שאפתנות",
  "אמינות",
  "נאמנות",
  "ניידות",
  "מצליחנות",
  "דינמיות",
  "רוחניות",
  "תקשורתיות",
  "הרמוניה",
];

const MAX_INITIAL_SELECTION = 12;
const MIN_CORE_VALUES = 4;
const MAX_CORE_VALUES = 6;
const STEP13_SELECTED_VALUES_ID = "9d79036e-bf0c-4d65-b06f-f5f4b5f01301";
const STEP13_CORE_VALUES_ID = "9d79036e-bf0c-4d65-b06f-f5f4b5f01302";
const STORY_STEPS = [
  "פתיחה",
  "העולם המושלם",
  "בחירת ערכים",
  "ערכי ליבה",
  "ביטוי היום",
];

export default function Step13({
  onNext,
  onComplete,
}: Step13Props) {
  const setAnswer = useQuestionnaireStore((state) => state.setAnswer);
  const selectedAnswer = useQuestionnaireStore(
    (state) => state.answers[STEP13_SELECTED_VALUES_ID]
  );
  const coreValuesAnswer = useQuestionnaireStore(
    (state) => state.answers[STEP13_CORE_VALUES_ID]
  );

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValueRow[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    if (selectedAnswer?.value && Array.isArray(selectedAnswer.value)) {
      setSelectedValues(selectedAnswer.value as string[]);
    }
    if (coreValuesAnswer?.value) {
      try {
        const parsed = JSON.parse(coreValuesAnswer.value as string);
        if (Array.isArray(parsed)) {
          setCoreValues(
            parsed.map(
              (row: any): CoreValueRow => ({
                name: String(row.name),
                score:
                  typeof row.score === "number" &&
                  row.score >= 1 &&
                  row.score <= 10
                    ? row.score
                    : "",
                missing: typeof row.missing === "string" ? row.missing : "",
              })
            )
          );
        }
      } catch {
        // ignore parse errors, start fresh
      }
    }
  }, [selectedAnswer?.value, coreValuesAnswer?.value]);

  const toggleSelected = (value: string) => {
    const exists = selectedValues.includes(value);
    const nextSelectedValues = exists
      ? selectedValues.filter((v) => v !== value)
      : selectedValues.length >= MAX_INITIAL_SELECTION
      ? selectedValues
      : [...selectedValues, value];

    if (nextSelectedValues === selectedValues) {
      return;
    }

    const nextCoreValues = coreValues.filter((row) =>
      nextSelectedValues.includes(row.name)
    );

    setSelectedValues(nextSelectedValues);
    setCoreValues(nextCoreValues);
    setAnswer(STEP13_SELECTED_VALUES_ID, nextSelectedValues, false, 12);
    if (nextCoreValues.length !== coreValues.length) {
      persistCoreValues(nextCoreValues);
    }
  };

  const toggleCoreValue = (value: string) => {
    const exists = coreValues.find((row) => row.name === value);
    const nextCoreValues: CoreValueRow[] = exists
      ? coreValues.filter((row) => row.name !== value)
      : coreValues.length >= MAX_CORE_VALUES
      ? coreValues
      : [...coreValues, { name: value, score: "", missing: "" }];

    if (nextCoreValues === coreValues) {
      return;
    }

    setCoreValues(nextCoreValues);
    persistCoreValues(nextCoreValues);
  };

  const persistCoreValues = (rows: CoreValueRow[]) => {
    const payload = rows.map((row) => ({
      name: row.name,
      score: row.score === "" ? null : row.score,
      missing: row.missing,
    }));
    setAnswer(STEP13_CORE_VALUES_ID, JSON.stringify(payload), false, 12);
  };

  const handleScoreChange = (name: string, value: string) => {
    const numeric = value ? Number(value) : "";
    const nextCoreValues: CoreValueRow[] = coreValues.map((row) =>
      row.name === name ? { ...row, score: numeric } : row
    );
    setCoreValues(nextCoreValues);
    persistCoreValues(nextCoreValues);
  };

  const handleMissingChange = (name: string, value: string) => {
    const nextCoreValues: CoreValueRow[] = coreValues.map((row) =>
      row.name === name ? { ...row, missing: value } : row
    );
    setCoreValues(nextCoreValues);
    persistCoreValues(nextCoreValues);
  };

  const canContinue = useMemo(() => {
    if (
      coreValues.length < MIN_CORE_VALUES ||
      coreValues.length > MAX_CORE_VALUES
    ) {
      return false;
    }
    return coreValues.every(
      (row) =>
        typeof row.score === "number" && row.score >= 1 && row.score <= 10
    );
  }, [coreValues]);

  const handleNext = async () => {
    if (!canContinue) return;
    await onComplete?.();
    onNext?.();
  };

  const storyProgress = Math.round(((storyIndex + 1) / STORY_STEPS.length) * 100);
  const isLastStoryStep = storyIndex === STORY_STEPS.length - 1;

  const canMoveForward = useMemo(() => {
    if (storyIndex === 2) {
      return selectedValues.length > 0;
    }
    if (storyIndex === 3) {
      return coreValues.length >= MIN_CORE_VALUES;
    }
    if (storyIndex === 4) {
      return canContinue;
    }
    return true;
  }, [canContinue, coreValues.length, selectedValues.length, storyIndex]);

  const goToPreviousStory = () => {
    setStoryIndex((current) => Math.max(0, current - 1));
  };

  const goToNextStory = () => {
    if (isLastStoryStep) {
      void handleNext();
      return;
    }
    setStoryIndex((current) => Math.min(STORY_STEPS.length - 1, current + 1));
  };

  const handleStoryDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const swipeDistance = 80;
    if (info.offset.x > swipeDistance && storyIndex > 0) {
      goToPreviousStory();
    }
    if (info.offset.x < -swipeDistance && !isLastStoryStep && canMoveForward) {
      goToNextStory();
    }
  };

  return (
    <div className="mx-auto max-w-4xl" dir="rtl">
      <div className="mb-5 text-center text-white">
        <p className="text-sm font-semibold text-cyan-100">שלב ב׳ עם יועץ קריירה</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-normal">
          ליבת הערכים האישיים
        </h2>
      </div>

      <div className="mb-4 rounded-lg border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-white">
          <span>
            {storyIndex + 1} / {STORY_STEPS.length}
          </span>
          <span>{STORY_STEPS[storyIndex]}</span>
        </div>
        <Progress
          value={storyProgress}
          className="h-2 bg-white/20"
          aria-label={`התקדמות ${storyProgress}%`}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={storyIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={handleStoryDragEnd}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.28 }}
        >
          <Card className="overflow-hidden border-white/40 bg-white text-background shadow-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-950">
                  {STORY_STEPS[storyIndex]}
                </h3>
                <div className="flex gap-1" aria-hidden="true">
                  {STORY_STEPS.map((step, index) => (
                    <span
                      key={step}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        index === storyIndex ? "bg-teal-500" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="min-h-[520px] space-y-5 p-5 leading-relaxed sm:p-7">
              {storyIndex === 0 ? (
                <div className="space-y-5 text-lg">
                  <p className="font-semibold text-slate-950">
                    תרגיל למתענייני קורס מומחי קריירה ולחיים בכלל
                  </p>
                  <p>
                    יש כאלה שמכנים את הערכים האישיים המנועים הפנימיים שלנו,
                    ה-ד.נ.א של הנשמה או המצפן שמראה שאנו במקום המדוייק לנו.
                    מימוש הערכים האישיים בנסיבות חיינו מתרחש דרך יחסי הגומלין
                    שלנו עם המציאות החיצונית: מקום עבודה ותחום עיסוק, יחסים
                    חברתיים, משפחה, סביבת מגורים, שעות פנאי ועוד.
                  </p>
                  <p>
                    כשהערכים שלנו מקבלים ביטוי מלא באותה סביבה, זה אומר שאנו
                    בסביבה הטבעית שלנו, חווים תחושת איזון ושביעות רצון, מקבלים
                    אנרגיה והפרייה מהסביבה. במצב כזה יש בנו רצון וכוח להעניק
                    בחזרה, לממש את ייעודנו ולהשאיר חותם חיובי.
                  </p>
                  <p className="rounded-md bg-cyan-50 p-4 text-base text-slate-700">
                    זוהי קטגוריה אחת מתוך 7 הקטגוריות שבאמצעותן נבנית תעודת
                    הזהות התעסוקתית המולדת של המאובחן.
                  </p>
                </div>
              ) : null}

              {storyIndex === 1 ? (
                <div className="space-y-5 text-lg">
                  <p className="font-semibold text-slate-950">
                    קמת לעולם מושלם מבחינה תעסוקתית.
                  </p>
                  <p>
                    בעולם הזה כולם מרוויחים 100 אלף ₪ נטו בחודש. אין מעמדות
                    מקצועיים: מוכר במכולת, מורה בבית ספר, מנכ"ל חברה, צלם,
                    מורה דרך, שומר יערות, מהנדס תוכנה ומנקה רחובות מקבלים יחס
                    זהה, ומהות המקצוע היא לא אישיו.
                  </p>
                  <p>
                    ניתן לפי רצונך להחליף מקצוע כל שנתיים, והכי חשוב: כל אחד
                    בוחר את המקצוע המועדף עליו בכל שלב.
                  </p>
                  <p className="rounded-md bg-emerald-50 p-4 text-base text-slate-700">
                    בשלב הבא בוחרים ערכים שיהפכו את חוויית העבודה למהנה,
                    מפרה ובעיקר טבעית.
                  </p>
                </div>
              ) : null}

              {storyIndex === 2 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg">
                      בחרו עד {MAX_INITIAL_SELECTION} ערכים שחשוב לכם שישרו
                      בסביבת העבודה ובאינטראקציה עם האנשים.
                    </p>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800">
                      נבחרו {selectedValues.length}/{MAX_INITIAL_SELECTION}
                    </span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {ALL_VALUES.map((v) => {
                        const isSelected = selectedValues.includes(v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleSelected(v)}
                            className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                              isSelected
                                ? "border-teal-500 bg-teal-500 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {selectedValues.length === 0 ? (
                    <p className="text-sm font-medium text-amber-700">
                      בחרו לפחות ערך אחד כדי להמשיך לסיפור הבא.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {storyIndex === 3 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg">
                      עכשיו מצמצמים ל-{MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכי
                      ליבה: הערכים שהם תנאי לעיסוק ולסביבת עבודה מספקים עבורכם.
                    </p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                      ליבה {coreValues.length}/{MAX_CORE_VALUES}
                    </span>
                  </div>

                  {selectedValues.length === 0 ? (
                    <p className="rounded-md bg-amber-50 p-4 text-sm font-medium text-amber-800">
                      חזרו קלף אחד אחורה ובחרו קודם את הערכים הראשוניים.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      {selectedValues.map((v) => {
                        const isCore = coreValues.some((row) => row.name === v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleCoreValue(v)}
                            className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                              isCore
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {coreValues.length < MIN_CORE_VALUES ? (
                    <p className="text-sm font-medium text-amber-700">
                      בחרו לפחות {MIN_CORE_VALUES} ערכי ליבה כדי להמשיך.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {storyIndex === 4 ? (
                <div className="space-y-4">
                  <p className="text-lg">
                    התבוננו בעיסוקכם הנוכחי ותנו לכל ערך ליבה ציון בין 1 ל-10
                    לפי רמת הביטוי שלו היום. לאחר מכן כתבו מה חסר כדי לקרב אותו
                    לציון 9-10.
                  </p>

                  {coreValues.length === 0 ? (
                    <p className="rounded-md bg-amber-50 p-4 text-sm font-medium text-amber-800">
                      תחילה בחרו {MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכי ליבה.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {coreValues.map((row) => (
                        <div
                          key={row.name}
                          className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[140px_110px_1fr]"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-500">
                              הערך
                            </p>
                            <p className="text-base font-bold text-slate-950">
                              {row.name}
                            </p>
                          </div>
                          <label className="grid gap-1">
                            <span className="text-xs font-semibold text-slate-500">
                              ציון
                            </span>
                            <select
                              className="h-10 rounded-md border border-slate-300 bg-white px-2 text-center"
                              value={row.score === "" ? "" : String(row.score)}
                              onChange={(e) =>
                                handleScoreChange(row.name, e.target.value)
                              }
                            >
                              <option value="">בחרו</option>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(
                                (n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                )
                              )}
                            </select>
                          </label>
                          <label className="grid gap-1">
                            <span className="text-xs font-semibold text-slate-500">
                              מה חסר כדי לקדם את הערך?
                            </span>
                            <textarea
                              className="min-h-[76px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                              value={row.missing}
                              onChange={(e) =>
                                handleMissingChange(row.name, e.target.value)
                              }
                              placeholder="מה חסר היום בעיסוק או בסביבה?"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {!canContinue ? (
                    <p className="text-sm font-medium text-amber-700">
                      כדי לסיים, בחרו {MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכי
                      ליבה ותנו לכל אחד ציון.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          type="button"
          onClick={goToPreviousStory}
          disabled={storyIndex === 0}
          className="gap-2 disabled:border-white/70 disabled:bg-white/90 disabled:text-slate-600 disabled:opacity-100"
        >
          <ChevronRight className="size-4" />
          הקודם
        </Button>

        <Button
          type="button"
          onClick={goToNextStory}
          disabled={!canMoveForward}
          className="gap-2"
        >
          {isLastStoryStep ? "סיום השלב" : "הבא"}
          {!isLastStoryStep ? <ChevronLeft className="size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}
