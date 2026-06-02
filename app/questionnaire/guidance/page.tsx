"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  FileDown,
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

const PDF_EXPORT_ELEMENT_ID = "guidance-pdf-export";
const PDF_BLOCK_SELECTOR = "[data-pdf-block='true']";
const PDF_PAGE_MARGIN_MM = 8;
const PDF_BLOCK_GAP_MM = 5;

export default function QuestionnaireGuidancePage() {
  const router = useRouter();
  const setCurrentStep = useQuestionnaireStore((state) => state.setCurrentStep);
  const [data, setData] = useState<GuidanceApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const isDev = process.env.NODE_ENV === "development";
  const showLoadingState = isLoading || isLoadingPreview;

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

  const handleDownloadPdf = useCallback(async () => {
    if (!data || isPdfGenerating) return;

    setIsPdfGenerating(true);
    setPdfError(null);

    let exportElement: HTMLElement | null = null;
    let previousTransform = "";
    let previousZIndex = "";
    let previousHtmlBackground = "";
    let previousBodyBackground = "";
    let previousBodyColor = "";

    try {
      await waitForPdfRender();
      await document.fonts?.ready;

      exportElement = document.getElementById(PDF_EXPORT_ELEMENT_ID);
      if (!exportElement) {
        throw new Error("PDF export content was not found");
      }

      previousTransform = exportElement.style.transform;
      previousZIndex = exportElement.style.zIndex;
      exportElement.style.transform = "none";
      exportElement.style.zIndex = "0";
      previousHtmlBackground = document.documentElement.style.background;
      previousBodyBackground = document.body.style.background;
      previousBodyColor = document.body.style.color;
      document.documentElement.style.background = "#ffffff";
      document.body.style.background = "#ffffff";
      document.body.style.color = "#0f172a";
      await waitForPdfRender();

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const blocks = Array.from(
        exportElement.querySelectorAll<HTMLElement>(PDF_BLOCK_SELECTOR)
      );
      if (blocks.length === 0) {
        throw new Error("PDF export blocks were not found");
      }

      const pdf = new jsPDF({
        compress: true,
        format: "a4",
        orientation: "portrait",
        unit: "mm",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - PDF_PAGE_MARGIN_MM * 2;
      const contentHeight = pageHeight - PDF_PAGE_MARGIN_MM * 2;
      let cursorY = PDF_PAGE_MARGIN_MM;
      let hasContentOnPage = false;

      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDocument) => {
            clonedDocument.documentElement.style.background = "#ffffff";
            clonedDocument.body.style.background = "#ffffff";
            clonedDocument.body.style.color = "#0f172a";
          },
          scale: Math.min(window.devicePixelRatio || 2, 2),
          useCORS: true,
          windowHeight: Math.max(exportElement.scrollHeight, block.scrollHeight),
          windowWidth: exportElement.scrollWidth,
        });

        const imageData = canvas.toDataURL("image/jpeg", 0.96);
        let imageWidth = contentWidth;
        let imageHeight = (canvas.height * imageWidth) / canvas.width;

        if (imageHeight > contentHeight) {
          const fitScale = contentHeight / imageHeight;
          imageWidth *= fitScale;
          imageHeight = contentHeight;
        }

        if (
          hasContentOnPage &&
          cursorY + imageHeight > pageHeight - PDF_PAGE_MARGIN_MM
        ) {
          pdf.addPage();
          cursorY = PDF_PAGE_MARGIN_MM;
          hasContentOnPage = false;
        }

        const imageX = PDF_PAGE_MARGIN_MM + (contentWidth - imageWidth) / 2;
        pdf.addImage(imageData, "JPEG", imageX, cursorY, imageWidth, imageHeight);
        cursorY += imageHeight + PDF_BLOCK_GAP_MM;
        hasContentOnPage = true;
      }

      pdf.save(getGuidancePdfFilename(data.report.generatedAt));
    } catch (pdfGenerationError) {
      console.error("Guidance PDF generation failed", pdfGenerationError);
      setPdfError("לא הצלחנו להפיק PDF. נסו שוב בעוד רגע.");
    } finally {
      if (exportElement) {
        exportElement.style.transform = previousTransform;
        exportElement.style.zIndex = previousZIndex;
      }
      document.documentElement.style.background = previousHtmlBackground;
      document.body.style.background = previousBodyBackground;
      document.body.style.color = previousBodyColor;
      setIsPdfGenerating(false);
    }
  }, [data, isPdfGenerating]);

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

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDownloadPdf}
                disabled={!data || showLoadingState || Boolean(error) || isPdfGenerating}
                aria-label="הורדת מפת הכיוון כקובץ PDF"
              >
                {isPdfGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                PDF
              </Button>
              {isDev ? (
                <Button
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => setIsLoadingPreview(true)}
                  disabled={showLoadingState}
                >
                  <Loader2 className="size-4" />
                  הצג טעינה
                </Button>
              ) : null}
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
            {pdfError ? (
              <p className="text-sm leading-6 text-red-100">{pdfError}</p>
            ) : null}
          </div>
        </header>

        {showLoadingState ? (
          <LoadingState
            isPreview={isLoadingPreview}
            onClosePreview={() => setIsLoadingPreview(false)}
          />
        ) : null}
        {!showLoadingState && error ? (
          <ErrorState error={error} onRetry={loadReport} />
        ) : null}
        {!showLoadingState && !error && data ? (
          <GuidanceReportView data={data} onContinue={continueToQuestionnaire2} />
        ) : null}
        {data ? <GuidancePdfDocument data={data} /> : null}
      </main>
    </div>
  );
}

function LoadingState({
  isPreview = false,
  onClosePreview,
}: {
  isPreview?: boolean;
  onClosePreview?: () => void;
}) {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-6 text-center sm:p-8">
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-transparent">
          <video
            className="absolute left-1/2 top-1/2 h-[116%] w-[102.5%] -translate-x-1/2 -translate-y-1/2 object-contain"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0 13.5%, transparent 13.5% 15%, #000 15% 84.8%, transparent 84.8% 86.3%, #000 86.3% 100%)",
              maskImage:
                "linear-gradient(to bottom, #000 0 13.5%, transparent 13.5% 15%, #000 15% 84.8%, transparent 84.8% 86.3%, #000 86.3% 100%)",
            }}
            src="/working2.webm"
            autoPlay
            loop
            muted
            playsInline
            aria-label="גילברט עובד על הכנת מפת הכיוון"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">מרכיבים את מפת הכיוון</h2>
          <p className="mt-2 text-sm text-white/70">
            גילברט עובד על זה עכשיו. זה לוקח רגע קצר, ואחריו אפשר להמשיך לשלב ב׳.
          </p>
        </div>
        {isPreview ? (
          <Button
            type="button"
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/15"
            onClick={onClosePreview}
          >
            חזרה לדוח
          </Button>
        ) : null}
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

function GuidancePdfDocument({ data }: { data: GuidanceApiResponse }) {
  const { report } = data;

  return (
    <article
      id={PDF_EXPORT_ELEMENT_ID}
      aria-hidden="true"
      dir="rtl"
      className="pointer-events-none fixed left-0 top-0 z-[-1] w-[794px] overflow-hidden bg-white text-[#0f172a]"
      style={{ transform: "translate3d(-120%, 0, 0)" }}
    >
      <div className="space-y-6 p-10">
        <header data-pdf-block="true" className="border-b border-[#d7dee8] pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[520px]">
              <p className="text-sm font-semibold text-[#0f766e]">
                דרך חדשה - מפת כיוון ראשונית
              </p>
              <h1 className="mt-2 text-4xl font-bold leading-tight text-[#0f172a]">
                {report.title}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#475569]">
                {report.disclaimer}
              </p>
            </div>
            <div className="min-w-[180px] rounded-md border border-[#d7dee8] bg-[#f8fafc] p-4 text-sm leading-6 text-[#334155]">
              <div>
                <span className="font-semibold text-[#0f172a]">תאריך: </span>
                {formatDateTime(report.generatedAt)}
              </div>
              <div>
                <span className="font-semibold text-[#0f172a]">שלב: </span>
                א׳
              </div>
            </div>
          </div>
        </header>

        <GuidancePdfSection title="תקציר אישי">
          <p className="whitespace-pre-line text-base leading-8 text-[#334155]">
            {report.coreSummary}
          </p>
        </GuidancePdfSection>

        <GuidancePdfSection title="נטיות הולנד מובילות">
          <div className="space-y-4">
            {report.interestAreas.map((area) => (
              <div key={area.code} className="rounded-md border border-[#e2e8f0] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#0f766e] px-2.5 py-1 text-sm font-bold text-white">
                      {area.code}
                    </span>
                    <h3 className="font-bold text-[#0f172a]">{area.name}</h3>
                  </div>
                  <span className="text-sm font-semibold text-[#475569]">
                    {area.score}/100
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{ width: `${clampPercent(area.score)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-[#475569]">
                  {area.summary}
                </p>
              </div>
            ))}
          </div>
        </GuidancePdfSection>

        <GuidancePdfSection title="מה נראה שחשוב לך בעבודה">
          <div className="grid grid-cols-2 gap-4">
            {report.careerPriorities.map((priority) => (
              <div
                key={priority.title}
                className="rounded-md border border-[#d7dee8] bg-[#f8fafc] p-4"
              >
                <h3 className="font-bold text-[#0f172a]">{priority.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#475569]">
                  {priority.evidence}
                </p>
              </div>
            ))}
          </div>
        </GuidancePdfSection>

        {report.designationDomains.length > 0 ? (
          <GuidancePdfSection title="תחומי ייעוד שבחרת">
            <div className="space-y-4">
              {report.designationDomains.map((domain) => (
                <div
                  key={`${domain.rank}-${domain.title}`}
                  className="rounded-md border border-[#d7dee8] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e0f2fe] text-sm font-bold text-[#075985]">
                      {domain.rank}
                    </span>
                    <div>
                      <h3 className="font-bold text-[#0f172a]">{domain.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#475569]">
                        {domain.summary}
                      </p>
                    </div>
                  </div>
                  {domain.selectedStatements.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {domain.selectedStatements.map((statement) => (
                        <span
                          key={statement}
                          className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-2.5 py-1 text-xs leading-5 text-[#334155]"
                        >
                          {statement}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </GuidancePdfSection>
        ) : null}

        <GuidancePdfSection title="3 כיוונים ראשוניים לבדיקה">
          <div className="space-y-4">
            {report.initialDirections.map((direction, index) => (
              <div
                key={direction.title}
                className="rounded-md border border-[#d7dee8] p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#ecfdf5] text-sm font-bold text-[#047857]">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f172a]">
                    {direction.title}
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <GuidancePdfDetail
                    label="למה זה עשוי להתאים"
                    value={direction.whyItMayFit}
                  />
                  <GuidancePdfDetail
                    label="מה לבדוק בשלב ב׳"
                    value={direction.whatToCheckNext}
                  />
                  <GuidancePdfDetail
                    label="שאלה להשאיר פתוחה"
                    value={direction.possibleTension}
                  />
                </div>
              </div>
            ))}
          </div>
        </GuidancePdfSection>

        <GuidancePdfSection title="המשך">
          <p className="text-base font-semibold leading-8 text-[#0f172a]">
            {report.nextStep}
          </p>
          <p className="mt-2 text-sm leading-7 text-[#475569]">
            הדוח המלא והמדויק יותר ייבנה אחרי שלב ב׳.
          </p>
        </GuidancePdfSection>
      </div>
    </article>
  );
}

function GuidancePdfSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      data-pdf-block="true"
      className="rounded-md border border-[#d7dee8] bg-white p-5"
    >
      <h2 className="mb-4 border-b border-[#e2e8f0] pb-2 text-2xl font-bold text-[#0f172a]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function GuidancePdfDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f8fafc] p-3">
      <div className="text-xs font-bold text-[#0f766e]">{label}</div>
      <p className="mt-1 text-xs leading-6 text-[#475569]">{value}</p>
    </div>
  );
}

function waitForPdfRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function getGuidancePdfFilename(generatedAt: string) {
  const date = new Date(generatedAt);
  const isoDate = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);

  return `guidance-report-${isoDate}.pdf`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
