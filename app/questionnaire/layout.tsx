import ErrorBoundary from "@/components/ErrorBoundary"
import { Suspense } from "react"

export default function QuestionnaireLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse space-y-8 w-full max-w-4xl mx-auto p-4">
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export const metadata = {
  title: "שאלון אבחון תעסוקתי",
  description: "מלא את השאלון כדי לקבל המלצות מותאמות אישית למסלול הקריירה שלך",
}
