"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    setAnswer(STEP13_SELECTED_VALUES_ID, nextSelectedValues, false, 13);
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
    setAnswer(STEP13_CORE_VALUES_ID, JSON.stringify(payload), false, 13);
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
    await onComplete?.();
    if (canContinue) {
      onNext?.();
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold my-6 text-center">
        ליבת הערכים אישיים
      </h2>

      <Card className="mb-6 bg-white">
        <CardContent className="space-y-3 leading-relaxed text-background">
          <p className="font-semibold text-center">
            תרגיל למתענייני קורס מומחי קריירה ולחיים בכלל
          </p>
          <p>
            יש כאלה שמכנים את הערכים האישיים המנועים הפנימיים שלנו, ה-ד.נ.א של
            הנשמה או המצפן שמראה שאנו במקום המדוייק לנו. מימוש הערכים האישיים
            בנסיבות חיינו מתרחש דרך יחסי הגומלין שלנו עם המציאות החיצונית – מקום
            עבודה ותחום עיסוק, יחסים חברתיים, משפחה, סביבת מגורים, שעות פנאי
            ועוד.
          </p>
          <p>
            כשהערכים שלנו מקבלים ביטוי מלא באותה סביבה, זה אומר שאנו בסביבה
            הטבעית שלנו, חווים תחושת איזון ושביעות רצון, מקבלים אנרגיה והפרייה
            מהסביבה. במצב כזה, יש בנו את הרצון והכח להעניק בחזרה. אנו במיטבנו
            ויש לנו את היכולת לממש את ייעודנו, להשאיר חותם והשפעה חיובית
            בסביבתנו.
          </p>
          <p className="text-sm text-gray-700">
            (זוהי רק קטגוריה אחת מתוך 7 הקטגוריות שבאמצעותן אנו בונים בשיטת
            האבחון פורצת הדרך של חממת "דרך חדשה" את תעודת הזהות התעסוקתית המולדת
            של המאובחן)
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-white">
        <CardContent className="space-y-3 text-background">
          <h3 className="text-xl font-semibold mb-2 text-center">
            קמת לעולם מושלם מבחינה תעסוקתית – בחירת ערכים
          </h3>
          <p>
            בעולם הזה כולם מרוויחים 100 אלף ₪ נטו בחודש. אין מעמדות מקצועיים:
            מוכר במכולת, מורה בבית ספר, מנכ"ל חברה, צלם, מורה דרך, שומר יערות,
            מהנדס תוכנה, מנקה רחובות – לכולם מעמד זהה ומהות המקצוע היא לא אישיו.
          </p>
          <p>
            ניתן לפי רצונך להחליף מקצוע כל שנתיים, והכי חשוב – כל אחד בוחר את
            המקצוע המועדף עליו בכל שלב.
          </p>
          <p>
            בעולם אופטימלי זה, בחרו מהרשימה שבהמשך {MAX_INITIAL_SELECTION} ערכים
            שמרגישים לכם החשובים ביותר. ערכים שחשוב לכם שישרו בסביבת העבודה,
            באינטראקציה שלכם עם האנשים ובעולם התוכן שבחרתם לעסוק בו. ערכים
            שיהפכו את החוויה שלכם למהנה, מפרה ובעיקר טבעית.
          </p>
          <div className="text-sm text-gray-700 mb-2">
            נבחרו {selectedValues.length}/{MAX_INITIAL_SELECTION}
          </div>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
            {ALL_VALUES.map((v) => {
              const isSelected = selectedValues.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleSelected(v)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-background hover:bg-gray-50"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-white">
        <CardContent className="space-y-3 text-background">
          <h3 className="text-xl font-semibold mb-2 text-center">
            צמצום ל- {MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכי ליבה
          </h3>
          <p>
            לאחר שבחרתם {MAX_INITIAL_SELECTION} ערכים, צמצמו ל-{" "}
            {MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכים החשובים לכם ביותר, שהם
            תנאי לעיסוק ולסביבת עבודה מהנים ומספקים עבורכם.
          </p>
          <div className="text-sm text-gray-700 mb-2">
            ערכי ליבה שנבחרו: {coreValues.length}/{MAX_CORE_VALUES}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((v) => {
              const isCore = coreValues.some((row) => row.name === v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleCoreValue(v)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    isCore
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-background hover:bg-gray-50"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardContent className="space-y-3 text-background">
          <h3 className="text-xl font-semibold mb-2 text-center">
            טבלת ציונים לרמת ביטוי הערכים החשובים שלכם בעיסוקכם כיום
          </h3>
          <p>
            התבוננו בעיסוקכם הנוכחי וחישבו מהו הציון בין 1 ל-10 שאתם נותנים לרמת
            ביטוי של כל אחד מערכי הליבה החשובים ביותר שלכם. חישבו מה חסר שם שהיה
            יכול לקדם את הערך לציון גבוה בהרבה.
          </p>

          {coreValues.length === 0 ? (
            <p className="text-sm text-gray-600">
              תחילה בחרו {MIN_CORE_VALUES}-{MAX_CORE_VALUES} ערכי ליבה בשלב ב'.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-2 py-1 text-right w-32">הערך</th>
                    <th className="border px-2 py-1 text-center w-24">ציון</th>
                    <th className="border px-2 py-1 text-right">
                      מה חסר כדי לקדם את הערך לציון 9–10?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coreValues.map((row) => (
                    <tr key={row.name}>
                      <td className="border px-2 py-1 text-right align-top">
                        {row.name}
                      </td>
                      <td className="border px-2 py-1 text-center align-top">
                        <select
                          className="border rounded-md px-1 py-0.5 text-center w-full"
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
                      </td>
                      <td className="border px-2 py-1 align-top">
                        <textarea
                          className="w-full border rounded-md px-2 py-1 min-h-[60px] text-sm"
                          value={row.missing}
                          onChange={(e) =>
                            handleMissingChange(row.name, e.target.value)
                          }
                          placeholder="מה חסר היום בעיסוק / בסביבה כדי שהערך יקבל ציון 9–10?"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end items-center mt-6">
            <Button onClick={handleNext} disabled={!canContinue}>
              המשך
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
