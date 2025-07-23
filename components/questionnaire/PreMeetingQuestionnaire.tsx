"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { cn } from "@/lib/utils"

/** תכונות אפשריות לבחירה (מתוך הטבלה) */
const TRAITS: string[] = [
  "חשיבה יצירתית",
  "יכולת הנהגה",
  "סדר ודיוק",
  "עבודה בצוות",
  "קבלת החלטות",
  "למידה מהירה",
  "הובלת תהליכים",
  "יחסי אנוש מצוינים",
  "מחויבות",
  "גישה שירותית",
  // ––– רשימת 48 התכונות מהעמוד: "סמנו את 10 התכונות החזקות שלכם" –––
  "רגישות",
  "חריצות",
  "מודעות עצמית",
  "יזמות",
  "כאריזמה",
  "מנהיגות",
  "לקיחת אחריות",
  "אומץ",
  "נחישות",
  "משפחתי",
  "ידיים טובות",
  "טכנולוגי",
  "יעילות",
  '"מתקתק" דברים',
  "אינטליגנציה רגשית",
  "אינטלקט מפותח",
  "חברותי",
  "סקרנות",
  "זריזות מחשבתית",
  "חמימות",
  "יכולת הקשבה",
  "כשרון אומנותי",
  "בטחון עצמי",
  "צניעות",
  "מראה אסתטי",
  "אסרטיבי",
  "אמינות",
  "פתיחות",
  "נאמנות",
  "מקוריות",
  "אופטימיות",
  "יצירתיות",
  "אהבה לבעלי חיים",
  "חוש הומור",
  "אופנתיות וסטייל",
  "רוחניות",
  "שאפתנות",
  "אותנטיות",
  "משיכה לטבע",
  "הורות טובה",
  "כח פיזי",
  "חיבור לשפע",
  "ביצועיסט",
  "נמרצות אנרגטיות",
  "חשיבה אנליטית",
  "ייצוגיות",
  "חדות",
  "חושניות",
]

/** משפטי 'עוגני קריירה' (מדרג 0‑10) */
const ANCHOR_QUESTIONS: string[] = [
  "אני פורח כשיש לי אתגר קשה במיוחד ועלי האחריות לפצח ולפתור אותו.",
  "השאיפה שלי היא להקדיש זמן וקודם כל להפוך למומחה בתחום מסויים ולהעמיק בו באופן מתמיד גם אם זה על חשבון ניהול וקידום.",
  "אני לא רוצה שהעבודה תשתלט על חיי- אני שואף לאיזון אמיתי.",
  "לפני כמה אני מרוויח, קודם כל חשוב לי שתהיה לי שליטה על מה, איך ומתי אני עושה את העבודה שלי.",
  "גם אם אצטרך לוותר על ניהול או עבודה יצירתית, אתן עדיפות לרוגע ו-ודאות לטווח הארוך.",
  "מרגש אותי הרעיון של להקים משהו מאפס ולראות אותו גדל.",
  "אני מעדיף לעבוד לבד או בצוות כשניתן לי מרחב ויכולת לקבוע לעצמי את סדרי העבודה.",
  "לפני שכר או קידום אבדוק אם בעבודה שלי יש לעשייה שלי משמעות ערכית.",
  "מרתק אותי להתבונן על מערכות שלמות מלמעלה ולפעול לשפר אותן.",
  "חשוב לי להתחרות גם בעצמי וגם באחרים- ולנצח כל אתגר.",
  "חשוב לי לבנות שם של מומחה ולהיות האדם שפונים אליו כשיש בעיה מקצועית בתחום מסויים.",
  "אני מלא ברעיונות וחושב על דרכים להפוך אותם לממשיים.",
  "חשוב לי שהעבודה שלי תתרום לחיים על הפלנטה, תועיל לחברה, לאנשים, לסביבה, לטבע וכו'.",
  "אני אוהב לקחת אחריות כוללת, גם אם איני מומחה בכל נושא ספציפי.",
  "אני אבחר מקום עבודה לפני שאר השיקולים- קודם כל לפי עד כמה הוא מתאים לצרכים האישיים והמשפחתיים שלי.",
  "אני שואף להגיע לתפקידי ניהול בכירים ולהוביל צוותים.",
  "אני רוצה ליזום, לקבוע את החוקים, לנהל פרוייקט באופן עצמאי.",
  "אני מעדיף לעבוד במקום קבוע וברור, גם אם השכר אינו גבוה במיוחד.",
  "אני פחות אוהב שמכתיבים לי- אני מרגיש שאני חייב חופש כדי לעבוד טוב יותר ולהיות במיטבי.",
  "דבר ראשון לפני מה אני עושה, חשוב לי לדעת שיש גיבוי, ביטוחים, חוזה מסודר ויציבות לאורך זמן.",
  "אני משתעמם מהר ממשימות שגרתיות או קלות מדי.",
  "חשוב לי להיות ממוקד בתחום אחד, להעשיר את עצמי בתחום ולהגיע בו לשליטה מקצועית מלאה.",
  "אני חייב לחוש תחושת שליחות ומשמעות בעשייה שלי.",
  "עבודה שמונעת ממני לטפח את חיי הפרט או המשפחה או התחביבים שלי מבחינת הזמן והאנרגיה שאני צריך לכך- לא מתאימה לי.",
]

export default function PreMeetingQuestionnaire() {
  const { stepData, setAnswer } = useQuestionnaireStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focusedTrait, setFocusedTrait] = useState<number>(-1)
  const [mounted, setMounted] = useState(false)
  // Step: 0 = Traits, 1 = Anchors
  const [step, setStep] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get stored values or use defaults with proper type checking
  const selectedTraits = Array.isArray(stepData.traits?.value)
    ? (stepData.traits.value as string[])
    : []
  const anchors = Array.isArray(stepData.anchors?.value)
    ? (stepData.anchors.value as number[])
    : Array(ANCHOR_QUESTIONS.length).fill(5)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLoading) return

      // Space or Enter to toggle current focused trait
      if ((e.key === " " || e.key === "Enter") && focusedTrait !== -1) {
        e.preventDefault()
        toggleTrait(TRAITS[focusedTrait])
      }

      // Arrow keys to navigate between traits
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        setFocusedTrait((prev) => Math.min(prev + 1, TRAITS.length - 1))
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        setFocusedTrait((prev) => Math.max(prev - 1, 0))
      }

      // Numbers 0-9 for slider values
      const num = parseInt(e.key)
      if (!isNaN(num) && focusedTrait !== -1) {
        updateAnchor(focusedTrait, [num])
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [focusedTrait, isLoading])

  const toggleTrait = async (trait: string) => {
    if (isLoading) return
    try {
      setIsLoading(true)
      setError(null)

      if (selectedTraits.length >= 10 && !selectedTraits.includes(trait)) {
        setError("ניתן לבחור עד 10 תכונות בלבד")
        return
      }

      const newTraits = selectedTraits.includes(trait)
        ? selectedTraits.filter((t) => t !== trait)
        : [...selectedTraits, trait]

      await setAnswer("traits", newTraits)
    } catch (err) {
      setError("שגיאה בשמירת הבחירה. נסה שנית.")
      console.error("Error toggling trait:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateAnchor = async (index: number, value: number[]) => {
    if (isLoading) return
    try {
      setIsLoading(true)
      setError(null)

      const newAnchors = [...anchors]
      newAnchors[index] = value[0]
      await setAnswer("anchors", newAnchors)
    } catch (err) {
      setError("שגיאה בשמירת הערך. נסה שנית.")
      console.error("Error updating anchor:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 bg-red-50 text-red-700 rounded-md animate-in slide-in-from-top duration-300"
        aria-live="polite"
      >
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm underline hover:text-red-800"
        >
          נסה שנית
        </button>
      </div>
    )
  }

  return (
    <section className="space-y-10" dir="rtl">
      {step === 0 && (
        <div className="space-y-4" role="region" aria-label="בחירת תכונות">
          <h2 className="text-xl font-semibold text-right">
            בחר/י עד 10 תכונות המתארות אותך
          </h2>
          <p className="text-sm text-gray-500 text-right" aria-live="polite">
            נבחרו {selectedTraits.length} מתוך 10 תכונות אפשריות
          </p>
          <div className="text-xs text-gray-500 mb-2">
            ניתן ללחוץ על החץ למעלה/למטה לניווט, SPACE לבחירה
          </div>
          <div
            className={cn(
              "grid gap-4 transition-opacity duration-200",
              isLoading && "opacity-50"
            )}
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {TRAITS.map((trait, index) => (
              <Card
                key={trait}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedTraits.includes(trait)
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:shadow-md hover:scale-[1.02]",
                  focusedTrait === index && "ring-2 ring-primary",
                  !mounted && "opacity-0"
                )}
                onClick={() => toggleTrait(trait)}
                onFocus={() => setFocusedTrait(index)}
                onBlur={() => setFocusedTrait(-1)}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedTraits.includes(trait)}
              >
                <CardHeader className="flex items-center justify-between p-4">
                  <span>{trait}</span>
                  <Checkbox
                    checked={selectedTraits.includes(trait)}
                    onCheckedChange={() => toggleTrait(trait)}
                    disabled={isLoading}
                  />
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
              onClick={() => setStep(1)}
              disabled={selectedTraits.length === 0}
            >
              הבא
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div
          className="space-y-6"
          role="region"
          aria-label="שאלון עוגני קריירה"
        >
          <h2 className="text-xl font-semibold text-right">
            שאלון "עוגני קריירה"
          </h2>
          <div className="text-xs text-gray-500 mb-2">
            ניתן להשתמש במקשי מספרים 0-9 לקביעת ערך
          </div>
          <div
            className={cn(
              "space-y-6 transition-opacity duration-200",
              isLoading && "opacity-50"
            )}
          >
            {ANCHOR_QUESTIONS.map((q, idx) => (
              <Card
                key={idx}
                className={cn(
                  "p-4 transition-all duration-200 hover:shadow-md",
                  !mounted && "opacity-0"
                )}
              >
                <CardHeader className="flex justify-between items-start">
                  <p className="font-medium leading-relaxed text-right">{q}</p>
                </CardHeader>
                <CardContent>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[anchors[idx]]}
                    onValueChange={(val: number[]) => updateAnchor(idx, val)}
                    disabled={isLoading}
                    aria-label={q}
                  />
                  <ul
                    className="flex justify-between text-[10px] mt-1 rtl:space-x-reverse"
                    dir="ltr"
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <li key={i} className="w-4 text-center">
                        {i}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-xs mt-1 rtl:space-x-reverse">
                    <span>נכון מאוד</span>
                    <span>לא נכון בכלל</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded"
              onClick={() => setStep(0)}
            >
              חזור
            </button>
            {/* You can add a "סיום" (Finish) button here if needed */}
          </div>
        </div>
      )}
    </section>
  )
}
