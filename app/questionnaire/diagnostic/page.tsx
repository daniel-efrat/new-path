"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Brain,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  DiagnosticApiResponse,
  DiagnosticOccupation,
  ScoreSummary,
} from "@/lib/diagnostic/types";
import supabase from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function QuestionnaireDiagnosticPage() {
  const router = useRouter();
  const [data, setData] = useState<DiagnosticApiResponse | null>(null);
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

      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "יצירת הדו״ח האבחוני נכשלה");
      }

      setData(payload as DiagnosticApiResponse);
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : "יצירת הדו״ח האבחוני נכשלה"
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="border-white/20 bg-white/10 text-white">
                שאלון 2
              </Badge>
              {data?.cached ? (
                <Badge variant="outline" className="border-emerald-200/50 text-emerald-100">
                  נשמר עבורך
                </Badge>
              ) : null}
              {data ? (
                <Badge variant="outline" className="border-white/25 text-white/75">
                  {providerLabel(data.provider)}
                </Badge>
              ) : null}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">
                {data?.report.title || "דו״ח אבחוני תעסוקתי"}
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-white/80">
                {data?.report.disclaimer ||
                  "ניתוח משולב של שאלון 1, מבחני היכולת, האישיות וערכי הליבה."}
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
          </div>
        </header>

        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? (
          <ErrorState error={error} onRetry={loadReport} />
        ) : null}
        {!isLoading && !error && data ? <DiagnosticReportView data={data} /> : null}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center">
        <Loader2 className="size-9 animate-spin text-emerald-100" />
        <div>
          <h2 className="text-xl font-semibold">מרכיבים את הדו״ח האבחוני</h2>
          <p className="mt-2 text-sm text-white/70">
            משלבים את שאלון 1, מבחני היכולת, האישיות וערכי הליבה.
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
          <h2 className="text-xl font-semibold">לא הצלחנו ליצור דו״ח אבחוני</h2>
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

function DiagnosticReportView({ data }: { data: DiagnosticApiResponse }) {
  const { report } = data;
  const [openOccupationId, setOpenOccupationId] = useState(
    report.topOccupations[0]?.id || null
  );

  return (
    <div className="grid gap-6">
      <Card className="border-white/25 bg-white/10 text-white shadow-xl backdrop-blur-md">
        <CardContent className="grid gap-5 p-5 sm:p-6">
          <SectionTitle icon={<Sparkles className="size-5" />} title="תקציר אבחוני" />
          <p className="max-w-5xl whitespace-pre-line text-lg leading-8 text-white/85">
            {report.summary}
          </p>
          {report.questionnaire1.topRiasec.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {report.questionnaire1.topRiasec.map((area) => (
                <Badge
                  key={area.code}
                  className="border-white/20 bg-white text-background"
                >
                  {area.name} {area.score}/100
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ScorePanel
          icon={<BarChart3 className="size-5" />}
          title="ציוני יכולת"
          scores={report.abilityScores}
        />
        <ScorePanel
          icon={<Brain className="size-5" />}
          title="פרופיל אישיות"
          scores={report.personalityScores}
        />
      </div>

      <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
        <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <SectionTitle icon={<Target className="size-5" />} title="חוזקות ומוקדי בדיקה" />
            <InsightList title="חוזקות בולטות" items={report.profileInsights.strengths} />
            <InsightList title="מוקדי התפתחות" items={report.profileInsights.developmentAreas} />
          </div>
          <div className="rounded-md border border-white/15 bg-slate-950/20 p-4">
            <h3 className="font-semibold text-emerald-100">סגנון עבודה משוער</h3>
            <p className="mt-3 text-sm leading-7 text-white/78">
              {report.profileInsights.workStyle}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle
            icon={<BriefcaseBusiness className="size-5" />}
            title="מקצועות המתאימים לך"
          />
        </div>
        <div className="grid gap-3">
          {report.topOccupations.map((occupation) => (
            <OccupationDisclosure
              key={occupation.id}
              occupation={occupation}
              isOpen={openOccupationId === occupation.id}
              onToggle={() =>
                setOpenOccupationId((current) =>
                  current === occupation.id ? null : occupation.id
                )
              }
            />
          ))}
        </div>
      </section>

      <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <SectionTitle title="צעדים מומלצים להמשך" />
          <ul className="grid gap-3 sm:grid-cols-3">
            {report.nextSteps.map((step) => (
              <li
                key={step}
                className="rounded-md border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80"
              >
                {step}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ScorePanel({
  icon,
  title,
  scores,
}: {
  icon: ReactNode;
  title: string;
  scores: ScoreSummary[];
}) {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionTitle icon={icon} title={title} />
        <div className="grid gap-4 sm:grid-cols-2">
          {scores.map((score) => (
            <div key={score.label} className="space-y-2 rounded-md border border-white/15 bg-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{score.label}</span>
                <span className="text-sm tabular-nums text-white/75">
                  {score.score}/100
                </span>
              </div>
              <Progress value={score.score} className="h-2 bg-white/15" />
              <p className="text-xs text-white/62">
                {score.answered}/{score.total} תשובות
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OccupationDisclosure({
  occupation,
  isOpen,
  onToggle,
}: {
  occupation: DiagnosticOccupation;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full flex-col gap-4 p-5 text-right transition-colors hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-emerald-300/18 text-emerald-100">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">{occupation.title}</h3>
              <Badge className="bg-white text-background">
                {occupation.matchPercent}% התאמה
              </Badge>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-white/75">
              {occupation.shortWhy}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-white/70 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen ? (
        <div className="border-t border-white/12 px-5 pb-5 pt-1">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-emerald-100">תיאור המקצוע</h4>
                <p className="mt-2 text-sm leading-7 text-white/78">
                  {occupation.description}
                </p>
              </div>
              <TextList title="נימוקי התאמה" items={occupation.fitReasons} />
              <TextList title="מה כדאי לבדוק" items={occupation.possibleTensions} />
            </div>

            <div className="space-y-4">
              <DetailBox
                icon={<GraduationCap className="size-5" />}
                title="הכשרה נדרשת"
              >
                <ul className="space-y-2 text-sm leading-6 text-white/78">
                  {occupation.requiredTraining.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </DetailBox>

              <DetailBox title="מקומות הכשרה">
                <div className="space-y-2">
                  {occupation.trainingPlaces.map((place) => (
                    <div
                      key={`${place.name}-${place.type}`}
                      className="rounded-md border border-white/12 bg-white/10 p-3"
                    >
                      <div className="text-sm font-semibold">{place.name}</div>
                      <div className="text-xs text-white/60">{place.type}</div>
                    </div>
                  ))}
                </div>
              </DetailBox>

              <DetailBox
                icon={<WalletCards className="size-5" />}
                title="שכר ממוצע במשק"
              >
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatSalary(occupation.averageSalary.monthlyGross)}
                  </div>
                  <p className="text-xs leading-5 text-white/62">
                    {occupation.averageSalary.source}
                    {occupation.averageSalary.sourceYear
                      ? `, ${occupation.averageSalary.sourceYear}`
                      : ""}
                    {occupation.averageSalary.note
                      ? ` · ${occupation.averageSalary.note}`
                      : ""}
                  </p>
                </div>
              </DetailBox>

              <Button
                asChild
                variant="outline"
                className="w-full border-white/25 bg-white/10 text-white hover:bg-white/15"
              >
                <Link
                  href={occupation.avodataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  להרחבה בעבודאטה
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function DetailBox({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-white/15 bg-slate-950/20 p-4">
      <div className="flex items-center gap-2 font-semibold text-emerald-100">
        {icon}
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-emerald-100">{title}</h4>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/78">
        {items.map((item) => (
          <li key={item} className="rounded-md border border-white/12 bg-white/10 p-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-emerald-100">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/80"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon?: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 text-white">
      {icon ? (
        <div className="flex size-10 items-center justify-center rounded-md bg-emerald-300/18 text-emerald-100">
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function providerLabel(provider: DiagnosticApiResponse["provider"]) {
  if (provider === "gemini") return "Gemini";
  if (provider === "openrouter") return "OpenRouter";
  return "חישוב מקומי";
}

function formatSalary(value: number | null) {
  if (value === null) return "לא זמין";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}
