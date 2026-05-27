"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function QuestionnaireError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Questionnaire error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-6">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-4">
            אירעה שגיאה בטעינת השאלון
          </h2>
          <p className="text-red-800 mb-6">
            לא הצלחנו לטעון את השאלון כראוי. אנא נסה שוב או צור קשר עם התמיכה אם
            הבעיה נמשכת.
          </p>
          <div className="space-x-3 rtl:space-x-reverse">
            <Button
              onClick={reset}
              variant="destructive"
              className="min-w-[120px]"
            >
              נסה שנית
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="min-w-[120px]"
            >
              חזרה לדף הבית
            </Button>
          </div>
        </div>

        {/* Show error details in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-left bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">
              Error details:
            </p>
            <pre className="text-xs text-red-800 overflow-auto max-h-48">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </div>
        )}

        {/* Support contact */}
        <div className="text-center text-sm text-muted-background ">
          <p>צריך עזרה?</p>
          <a
            href="mailto:support@example.com"
            className="text-white hover:bg-white/10 underline"
          >
            support@example.com
          </a>
        </div>
      </div>
    </div>
  );
}
