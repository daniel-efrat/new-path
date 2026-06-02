import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuestionnaireNotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          {/* 404 Icon */}
          <div className="text-6xl font-bold text-gray-200">404</div>

          <h1 className="text-2xl font-semibold text-foreground">
            הדף המבוקש לא נמצא
          </h1>

          <p className="text-muted-foreground">
            ייתכן שהקישור שלחצת עליו שגוי או שהדף הוסר. נסה להתחיל את השאלון
            מחדש.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="default" className="min-w-[140px]">
            <Link href="/questionnaire">התחל שאלון חדש</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="min-w-[140px] border-slate-500 bg-white text-slate-900"
          >
            <Link href="/">חזרה לדף הבית</Link>
          </Button>
        </div>

        {/* Help section */}
        <div className="border-t border-white/60 pt-8 text-sm font-medium text-white/90">
          <p>צריך עזרה?</p>
          <a
            href="mailto:support@example.com"
            className="text-white underline decoration-white/80 underline-offset-4 hover:bg-white/10"
          >
            צור קשר עם התמיכה
          </a>
        </div>
      </div>
    </div>
  );
}
