"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GuidanceApiResponse } from "@/lib/guidance/types";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import supabase from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function QuestionnaireGuidancePage() {
  const router = useRouter();
  const setCurrentStep = useQuestionnaireStore((state) => state.setCurrentStep);
  const [data, setData] = useState<GuidanceApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/signin");
        return;
      }

      const savedOnly =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("saved") === "1";

      const response = await fetch("/api/guidance", {
        method: savedOnly ? "GET" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "יצירת מפת הכיוון נכשלה");
      }

      setData(payload as GuidanceApiResponse);
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : "יצירת מפת הכיוון נכשלה"
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const continueToQuestionnaire2 = () => {
    setCurrentStep(5);
    router.push("/questionnaire");
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border-white/20 bg-white/10 text-white">
                שלב א׳
              </Badge>
              {data?.cached ? (
                <Badge variant="outline" className="border-emerald-200/50 text-emerald-100">
                  נשמר עבורך
                </Badge>
              ) : null}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">
                {data?.report.title || "מפת כיוון ראשונית"}
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-white/80">
                {data?.report.disclaimer ||
                  "זוהי תמונת כיוון קצרה לפני שלב ב׳, בלי ציוני התאמה סופיים."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              onClick={() => router.push("/dashboard")}
            >
              חזרה ללוח הבקרה
            </Button>
            <Button onClick={continueToQuestionnaire2}>
              המשך לשלב ב׳
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        </header>

        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? (
          <ErrorState error={error} onRetry={loadReport} />
        ) : null}
        {!isLoading && !error && data ? (
          <GuidanceReportView data={data} onContinue={continueToQuestionnaire2} />
        ) : null}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
        <Loader2 className="size-9 animate-spin text-emerald-100" />
        <div>
          <h2 className="text-xl font-semibold">מרכיבים את מפת הכיוון</h2>
          <p className="mt-2 text-sm text-white/70">
            זה לוקח רגע קצר, ואחריו אפשר להמשיך לשלב ב׳.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-red-200/40 bg-red-950/24 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">לא הצלחנו ליצור מפת כיוון</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">{error}</p>
        </div>
        <Button onClick={onRetry} variant="outline" className="border-white/30 bg-white/10 text-white">
          <RefreshCw className="size-4" />
          נסה שוב
        </Button>
      </CardContent>
    </Card>
  );
}

function GuidanceReportView({
  data,
  onContinue,
}: {
  data: GuidanceApiResponse;
  onContinue: () => void;
}) {
  const { report } = data;

  return (
    <div className="grid gap-6">
      <Card className="border-white/25 bg-white/10 text-white shadow-xl backdrop-blur-md">
        <CardContent className="grid gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-emerald-300/20 text-emerald-100">
              <Sparkles className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">תקציר אישי</h2>
          </div>
          <p className="max-w-4xl whitespace-pre-line text-lg leading-8 text-white/85">
            {report.coreSummary}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionTitle icon={<Compass className="size-5" />} title="נטיות הולנד מובילות" />
            <div className="space-y-5">
              {report.interestAreas.map((area) => (
                <div key={area.code} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge className="bg-white text-background">{area.code}</Badge>
                      <span className="font-semibold">{area.name}</span>
                    </div>
                    <span className="text-sm tabular-nums text-white/75">
                      {area.score}/100
                    </span>
                  </div>
                  <Progress value={area.score} className="h-2 bg-white/15" />
                  <p className="text-sm leading-6 text-white/75">{area.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionTitle title="מה נראה שחשוב לך בעבודה" />
            <div className="grid gap-3">
              {report.careerPriorities.map((priority) => (
                <div
                  key={priority.title}
                  className="rounded-md border border-white/15 bg-slate-950/20 p-4"
                >
                  <h3 className="font-semibold text-emerald-100">{priority.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {priority.evidence}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {report.designationDomains.length > 0 ? (
        <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <SectionTitle title="תחומי ייעוד שבחרת" />
            <div className="grid gap-3 sm:grid-cols-2">
              {report.designationDomains.map((domain) => (
                <div
                  key={`${domain.rank}-${domain.title}`}
                  className="rounded-md border border-white/15 bg-white/10 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Badge className="bg-emerald-200 text-slate-950">
                      {domain.rank}
                    </Badge>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{domain.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        {domain.summary}
                      </p>
                    </div>
                  </div>
                  {domain.selectedStatements.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {domain.selectedStatements.map((statement) => (
                        <span
                          key={statement}
                          className="rounded-md border border-white/20 bg-slate-950/20 px-2.5 py-1 text-xs leading-5 text-white/80"
                        >
                          {statement}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <SectionTitle title="3 כיוונים ראשוניים לבדיקה" />
        <div className="grid gap-4 md:grid-cols-3">
          {report.initialDirections.map((direction, index) => (
            <Card
              key={direction.title}
              className={cn(
                "border-white/20 text-white shadow-xl backdrop-blur-md",
                index === 0
                  ? "bg-emerald-300/15"
                  : index === 1
                    ? "bg-cyan-300/15"
                    : "bg-white/10"
              )}
            >
              <CardContent className="space-y-4 p-5">
                <h3 className="text-lg font-semibold leading-7">
                  {direction.title}
                </h3>
                <ReportDetail label="למה זה עשוי להתאים" value={direction.whyItMayFit} />
                <ReportDetail label="מה לבדוק בשלב ב׳" value={direction.whatToCheckNext} />
                <ReportDetail label="שאלה להשאיר פתוחה" value={direction.possibleTension} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{report.nextStep}</h2>
            <p className="mt-1 text-sm text-white/65">
              הדוח המלא והמדויק יותר ייבנה אחרי שלב ב׳.
            </p>
          </div>
          <Button onClick={onContinue}>
            המשך לשלב ב׳
            <ArrowLeft className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-white">
      {icon ? (
        <div className="flex size-9 items-center justify-center rounded-md bg-white/10">
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function ReportDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-emerald-100">{label}</div>
      <p className="mt-1 text-sm leading-6 text-white/75">{value}</p>
    </div>
  );
}
