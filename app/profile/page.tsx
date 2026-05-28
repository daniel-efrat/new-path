"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Loader2,
  Mail,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DiagnosticReport } from "@/lib/diagnostic/types";
import type { GuidanceReport } from "@/lib/guidance/types";
import supabase from "@/lib/supabase";

type ReportKind = "guidance" | "diagnostic";

interface StoredReportRow<TReport> {
  id: string;
  created_at: string;
  report_json: TReport | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [guidance, setGuidance] =
    useState<StoredReportRow<GuidanceReport> | null>(null);
  const [diagnostic, setDiagnostic] =
    useState<StoredReportRow<DiagnosticReport> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
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

      setEmail(session.user.email ?? null);

      const [guidanceResult, diagnosticResult] = await Promise.all([
        supabase
          .from("guidance_reports")
          .select("id, created_at, report_json")
          .eq("user_id", session.user.id)
          .not("report_json", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("diagnostic_reports")
          .select("id, created_at, report_json")
          .eq("user_id", session.user.id)
          .not("report_json", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (guidanceResult.error) throw guidanceResult.error;
      if (diagnosticResult.error) throw diagnosticResult.error;

      setGuidance(
        (guidanceResult.data as StoredReportRow<GuidanceReport> | null) ?? null
      );
      setDiagnostic(
        (diagnosticResult.data as StoredReportRow<DiagnosticReport> | null) ??
          null
      );
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "לא הצלחנו לטעון את הפרופיל"
      );
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border border-white/20 bg-white/10 p-5 text-white shadow-xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-primary">
              <UserRound className="size-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-normal">פרופיל</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/75">
                <Mail className="size-4" />
                <span dir="ltr">{email || "טוען..."}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/15"
            onClick={() => router.push("/dashboard")}
          >
            חזרה ללוח הבקרה
          </Button>
        </header>

        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? (
          <Card className="border-red-200/40 bg-red-950/25 text-white shadow-xl backdrop-blur-md">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-white/80">{error}</p>
              <Button onClick={loadProfile}>נסה שוב</Button>
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !error ? (
          <section className="grid gap-4 md:grid-cols-2">
            <ReportCard
              kind="guidance"
              title="מפת כיוון ראשונית"
              description="תוצאות שאלון 1, תחומי עניין, סדרי עדיפויות וכיוונים ראשוניים."
              report={guidance}
              href="/questionnaire/guidance"
            />
            <ReportCard
              kind="diagnostic"
              title="דו״ח אבחוני תעסוקתי"
              description="הדוח המלא לאחר שאלון 2, כולל ציוני יכולת, פרופיל אישיות ומקצועות מתאימים."
              report={diagnostic}
              href="/questionnaire/diagnostic"
            />
          </section>
        ) : null}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-8 text-center">
        <Loader2 className="size-9 animate-spin text-emerald-100" />
        <p className="text-sm text-white/75">טוען את הפרופיל והתוצאות שלך...</p>
      </CardContent>
    </Card>
  );
}

function ReportCard<TReport extends { title?: string; generatedAt?: string }>({
  kind,
  title,
  description,
  report,
  href,
}: {
  kind: ReportKind;
  title: string;
  description: string;
  report: StoredReportRow<TReport> | null;
  href: string;
}) {
  const router = useRouter();
  const storedTitle = report?.report_json?.title;
  const generatedAt = report?.report_json?.generatedAt || report?.created_at;
  const hasReport = Boolean(report?.report_json);
  const Icon = kind === "guidance" ? FileText : BarChart3;

  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex h-full flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-300/20 text-emerald-100">
              <Icon className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{storedTitle || title}</h2>
              {generatedAt ? (
                <p className="mt-1 text-xs text-white/60">
                  עודכן לאחרונה: {formatDate(generatedAt)}
                </p>
              ) : null}
            </div>
          </div>
          <Badge
            variant={hasReport ? "secondary" : "outline"}
            className={
              hasReport
                ? "bg-emerald-200 text-slate-950"
                : "border-white/25 text-white/75"
            }
          >
            {hasReport ? "נשמר" : "טרם נוצר"}
          </Badge>
        </div>

        <p className="text-sm leading-6 text-white/75">{description}</p>

        <Button
          className="mt-auto self-start"
          onClick={() => router.push(hasReport ? `${href}?saved=1` : href)}
        >
          {hasReport ? "צפה בתוצאות" : "פתח ליצירת תוצאות"}
          <ArrowLeft className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
