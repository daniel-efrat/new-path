import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { cn } from "@/lib/utils";

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

const ANCHOR_QUESTIONS: string[] = [
  "אני שאפתני/ת ותחרותי/ת ולכן עבודה שתאפשר לי לממש את היצר התחרותי שבי חשובה לי",
  "אם אצליח למצוא תחום שמעניין אותי אעדיף לפתח את עצמי בו גם על חשבון קידום לתפקידים בכירים יותר",
  "חשוב לי לשלב בין דרישות העבודה לחיי המשפחה, וזה שיקול מרכזי אצלי בחיפוש עבודה",
  "קשה לי להיות כפוף/ה לאחרים ולכן ארצה עבודה שתאפשר לי חופש, גם אם ארוויח פחות",
  "אני מעדיף/ה תחושת ודאות וביטחון שיש בעבודה קבועה וסביבת עבודה מוכרת על פני כסף או מעמד",
  "הייתי רוצה עבודה שתאפשר לי ליצור דברים חדשים וליזום פרויקטים שיהיו רק שלי",
  "אני מייחס/ת חשיבות לכך שאוכל להחליט לבד על ביצוע העבודה — מה, מתי ואיך",
  "אני מחפש/ת עבודה שיש בה שליחות ויכולת לתרום תרומה משמעותית לחברה",
  "אני מוכן/ה לקחת תפקיד פחות מעניין אם הוא ישמש לי קרש קפיצה לניהול בכיר בעתיד",
  "אני רוצה עבודה עם אתגרים קשים שאחרים לא הצליחו לפתור",
  "הצלחה בקריירה בעיניי היא לפתח כישורים בתחום שמעניין אותי ולהפוך למומחה בו",
  "קריירה מוצלחת בשבילי משמעותה לעבור כל כמה שנים לתפקיד בכיר יותר עם יותר אחריות וניהול אנשים",
  "אני טיפוס יזמי שמחפש/ת כל הזמן פרויקטים חדשים לבנות מההתחלה",
  "חשובה לי תחושת הביטחון שמספקת עבודה קבועה או ניהול צוות שיעניק לי יציבות",
  "השאיפה המרכזית שלי היא להגיע לביטחון כלכלי ולא לחשוש מפיטורין או בעיות כספיות",
  "חשוב לי להיות עצמאי/ת בעבודה ולהימנע מצורך לתת דין וחשבון תכוף לממונים",
  "אני רואה עצמי כמי שמחולל שינוי ותורם לחברה במסגרת העבודה",
  "משמעות עבורי להרוויח פחות כסף אם אני מרגיש/ה שאני עושה משהו משמעותי שעוזר לאנשים",
];

export default function Step2({ onNext, onPrevious }: Step2Props) {
  const { stepData, setAnswer } = useQuestionnaireStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Get stored values or use defaults with proper type checking
  const anchors = Array.isArray(stepData.anchors?.value)
    ? (stepData.anchors.value as number[])
    : Array(ANCHOR_QUESTIONS.length).fill(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateAnchor = async (index: number, value: number[]) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setError(null);

      const newAnchors = [...anchors];
      newAnchors[index] = value[0];
      await setAnswer("anchors", newAnchors);
    } catch (err) {
      setError("שגיאה בשמירת הערך. נסה שנית.");
      console.error("Error updating anchor:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        שלב 2: עוגני קריירה
      </h1>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        דרג/י עד כמה את/ה מסכים/ה עם כל אחד מהמשפטים הבאים (0 = לא מסכים/ה בכלל, 10 = מסכים/ה מאוד)
      </p>
      <Card className="max-w-3xl mx-auto bg-white p-6">
        <div className={cn("space-y-6 transition-opacity duration-200", isLoading && "opacity-50")}>
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
                  <span>לא מסכים בכלל</span>
                  <span>מסכים מאוד</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onPrevious}>
            חזור לשלב הקודם
          </Button>
          <Button onClick={onNext}>
            המשך לשלב הבא
          </Button>
        </div>
      </Card>
    </div>
  );
}
