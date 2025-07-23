import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { cn } from "@/lib/utils"

interface Step4Props {
  onNext: () => void
  onPrevious: () => void
}

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
  "עבודה שמונעת ממני לטפח את חיי הפרט או המשפחה או התחביבים שלי מבחינת הזמן והאנרגיה שאני צריך לכך - לא מתאימה לי.",
]

export default function Step4({ onNext, onPrevious }: Step4Props) {
  const { stepData, setAnswer } = useQuestionnaireStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Get stored values or use defaults with proper type checking
  const anchors = Array.isArray(stepData.anchors?.value)
    ? (stepData.anchors.value as number[])
    : Array(ANCHOR_QUESTIONS.length).fill(5)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        שלב 4: עוגני קריירה
      </h1>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        דרג/י עד כמה את/ה מסכים/ה עם כל אחד מהמשפטים הבאים (0 = לא מסכים/ה בכלל,
        10 = מסכים/ה מאוד)
      </p>
      <Card className="max-w-3xl mx-auto bg-white p-6">
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
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onPrevious}>
            חזור לשלב הקודם
          </Button>
          <Button onClick={onNext}>המשך לשלב הבא</Button>
        </div>
      </Card>
    </div>
  )
}
