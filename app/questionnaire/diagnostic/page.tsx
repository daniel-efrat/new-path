"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Brain,
  ChevronDown,
  ExternalLink,
  FileDown,
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
import {
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP5_QUESTIONS,
  STEP6_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP9_QUESTIONS,
} from "@/lib/constants/questions";
import type {
  DiagnosticApiResponse,
  DiagnosticOccupation,
  ScoreSummary,
} from "@/lib/diagnostic/types";
import supabase from "@/lib/supabase";
import { fetchStepAnswers } from "@/lib/utils/answerFetcher";
import { cn } from "@/lib/utils";

const ABILITY_STEP_BY_LABEL: Record<string, number> = {
  "שפה עברית": 5,
  "שפה אנגלית": 6,
  "חשיבה לוגית": 7,
  "חשיבה כמותית": 8,
  "חשיבה חזותית": 9,
  "ידע בסיסי במחשב": 10,
  "קשב": 11,
  "סינון מידע": 11,
  "זיכרון עבודה": 11,
};

const PDF_EXPORT_ELEMENT_ID = "diagnostic-pdf-export";
const PDF_BLOCK_SELECTOR = "[data-pdf-block='true']";
const PDF_RESULT_SHEET_SELECTOR = "[data-pdf-result-sheet='true']";
const PDF_PAGE_MARGIN_MM = 8;
const PDF_BLOCK_GAP_MM = 5;

const OCCUPATION_SCORE_LABELS: Record<
  keyof DiagnosticOccupation["scoreBreakdown"],
  string
> = {
  interests: "תחומי עניין",
  abilities: "יכולות",
  personality: "אישיות",
  priorities: "העדפות",
  domain: "תחום מקצועי",
};

interface PdfResultRow {
  number: number;
  category?: string;
  question: string;
  questionImage?: string;
  userAnswer: string;
  userAnswerImage?: string;
  correctAnswer: string;
  correctAnswerImage?: string;
  isCorrect: boolean;
}

interface PdfResultSheet {
  id: string;
  title: string;
  score: number;
  total: number;
  rows: PdfResultRow[];
  summaryItems?: Array<{ label: string; value: string }>;
}

interface OptionQuestion {
  id: string;
  number?: number;
  level?: string;
  question: string;
  options: string[];
  correct_option: number;
  category?: string;
}

export default function QuestionnaireDiagnosticPage() {
  const router = useRouter();
  const [data, setData] = useState<DiagnosticApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [resultSheets, setResultSheets] = useState<PdfResultSheet[]>([]);
  const [areResultSheetsLoading, setAreResultSheetsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const hasPdfResultSheets = resultSheets.length > 0;

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserName(null);
        router.push("/signin");
        return;
      }

      setUserName(getUserDisplayName(session.user));

      const savedOnly =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("saved") === "1";

      const response = await fetch("/api/diagnostic", {
        method: savedOnly ? "GET" : "POST",
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

  useEffect(() => {
    if (!data) {
      setResultSheets([]);
      return;
    }

    let isCancelled = false;

    const loadResultSheets = async () => {
      setAreResultSheetsLoading(true);
      setPdfError(null);

      try {
        const sheets = await loadDiagnosticResultSheets();
        if (!isCancelled) {
          setResultSheets(sheets);
        }
      } catch (resultSheetError) {
        console.error("Diagnostic PDF result sheets failed to load", resultSheetError);
        if (!isCancelled) {
          setResultSheets([]);
          setPdfError("לא הצלחנו לטעון את גיליונות התוצאות ל-PDF.");
        }
      } finally {
        if (!isCancelled) {
          setAreResultSheetsLoading(false);
        }
      }
    };

    void loadResultSheets();

    return () => {
      isCancelled = true;
    };
  }, [data]);

  const handleDownloadPdf = useCallback(async () => {
    if (
      !data ||
      isPdfGenerating ||
      areResultSheetsLoading ||
      !hasPdfResultSheets
    ) {
      return;
    }

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

      const resultSheetBlocks = Array.from(
        exportElement.querySelectorAll<HTMLElement>(PDF_RESULT_SHEET_SELECTOR)
      );
      if (resultSheetBlocks.length !== resultSheets.length) {
        throw new Error("PDF result sheet blocks were not ready");
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

      pdf.save(getDiagnosticPdfFilename(data.report.generatedAt));
    } catch (pdfGenerationError) {
      console.error("Diagnostic PDF generation failed", pdfGenerationError);
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
  }, [
    areResultSheetsLoading,
    data,
    hasPdfResultSheets,
    isPdfGenerating,
    resultSheets.length,
  ]);

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

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDownloadPdf}
                disabled={
                  !data ||
                  isLoading ||
                  Boolean(error) ||
                  isPdfGenerating ||
                  areResultSheetsLoading ||
                  !hasPdfResultSheets
                }
                aria-label="הורדת הדו״ח כקובץ PDF"
              >
                {isPdfGenerating || areResultSheetsLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileDown className="size-4" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
                onClick={() => router.push("/dashboard")}
              >
                חזרה ללוח הבקרה
              </Button>
            </div>
            {pdfError ? (
              <p className="text-sm leading-6 text-red-100">{pdfError}</p>
            ) : null}
          </div>
        </header>

        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? (
          <ErrorState error={error} onRetry={loadReport} />
        ) : null}
        {!isLoading && !error && data ? <DiagnosticReportView data={data} /> : null}
        {data ? (
          <DiagnosticPdfDocument
            data={data}
            resultSheets={resultSheets}
            userName={userName}
          />
        ) : null}
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
          getResultHref={(score) => {
            const step = ABILITY_STEP_BY_LABEL[score.label];
            return step ? `/questionnaire?step=${step}&results=1` : null;
          }}
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
            title="מקצועות שמתאימים לך"
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
  getResultHref,
}: {
  icon: ReactNode;
  title: string;
  scores: ScoreSummary[];
  getResultHref?: (score: ScoreSummary) => string | null;
}) {
  return (
    <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionTitle icon={icon} title={title} />
        <div className="grid gap-4 sm:grid-cols-2">
          {scores.map((score) => {
            const href = getResultHref?.(score) || null;
            const content = (
              <>
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
              </>
            );

            return href ? (
              <Link
                key={score.label}
                href={href}
                className="block w-full cursor-pointer space-y-2 rounded-md border border-white/15 bg-white/10 p-4 text-right transition hover:border-white/35 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label={`פתח תוצאות ${score.label}`}
              >
                {content}
              </Link>
            ) : (
              <div
                key={score.label}
                className="space-y-2 rounded-md border border-white/15 bg-white/10 p-4"
              >
                {content}
              </div>
            );
          })}
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
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const scrollFrame = requestAnimationFrame(() => {
      scrollCardBelowFixedHeader(cardRef.current, "smooth");
    });
    const settleScroll = window.setTimeout(() => {
      scrollCardBelowFixedHeader(cardRef.current, "smooth");
    }, 320);

    return () => {
      cancelAnimationFrame(scrollFrame);
      window.clearTimeout(settleScroll);
    };
  }, [isOpen]);

  return (
    <Card
      ref={cardRef}
      className="overflow-hidden border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md"
    >
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
            "size-5 shrink-0 text-white/70 transition-transform duration-300 ease-out",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="occupation-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={() => {
              if (isOpen) {
                scrollCardBelowFixedHeader(cardRef.current, "auto");
              }
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/12 px-5 pb-5 pt-1">
              <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-emerald-100">
                      תיאור המקצוע
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-white/78">
                      {occupation.description}
                    </p>
                  </div>
                  <TextList title="נימוקי התאמה" items={occupation.fitReasons} />
                  <TextList
                    title="מה כדאי לבדוק"
                    items={occupation.possibleTensions}
                  />
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
                          <div className="text-sm font-semibold">
                            {place.name}
                          </div>
                          <div className="text-xs text-white/60">
                            {place.type}
                          </div>
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
          </motion.div>
        ) : null}
      </AnimatePresence>
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

function DiagnosticPdfDocument({
  data,
  resultSheets,
  userName,
}: {
  data: DiagnosticApiResponse;
  resultSheets: PdfResultSheet[];
  userName: string | null;
}) {
  const { report } = data;

  return (
    <article
      id={PDF_EXPORT_ELEMENT_ID}
      aria-hidden="true"
      dir="rtl"
      className="pointer-events-none fixed left-0 top-0 z-[-1] w-[794px] overflow-hidden bg-[#ffffff] text-[#0f172a]"
      style={{ transform: "translate3d(-120%, 0, 0)" }}
    >
      <div className="space-y-6 p-10">
        <header data-pdf-block="true" className="border-b border-[#d7dee8] pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-[520px]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-sm font-semibold text-[#0f766e]">
                  דרך חדשה - דו״ח אבחוני תעסוקתי
                </p>
                {userName ? (
                  <p className="text-xl font-semibold text-[#ea580c]">
                    {userName}
                  </p>
                ) : null}
              </div>
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
            </div>
          </div>
        </header>

        <PdfSection title="תקציר אבחוני">
          <p className="whitespace-pre-line text-base leading-8 text-[#334155]">
            {report.summary}
          </p>
          {report.questionnaire1.guidanceTitle ||
          report.questionnaire1.guidanceSummary ? (
            <div className="mt-4 rounded-md border border-[#d7dee8] bg-[#f8fafc] p-4">
              {report.questionnaire1.guidanceTitle ? (
                <h3 className="text-lg font-bold text-[#0f172a]">
                  {report.questionnaire1.guidanceTitle}
                </h3>
              ) : null}
              {report.questionnaire1.guidanceSummary ? (
                <p className="mt-2 text-sm leading-7 text-[#475569]">
                  {report.questionnaire1.guidanceSummary}
                </p>
              ) : null}
            </div>
          ) : null}
        </PdfSection>

        <PdfSection title="תוצאות שאלון 1">
          <PdfChipGrid
            items={report.questionnaire1.topRiasec.map((area) => ({
              label: area.name,
              value: `${area.score}/100`,
            }))}
          />
        </PdfSection>

        <PdfSection title="תוצאות אישיות של מבחני היכולת">
          <PdfScoreGrid scores={report.abilityScores} />
        </PdfSection>

        <PdfSection title="תוצאות אישיות של פרופיל האישיות">
          <PdfScoreGrid scores={report.personalityScores} />
        </PdfSection>

        <PdfSection title="חוזקות ומוקדי בדיקה">
          <div className="grid grid-cols-2 gap-4">
            <PdfTextList
              title="חוזקות בולטות"
              items={report.profileInsights.strengths}
            />
            <PdfTextList
              title="מוקדי התפתחות"
              items={report.profileInsights.developmentAreas}
            />
          </div>
          <div className="mt-4 rounded-md border border-[#d7dee8] bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#0f172a]">סגנון עבודה משוער</h3>
            <p className="mt-2 text-sm leading-7 text-[#475569]">
              {report.profileInsights.workStyle}
            </p>
          </div>
        </PdfSection>

        <PdfSection title="מקצועות שמתאימים לך" keepTogether={false}>
          <div className="space-y-5">
            {report.topOccupations.map((occupation, index) => (
              <PdfOccupation
                key={occupation.id}
                occupation={occupation}
                index={index + 1}
              />
            ))}
          </div>
        </PdfSection>

        <PdfSection title="צעדים מומלצים להמשך">
          <PdfTextList items={report.nextSteps} />
        </PdfSection>

        {resultSheets.length > 0 ? <PdfResultSheets sheets={resultSheets} /> : null}
      </div>
    </article>
  );
}

function PdfSection({
  title,
  children,
  keepTogether = true,
}: {
  title: string;
  children: ReactNode;
  keepTogether?: boolean;
}) {
  return (
    <section
      data-pdf-block={keepTogether ? "true" : undefined}
      className="rounded-md border border-[#d7dee8] bg-[#ffffff] p-5"
    >
      <h2
        data-pdf-block={!keepTogether ? "true" : undefined}
        className="mb-4 border-b border-[#e2e8f0] pb-2 text-2xl font-bold text-[#0f172a]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function PdfScoreGrid({ scores }: { scores: ScoreSummary[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {scores.map((score) => {
        const scoreValue = clampPercent(score.score);

        return (
          <div
            key={score.label}
            className="rounded-md border border-[#d7dee8] bg-[#f8fafc] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-[#0f172a]">{score.label}</h3>
              <span className="font-bold tabular-nums text-[#0f766e]">
                {scoreValue}/100
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dbe4ee]">
              <div
                className="h-full rounded-full bg-[#0f766e]"
                style={{ width: `${scoreValue}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#64748b]">
              {score.answered}/{score.total} תשובות
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PdfChipGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[#64748b]">אין נתונים זמינים.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-md border border-[#c6d7df] bg-[#e6f6f1] px-3 py-2 text-sm font-semibold text-[#115e59]"
        >
          {item.label}: {item.value}
        </div>
      ))}
    </div>
  );
}

function PdfTextList({ title, items }: { title?: string; items: string[] }) {
  return (
    <div>
      {title ? (
        <h3 className="mb-3 text-lg font-bold text-[#0f172a]">{title}</h3>
      ) : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-[#d7dee8] bg-[#f8fafc] p-3 text-sm leading-6 text-[#334155]"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PdfResultSheets({ sheets }: { sheets: PdfResultSheet[] }) {
  return (
    <section>
      <h2
        data-pdf-block="true"
        className="mb-5 border-b border-[#e2e8f0] pb-2 text-2xl font-bold text-[#0f172a]"
      >
        גיליונות תוצאות המבחנים
      </h2>
      <div className="space-y-5">
        {sheets.map((sheet) => (
          <PdfResultSheetView key={sheet.id} sheet={sheet} />
        ))}
      </div>
    </section>
  );
}

function PdfResultSheetView({ sheet }: { sheet: PdfResultSheet }) {
  const percentage =
    sheet.total > 0 ? Math.round((sheet.score / sheet.total) * 100) : 0;

  return (
    <section
      data-pdf-block="true"
      data-pdf-result-sheet="true"
      className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0f766e]">גיליון תוצאות</p>
          <h3 className="mt-1 text-2xl font-bold text-[#0f172a]">
            {sheet.title}
          </h3>
        </div>
        <div className="rounded-md bg-[#0f766e] px-4 py-2 text-lg font-bold text-[#ffffff]">
          {sheet.score}/{sheet.total} ({percentage}%)
        </div>
      </div>

      {sheet.summaryItems && sheet.summaryItems.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {sheet.summaryItems.map((item) => (
            <div
              key={`${sheet.id}-${item.label}`}
              className="rounded-md border border-[#d7dee8] bg-[#ffffff] p-3"
            >
              <div className="text-xs font-semibold text-[#64748b]">
                {item.label}
              </div>
              <div className="mt-1 font-bold text-[#0f172a]">{item.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-md border border-[#cbd5e1] bg-[#ffffff]">
        <table className="w-full border-collapse text-right text-[11px] leading-5 text-[#0f172a]">
          <thead>
            <tr className="bg-[#e2e8f0]">
              <th className="w-[34px] border border-[#cbd5e1] p-2">#</th>
              {sheet.rows.some((row) => row.category) ? (
                <th className="w-[76px] border border-[#cbd5e1] p-2">תחום</th>
              ) : null}
              <th className="border border-[#cbd5e1] p-2">שאלה</th>
              <th className="border border-[#cbd5e1] p-2">התשובה שלך</th>
              <th className="border border-[#cbd5e1] p-2">תשובה נכונה</th>
              <th className="w-[42px] border border-[#cbd5e1] p-2">ציון</th>
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row) => (
              <tr
                key={`${sheet.id}-${row.number}`}
                className={row.isCorrect ? "bg-[#ecfdf5]" : "bg-[#fff1f2]"}
              >
                <td className="border border-[#cbd5e1] p-2 text-center">
                  {row.number}
                </td>
                {sheet.rows.some((item) => item.category) ? (
                  <td className="border border-[#cbd5e1] p-2">
                    {row.category || ""}
                  </td>
                ) : null}
                <td className="border border-[#cbd5e1] p-2">
                  <PdfResultCell text={row.question} image={row.questionImage} />
                </td>
                <td className="border border-[#cbd5e1] p-2">
                  <PdfResultCell
                    text={row.userAnswer}
                    image={row.userAnswerImage}
                  />
                </td>
                <td className="border border-[#cbd5e1] p-2">
                  <PdfResultCell
                    text={row.correctAnswer}
                    image={row.correctAnswerImage}
                  />
                </td>
                <td className="border border-[#cbd5e1] p-2 text-center text-lg font-bold">
                  <span className={row.isCorrect ? "text-[#16a34a]" : "text-[#dc2626]"}>
                    {row.isCorrect ? "✓" : "✗"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PdfResultCell({ text, image }: { text: string; image?: string }) {
  return (
    <div className="flex min-h-[34px] flex-col items-center justify-center gap-1 text-center">
      {image ? <PdfImageBox src={image} label={text} /> : null}
      <span>{text}</span>
    </div>
  );
}

function PdfImageBox({ src, label }: { src: string; label: string }) {
  return (
    <div
      aria-label={label}
      className="h-12 w-12 rounded border border-[#cbd5e1] bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${src}")` }}
    />
  );
}

function PdfOccupation({
  occupation,
  index,
}: {
  occupation: DiagnosticOccupation;
  index: number;
}) {
  return (
    <section
      data-pdf-block="true"
      className="rounded-md border border-[#cbd5e1] bg-[#f8fafc] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0f766e]">מקצוע {index}</p>
          <h3 className="mt-1 text-2xl font-bold text-[#0f172a]">
            {occupation.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-[#475569]">
            {occupation.shortWhy}
          </p>
        </div>
        <div className="rounded-md bg-[#0f766e] px-4 py-2 text-lg font-bold text-[#ffffff]">
          {occupation.matchPercent}% התאמה
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-[#0f172a]">תיאור המקצוע</h4>
        <p className="mt-2 text-sm leading-7 text-[#475569]">
          {occupation.description}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <PdfTextList title="נימוקי התאמה" items={occupation.fitReasons} />
        <PdfTextList title="מה כדאי לבדוק" items={occupation.possibleTensions} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <PdfTextList
          title="הכשרה נדרשת"
          items={occupation.requiredTraining}
        />
        <div>
          <h4 className="mb-3 text-lg font-bold text-[#0f172a]">
            מקומות הכשרה
          </h4>
          <div className="space-y-2">
            {occupation.trainingPlaces.map((place) => (
              <div
                key={`${occupation.id}-${place.name}-${place.type}`}
                className="rounded-md border border-[#d7dee8] bg-[#ffffff] p-3"
              >
                <div className="font-semibold text-[#0f172a]">{place.name}</div>
                <div className="text-xs text-[#64748b]">{place.type}</div>
                {place.url ? (
                  <div className="mt-1 break-all text-xs text-[#0f766e]">
                    {place.url}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-[#d7dee8] bg-[#ffffff] p-4">
          <h4 className="font-bold text-[#0f172a]">שכר ממוצע במשק</h4>
          <div className="mt-2 text-xl font-bold text-[#0f766e]">
            {formatSalary(occupation.averageSalary.monthlyGross)}
          </div>
          <p className="mt-2 text-xs leading-5 text-[#64748b]">
            {occupation.averageSalary.source}
            {occupation.averageSalary.sourceYear
              ? `, ${occupation.averageSalary.sourceYear}`
              : ""}
            {occupation.averageSalary.note
              ? ` · ${occupation.averageSalary.note}`
              : ""}
          </p>
        </div>

        <div className="rounded-md border border-[#d7dee8] bg-[#ffffff] p-4">
          <h4 className="font-bold text-[#0f172a]">פירוט התאמה</h4>
          <div className="mt-3 space-y-2">
            {(
              Object.entries(occupation.scoreBreakdown) as Array<
                [keyof DiagnosticOccupation["scoreBreakdown"], number]
              >
            ).map(([key, value]) => {
              const scoreValue = clampPercent(value);

              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-semibold text-[#475569]">
                    <span>{OCCUPATION_SCORE_LABELS[key]}</span>
                    <span>{scoreValue}/100</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#dbe4ee]">
                    <div
                      className="h-full rounded-full bg-[#0f766e]"
                      style={{ width: `${scoreValue}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 break-all text-xs text-[#0f766e]">
            {occupation.avodataUrl}
          </div>
        </div>
      </div>
    </section>
  );
}

async function loadDiagnosticResultSheets(): Promise<PdfResultSheet[]> {
  const allQuestions: OptionQuestion[] = [
    ...STEP2_QUESTIONS,
    ...STEP3_QUESTIONS,
    ...STEP5_QUESTIONS,
    ...STEP6_QUESTIONS,
    ...STEP7_QUESTIONS,
    ...STEP8_QUESTIONS,
    ...STEP9_QUESTIONS,
  ];
  const answerMap = await fetchStepAnswers(
    Array.from(new Set(allQuestions.map((question) => question.id)))
  );

  return [
    buildIndexedResultSheet({
      id: "hebrew",
      title: "שפה עברית",
      questions: STEP2_QUESTIONS,
      answerMap,
      unansweredLabel: "דילגת",
    }),
    buildTextResultSheet({
      id: "english",
      title: "שפה אנגלית",
      questions: STEP3_QUESTIONS,
      answerMap,
    }),
    buildIndexedResultSheet({
      id: "logic",
      title: "חשיבה לוגית",
      questions: STEP5_QUESTIONS,
      answerMap,
      unansweredLabel: "דילגת",
    }),
    buildIndexedResultSheet({
      id: "math",
      title: "חשיבה כמותית",
      questions: STEP6_QUESTIONS,
      answerMap,
      unansweredLabel: "דילגת",
    }),
    buildIndexedResultSheet({
      id: "visual",
      title: "חשיבה חזותית",
      questions: STEP7_QUESTIONS,
      answerMap,
      includeImages: true,
      unansweredLabel: "דילגת",
    }),
    buildIndexedResultSheet({
      id: "computer",
      title: "ידע בסיסי במחשב",
      questions: STEP8_QUESTIONS,
      answerMap,
    }),
    buildIndexedResultSheet({
      id: "attention-memory",
      title: "קשב, סינון מידע וזיכרון עבודה",
      questions: STEP9_QUESTIONS,
      answerMap,
      includeCategory: true,
    }),
  ];
}

function buildIndexedResultSheet({
  id,
  title,
  questions,
  answerMap,
  includeCategory = false,
  includeImages = false,
  unansweredLabel = "לא נענה",
}: {
  id: string;
  title: string;
  questions: OptionQuestion[];
  answerMap: Record<string, { value: unknown }>;
  includeCategory?: boolean;
  includeImages?: boolean;
  unansweredLabel?: string;
}): PdfResultSheet {
  const rows = questions.map<PdfResultRow>((question, index) => {
    const answerIndex = coerceAnswerIndex(answerMap[question.id]?.value);
    const userHasAnswer =
      answerIndex !== null &&
      answerIndex >= 0 &&
      answerIndex < question.options.length;
    const isCorrect = answerIndex === question.correct_option;
    const number = question.number ?? index + 1;
    const questionLabel = includeImages
      ? question.level || `שאלה ${number}`
      : question.question;

    return {
      number,
      category: includeCategory ? question.category : undefined,
      question: questionLabel,
      questionImage: includeImages ? question.question : undefined,
      userAnswer: userHasAnswer
        ? includeImages
          ? `אפשרות ${answerIndex + 1}`
          : question.options[answerIndex]
        : unansweredLabel,
      userAnswerImage:
        includeImages && userHasAnswer ? question.options[answerIndex] : undefined,
      correctAnswer: includeImages
        ? `אפשרות ${question.correct_option + 1}`
        : question.options[question.correct_option],
      correctAnswerImage: includeImages
        ? question.options[question.correct_option]
        : undefined,
      isCorrect,
    };
  });

  return {
    id,
    title,
    rows,
    score: rows.filter((row) => row.isCorrect).length,
    total: rows.length,
    summaryItems: includeCategory ? buildCategorySummary(rows) : undefined,
  };
}

function buildTextResultSheet({
  id,
  title,
  questions,
  answerMap,
}: {
  id: string;
  title: string;
  questions: OptionQuestion[];
  answerMap: Record<string, { value: unknown }>;
}): PdfResultSheet {
  const rows = questions.map<PdfResultRow>((question, index) => {
    const rawAnswer = answerMap[question.id]?.value;
    const userAnswer = typeof rawAnswer === "string" ? rawAnswer : null;
    const correctAnswer = question.options[question.correct_option];

    return {
      number: question.number ?? index + 1,
      question: question.question,
      userAnswer: userAnswer || "דילגת",
      correctAnswer,
      isCorrect: userAnswer === correctAnswer,
    };
  });

  return {
    id,
    title,
    rows,
    score: rows.filter((row) => row.isCorrect).length,
    total: rows.length,
  };
}

function buildCategorySummary(rows: PdfResultRow[]) {
  const byCategory = new Map<string, { correct: number; total: number }>();

  rows.forEach((row) => {
    if (!row.category) return;

    const summary = byCategory.get(row.category) || { correct: 0, total: 0 };
    summary.total += 1;
    if (row.isCorrect) {
      summary.correct += 1;
    }
    byCategory.set(row.category, summary);
  });

  return Array.from(byCategory.entries()).map(([label, summary]) => ({
    label,
    value: `${summary.correct} מתוך ${summary.total}`,
  }));
}

function coerceAnswerIndex(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const metadata = user.user_metadata || {};
  const candidate =
    getStringMetadataValue(metadata.full_name) ||
    getStringMetadataValue(metadata.name) ||
    getStringMetadataValue(metadata.display_name);

  if (candidate) return candidate;

  const emailName = user.email?.split("@")[0]?.trim();
  return emailName || null;
}

function getStringMetadataValue(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function providerLabel(provider: DiagnosticApiResponse["provider"]) {
  if (provider === "gemini") return "Gemini";
  if (provider === "openrouter") return "OpenRouter";
  return "חישוב מקומי";
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function waitForPdfRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function scrollCardBelowFixedHeader(
  element: HTMLElement | null,
  behavior: ScrollBehavior
) {
  if (!element || typeof window === "undefined") return;

  const fixedHeader = document.querySelector<HTMLElement>(
    "header.liquid-glass-header"
  );
  const headerOffset = fixedHeader
    ? Math.max(0, Math.ceil(fixedHeader.getBoundingClientRect().bottom))
    : 0;
  const viewportGap = 12;
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  window.scrollTo({
    top: Math.max(0, elementTop - headerOffset - viewportGap),
    behavior: prefersReducedMotion ? "auto" : behavior,
  });
}

function getDiagnosticPdfFilename(generatedAt: string) {
  const date = new Date(generatedAt);
  const isoDate = Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);

  return `diagnostic-report-${isoDate}.pdf`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSalary(value: number | null) {
  if (value === null) return "לא זמין";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}
