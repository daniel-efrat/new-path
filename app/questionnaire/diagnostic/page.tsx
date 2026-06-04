"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Ref,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Brain,
  ChartNoAxesCombined,
  ChevronDown,
  FileDown,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BubbleTraitCloud } from "@/components/charts/BubbleTraitCloud";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
const FINAL_RECOMMENDATION =
  "לסיום, מומלץ לפנות ליועצי הקריירה של \"דרך חדשה\" כדי לעבור יחד על התוצאות, או להמשיך להתייעץ באופן עצמאי עם ה-AI הפרטי שלך.";

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

const ACCENT_GRADIENTS = [
  "from-emerald-400 via-teal-400 to-cyan-400",
  "from-violet-500 via-fuchsia-500 to-pink-400",
  "from-sky-400 via-cyan-400 to-emerald-400",
  "from-rose-400 via-orange-300 to-amber-300",
  "from-indigo-500 via-violet-500 to-teal-400",
  "from-lime-400 via-emerald-400 to-teal-500",
];

const OCCUPATION_TABS = [
  { id: "skillGap", label: "פערי מיומנויות" },
  { id: "education", label: "דרישות לימודים" },
  { id: "salary", label: "נתוני שכר" },
] as const;

type OccupationTab = (typeof OCCUPATION_TABS)[number]["id"];

const SCROLL_TRIGGER_MARGIN = "0px 0px -20% 0px";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.04,
    },
  },
};

const softItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: "easeOut" },
  },
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
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const hasPdfResultSheets = resultSheets.length > 0;
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
    <div className="min-h-screen px-4 py-8 text-slate-950 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.header
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <motion.div variants={staggerContainerVariants} className="space-y-3">
            <motion.div variants={staggerContainerVariants} className="flex flex-wrap items-center gap-2">
              <motion.div variants={softItemVariants}>
                <Badge variant="secondary" className="border-teal-100 bg-teal-50 text-teal-700">
                  שלב ב׳
                </Badge>
              </motion.div>
              {data?.cached ? (
                <motion.div variants={softItemVariants}>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    נשמר עבורך
                  </Badge>
                </motion.div>
              ) : null}
              {data ? (
                <motion.div variants={softItemVariants}>
                  <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                    {providerLabel(data.provider)}
                  </Badge>
                </motion.div>
              ) : null}
              {data?.tokenUsage ? (
                <motion.div variants={softItemVariants}>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                    קלט {formatTokenCount(data.tokenUsage.queryTokens)} · פלט{" "}
                    {formatTokenCount(data.tokenUsage.answerTokens)} טוקנים
                  </Badge>
                </motion.div>
              ) : null}
            </motion.div>
            <motion.div variants={staggerContainerVariants}>
              <motion.h1
                variants={softItemVariants}
                className="text-4xl font-extrabold tracking-normal text-white drop-shadow-[0_2px_10px_rgba(3,7,18,0.45)] sm:text-5xl"
              >
                {data?.report.title || "דו״ח אבחוני תעסוקתי"}
              </motion.h1>
              <motion.p
                variants={softItemVariants}
                className="mt-3 max-w-3xl text-lg leading-8 text-white/90 drop-shadow-[0_1px_6px_rgba(3,7,18,0.35)]"
              >
                {data?.report.disclaimer ||
                  "ניתוח משולב של שלב א׳, מבחני היכולת, האישיות וערכי הליבה."}
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainerVariants} className="flex flex-col items-start gap-2 sm:items-end">
            <motion.div variants={staggerContainerVariants} className="flex flex-wrap gap-2">
              <motion.div variants={softItemVariants}>
                <Button
                variant="outline"
                className="border-slate-500 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-70"
                onClick={handleDownloadPdf}
                disabled={
                  !data ||
                  showLoadingState ||
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
              </motion.div>
              {isDev ? (
                <motion.div variants={softItemVariants}>
                  <Button
                  variant="outline"
                  className="border-slate-500 bg-white text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-70"
                  onClick={() => setIsLoadingPreview(true)}
                  disabled={showLoadingState}
                >
                  <Loader2 className="size-4" />
                  הצג טעינה
                </Button>
                </motion.div>
              ) : null}
              <motion.div variants={softItemVariants}>
                <Button
                variant="outline"
                className="border-slate-500 bg-white text-slate-900 shadow-sm hover:bg-slate-50"
                onClick={() => router.push("/dashboard")}
              >
                חזרה ללוח הבקרה
              </Button>
              </motion.div>
            </motion.div>
            {pdfError ? (
              <motion.p
                variants={softItemVariants}
                className="text-sm font-semibold leading-6 text-rose-100 drop-shadow-[0_1px_4px_rgba(127,29,29,0.8)]"
              >
                {pdfError}
              </motion.p>
            ) : null}
          </motion.div>
        </motion.header>

        <AnimatePresence mode="wait">
          {showLoadingState ? (
            <LoadingState
              key="diagnostic-loading"
              isPreview={isLoadingPreview}
              onClosePreview={() => setIsLoadingPreview(false)}
            />
          ) : null}
        </AnimatePresence>
        {!showLoadingState && error ? (
          <ErrorState error={error} onRetry={loadReport} />
        ) : null}
        {!showLoadingState && !error && data ? (
          <DiagnosticReportView data={data} />
        ) : null}
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

function LoadingState({
  isPreview = false,
  onClosePreview,
}: {
  isPreview?: boolean;
  onClosePreview?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-6 text-center sm:p-8">
        <motion.div
          className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-transparent"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="absolute left-1/2 top-1/2 h-[116%] w-[102.5%] -translate-x-1/2 -translate-y-1/2 object-contain"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0 13.5%, transparent 13.5% 15%, #000 15% 84.8%, transparent 84.8% 86.3%, #000 86.3% 100%)",
              maskImage:
                "linear-gradient(to bottom, #000 0 13.5%, transparent 13.5% 15%, #000 15% 84.8%, transparent 84.8% 86.3%, #000 86.3% 100%)",
            }}
            src="/working3.webm"
            autoPlay
            loop
            muted
            playsInline
            aria-label="גילברט עובד על הכנת הדוח האבחוני"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.34 }}
        >
          <h2 className="text-xl font-semibold">מרכיבים את הדו״ח האבחוני</h2>
          <p className="mt-2 text-sm text-slate-600">
            גילברט עובד על זה עכשיו. משלבים את שלב א׳, מבחני היכולת, האישיות וערכי הליבה.
          </p>
        </motion.div>
        {isPreview ? (
          <Button
            type="button"
            variant="outline"
            className="border-slate-500 bg-white text-slate-900 hover:bg-slate-50"
            onClick={onClosePreview}
          >
            חזרה לדוח
          </Button>
        ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
    >
      {children}
    </motion.div>
  );
}

function useScrollTriggeredAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setShouldAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldAnimate(true);
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: SCROLL_TRIGGER_MARGIN,
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, shouldAnimate };
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-rose-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">לא הצלחנו ליצור דו״ח אבחוני</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
        </div>
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-slate-500 bg-white text-slate-900"
        >
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
  const [showAllOccupations, setShowAllOccupations] = useState(false);
  const firstRevealedOccupationRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToRevealedOccupationsRef = useRef(false);
  const visibleOccupations = showAllOccupations
    ? report.topOccupations
    : report.topOccupations.slice(0, 4);
  const hiddenOccupationCount = Math.max(0, report.topOccupations.length - 4);

  useEffect(() => {
    if (!showAllOccupations || !shouldScrollToRevealedOccupationsRef.current) {
      return;
    }

    shouldScrollToRevealedOccupationsRef.current = false;
    requestAnimationFrame(() => {
      firstRevealedOccupationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showAllOccupations]);

  return (
    <StaggerGroup className="grid gap-6">
      <Reveal>
        <Card className="border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="grid gap-5 p-5 sm:p-6">
          <SectionTitle icon={<Sparkles className="size-5" />} title="תקציר אבחוני" />
          <motion.p
            variants={softItemVariants}
            className="max-w-5xl whitespace-pre-line text-lg leading-8 text-slate-600"
          >
            {report.summary}
          </motion.p>
          {report.questionnaire1.topRiasec.length > 0 ? (
            <motion.div variants={staggerContainerVariants} className="flex flex-wrap gap-2">
              {report.questionnaire1.topRiasec.map((area) => (
                <motion.div key={area.code} variants={softItemVariants}>
                  <Badge
                  key={area.code}
                  className="border-teal-100 bg-gradient-to-l from-teal-500 to-emerald-400 text-white shadow-sm"
                >
                  {area.name} {area.score}/100
                </Badge>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
          </CardContent>
        </Card>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AbilityScoresPanel
          icon={<BarChart3 className="size-5" />}
          title="ציוני יכולת"
          scores={report.abilityScores}
          getResultHref={(score) => {
            const step = ABILITY_STEP_BY_LABEL[score.label];
            return step ? `/questionnaire?step=${step}&results=1` : null;
          }}
        />
        <PersonalityProfilePanel
          icon={<Brain className="size-5" />}
          title="פרופיל אישיות"
          scores={report.personalityScores}
        />
      </div>

      <Reveal>
        <Card className="border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <SectionTitle icon={<Target className="size-5" />} title="חוזקות ומוקדי בדיקה" />
            <InsightCloud title="חוזקות בולטות" items={report.profileInsights.strengths} />
            <InsightCloud title="מוקדי התפתחות" items={report.profileInsights.developmentAreas} muted />
          </div>
          <motion.div
            variants={softItemVariants}
            className="rounded-lg border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5"
          >
            <h3 className="font-bold text-slate-950">סגנון עבודה משוער</h3>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {report.profileInsights.workStyle}
            </p>
          </motion.div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <section className="grid gap-4">
        <motion.div variants={softItemVariants} className="flex items-center justify-between gap-3">
          <SectionTitle
            icon={<BriefcaseBusiness className="size-5" />}
            title="מקצועות שמתאימים לך"
            tone="light"
          />
        </motion.div>
        <StaggerGroup className="grid gap-3">
          <AnimatePresence initial={false}>
          {visibleOccupations.map((occupation, index) => (
            <OccupationDisclosure
              key={occupation.id}
              occupation={occupation}
              isOpen={openOccupationId === occupation.id}
              containerRef={
                index === 4 ? firstRevealedOccupationRef : undefined
              }
              onToggle={() =>
                setOpenOccupationId((current) =>
                  current === occupation.id ? null : occupation.id
                )
              }
            />
          ))}
          </AnimatePresence>
        </StaggerGroup>
        {hiddenOccupationCount > 0 ? (
          <motion.div variants={softItemVariants} className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setShowAllOccupations((current) => {
                  const next = !current;
                  shouldScrollToRevealedOccupationsRef.current = next;
                  return next;
                })
              }
              className="border-teal-700 bg-white text-teal-800 shadow-sm hover:bg-teal-50"
            >
              {showAllOccupations
                ? "הצג פחות"
                : `הצג עוד ${hiddenOccupationCount} מקצועות`}
            </Button>
          </motion.div>
        ) : null}
        </section>
      </Reveal>

      <Reveal>
        <Card className="border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <CardContent className="space-y-4 p-5 sm:p-6">
          <SectionTitle title="צעדים מומלצים להמשך" />
          <motion.ul variants={staggerContainerVariants} className="grid gap-3 sm:grid-cols-3">
            {report.nextSteps
              .filter((step) => step.trim() !== FINAL_RECOMMENDATION)
              .map((step) => (
              <motion.li
                key={step}
                variants={softItemVariants}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"
              >
                {step}
              </motion.li>
            ))}
          </motion.ul>
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-7 text-teal-950">
            {FINAL_RECOMMENDATION}
          </div>
          </CardContent>
        </Card>
      </Reveal>
    </StaggerGroup>
  );
}

function AbilityScoresPanel({
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
    <Reveal>
      <Card className="relative overflow-hidden border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-0 h-1 w-full origin-right bg-gradient-to-l from-emerald-400 via-teal-400 to-violet-500"
        />
        <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle icon={icon} title={title} />
          <motion.div variants={softItemVariants}>
            <Button
            type="button"
            variant="outline"
            className="border-sky-700 bg-sky-50 text-sky-900 shadow-sm hover:bg-sky-100"
          >
            <ChartNoAxesCombined className="size-4" />
            השוואה
          </Button>
          </motion.div>
        </div>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {scores.map((score, index) => {
            const href = getResultHref?.(score) || null;
            const gradient = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];

            return (
              <AnimatedAbilityScoreItem
                key={score.label}
                score={score}
                href={href}
                gradient={gradient}
              />
            );
          })}
        </StaggerGroup>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function AnimatedAbilityScoreItem({
  score,
  href,
  gradient,
}: {
  score: ScoreSummary;
  href: string | null;
  gradient: string;
}) {
  const { ref, shouldAnimate } = useScrollTriggeredAnimation();
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-slate-950">{score.label}</span>
        <motion.span
          variants={softItemVariants}
          className="text-sm font-semibold tabular-nums text-slate-700"
        >
          {score.score}/100
        </motion.span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={cn(
            "h-full rounded-full bg-gradient-to-l shadow-[0_0_18px_rgba(20,184,166,0.28)]",
            gradient
          )}
          initial={{ width: 0 }}
          animate={{ width: shouldAnimate ? `${score.score}%` : 0 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          className="absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-white bg-slate-950 shadow-md"
          initial={{ opacity: 0, right: "-0.625rem" }}
          animate={{
            opacity: shouldAnimate ? 1 : 0,
            right: shouldAnimate ? `calc(${score.score}% - 0.625rem)` : "-0.625rem",
          }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <motion.p variants={softItemVariants} className="text-xs text-slate-700">
        {score.answered}/{score.total} תשובות
      </motion.p>
    </>
  );

  return href ? (
    <motion.div ref={ref} variants={softItemVariants}>
      <Link
        href={href}
        className="block w-full cursor-pointer space-y-3 rounded-lg border border-slate-500 bg-slate-50 p-4 text-right transition hover:-translate-y-0.5 hover:border-teal-700 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        aria-label={`פתח תוצאות ${score.label}`}
      >
        {content}
      </Link>
    </motion.div>
  ) : (
    <motion.div
      ref={ref}
      variants={softItemVariants}
      className="space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4"
    >
      {content}
    </motion.div>
  );
}

function PersonalityProfilePanel({
  icon,
  title,
  scores,
}: {
  icon: ReactNode;
  title: string;
  scores: ScoreSummary[];
}) {
  const traitCloudData = scores.map((score) => ({
    label: score.label,
    value: score.score,
  }));
  const { ref: cloudRef } = useScrollTriggeredAnimation();

  return (
    <Reveal>
      <Card className="relative overflow-hidden border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-0 h-1 w-full origin-right bg-gradient-to-l from-violet-500 via-fuchsia-500 to-teal-400"
        />
        <CardContent className="space-y-6 p-5 sm:p-6">
        <SectionTitle icon={icon} title={title} />
        <motion.div
          ref={cloudRef}
          variants={softItemVariants}
          className="grid min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-teal-50/50 shadow-inner lg:grid-cols-[0.95fr_1.05fr] lg:divide-x lg:divide-x-reverse lg:divide-slate-200"
        >
          <div className="border-b border-slate-200 p-4 lg:h-full lg:border-b-0">
            <BubbleTraitCloud
              traits={traitCloudData}
              ariaLabel={`${title}: ענן תכונות לפי ציוני המשתמש`}
              className="h-72 rounded-none border-0 bg-transparent p-0 shadow-none lg:h-full"
            />
          </div>
          <div className="p-4 lg:h-full">
            <TraitScoreBars
              traits={traitCloudData}
              ariaLabel={`${title}: תרשים עמודות אופקי לפי ציוני המשתמש`}
              className="flex h-full flex-col justify-center rounded-none border-0 bg-transparent p-0 shadow-none"
            />
          </div>
        </motion.div>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {scores.slice(0, 4).map((score, index) => (
            <GaugeMeter key={score.label} score={score} index={index} />
          ))}
        </StaggerGroup>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function TraitScoreBars({
  traits,
  ariaLabel,
  className,
}: {
  traits: Array<{ label: string; value: number }>;
  ariaLabel: string;
  className?: string;
}) {
  const sortedTraits = [...traits].sort((a, b) => b.value - a.value);

  if (sortedTraits.length === 0) {
    return (
      <div className="grid h-[clamp(14rem,28vw,24rem)] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-600">
        אין עדיין נתוני תכונות להצגה.
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-inner",
        className
      )}
      dir="rtl"
    >
      <div className="grid gap-2.5">
        {sortedTraits.map((trait, index) => {
          const value = Math.max(0, Math.min(100, trait.value));
          const colorClass =
            index < 2
              ? "from-teal-400 to-sky-400"
              : index < 4
                ? "from-violet-400 to-fuchsia-400"
                : "from-slate-300 to-slate-400";

          return (
            <div
              key={trait.label}
              className="grid gap-1.5 rounded-md px-2 py-1.5"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-lg font-semibold leading-7 text-slate-800">
                <span className="min-w-0 whitespace-normal break-words text-right">
                  {trait.label}
                </span>
                <span className="shrink-0 text-slate-600" dir="ltr">
                  {Math.round(value)}/100
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-slate-100 shadow-inner"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-l shadow-sm transition-[width]",
                    colorClass
                  )}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GaugeMeter({ score, index }: { score: ScoreSummary; index: number }) {
  const rotation = -90 + score.score * 1.8;
  const { ref, shouldAnimate } = useScrollTriggeredAnimation();

  return (
    <motion.div
      ref={ref}
      variants={softItemVariants}
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-slate-950">{score.label}</h3>
        <span className="text-sm font-semibold tabular-nums text-slate-700">
          {score.score}/100
        </span>
      </div>
      <div className="relative mx-auto mt-4 h-24 w-40 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-20 rounded-t-full border-[14px] border-b-0 border-slate-200" />
        <motion.div
          className={cn(
            "absolute inset-x-0 bottom-0 h-20 rounded-t-full border-[14px] border-b-0 border-transparent bg-clip-border",
            index % 2 === 0 ? "border-t-teal-400 border-l-violet-400" : "border-t-emerald-400 border-l-pink-400"
          )}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{
            clipPath: shouldAnimate
              ? `inset(0 ${100 - score.score}% 0 0)`
              : "inset(0 100% 0 0)",
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute bottom-2 left-1/2 z-10 h-16 w-1 origin-bottom -translate-x-1/2 rounded-full bg-slate-900 shadow-lg"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: shouldAnimate ? rotation : -90, opacity: shouldAnimate ? 1 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute bottom-0 left-1/2 z-20 size-4 -translate-x-1/2 rounded-full border-2 border-white bg-slate-900" />
      </div>
    </motion.div>
  );
}

function OccupationDisclosure({
  occupation,
  isOpen,
  containerRef,
  onToggle,
}: {
  occupation: DiagnosticOccupation;
  isOpen: boolean;
  containerRef?: Ref<HTMLDivElement>;
  onToggle: () => void;
}) {
  const [activeTab, setActiveTab] = useState<OccupationTab>("skillGap");

  return (
    <motion.div
      ref={containerRef}
      variants={softItemVariants}
      initial="hidden"
      animate="visible"
    >
      <Card
        className="overflow-hidden border-slate-200 bg-white text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full flex-col gap-4 bg-gradient-to-l from-white to-slate-50 p-5 text-right transition-colors hover:from-teal-50 hover:to-white sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700">
            <BriefcaseBusiness className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-extrabold tracking-normal text-slate-950">
                {occupation.title}
              </h3>
              <Badge className="bg-emerald-500 text-white shadow-sm">
                {occupation.matchPercent}% התאמה
              </Badge>
            </div>
            <p className="mt-2 max-w-4xl text-base leading-7 text-slate-600">
              {occupation.shortWhy}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-slate-700 transition-transform duration-300 ease-out",
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
            className="overflow-hidden"
          >
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="border-t border-slate-100 px-5 pb-5 pt-5"
            >
              <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <motion.div variants={staggerContainerVariants} className="space-y-5">
                  <motion.div variants={softItemVariants}>
                    <h4 className="font-bold text-slate-950">
                      תיאור המקצוע
                    </h4>
                    <p className="mt-2 text-base leading-7 text-slate-600">
                      {occupation.description}
                    </p>
                  </motion.div>
                  <TextList title="נימוקי התאמה" items={occupation.fitReasons} />
                  <TextList
                    title="מה כדאי לבדוק"
                    items={occupation.possibleTensions}
                  />
                  <OccupationTabs
                    occupation={occupation}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </motion.div>

                <motion.div variants={staggerContainerVariants} className="space-y-4">
                  <DetailBox
                    icon={<GraduationCap className="size-5" />}
                    title="הכשרה נדרשת"
                  >
                    <ul className="space-y-2 text-sm leading-6 text-slate-600">
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
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="text-sm font-bold text-slate-950">
                            {place.name}
                          </div>
                          <div className="text-xs text-slate-700">
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
                      <div className="text-3xl font-extrabold text-slate-950">
                        {formatSalary(occupation.averageSalary.monthlyGross)}
                      </div>
                      <p className="text-xs leading-5 text-slate-700">
                        {formatSalaryDetails(occupation.averageSalary)}
                      </p>
                    </div>
                  </DetailBox>

                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function OccupationTabs({
  occupation,
  activeTab,
  onTabChange,
}: {
  occupation: DiagnosticOccupation;
  activeTab: OccupationTab;
  onTabChange: (tab: OccupationTab) => void;
}) {
  return (
    <motion.div
      variants={softItemVariants}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <motion.div variants={staggerContainerVariants} className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {OCCUPATION_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            variants={softItemVariants}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-bold transition",
              activeTab === tab.id
                ? "border-slate-950 bg-slate-950 text-white shadow-md"
                : "border-slate-500 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === "skillGap" ? (
              <SkillGapTab occupation={occupation} />
            ) : null}
            {activeTab === "education" ? (
              <EducationTab occupation={occupation} />
            ) : null}
            {activeTab === "salary" ? (
              <SalaryTab occupation={occupation} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SkillGapTab({ occupation }: { occupation: DiagnosticOccupation }) {
  const entries = Object.entries(occupation.scoreBreakdown) as Array<
    [keyof DiagnosticOccupation["scoreBreakdown"], number]
  >;

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {entries.map(([key, value], index) => (
        <SkillGapScore
          key={key}
          label={OCCUPATION_SCORE_LABELS[key]}
          value={value}
          gradient={ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length]}
        />
      ))}
    </motion.div>
  );
}

function SkillGapScore({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
}) {
  const { ref, shouldAnimate } = useScrollTriggeredAnimation();

  return (
    <motion.div
      ref={ref}
      variants={softItemVariants}
      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-slate-900">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-700">
          {value}/100
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-l", gradient)}
          initial={{ width: 0 }}
          animate={{ width: shouldAnimate ? `${value}%` : 0 }}
          transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

function EducationTab({ occupation }: { occupation: DiagnosticOccupation }) {
  const pathItems = occupation.requiredTraining.slice(0, 4);

  return (
    <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
        className="space-y-3"
      >
        {pathItems.map((item, index) => (
          <motion.div key={item} variants={softItemVariants} className="flex gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-violet-500 text-sm font-extrabold text-white"
              >
                {index + 1}
              </motion.div>
              {index < pathItems.length - 1 ? (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full min-h-8 w-px origin-top bg-slate-200"
                />
              ) : null}
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
              {item}
            </div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
        className="grid grid-cols-2 gap-2"
      >
        {occupation.trainingPlaces.slice(0, 4).map((place, index) => (
          <motion.div
            key={`${place.name}-${place.type}-matrix`}
            variants={softItemVariants}
            className={cn(
              "rounded-lg border p-3",
              index % 2 === 0
                ? "border-teal-100 bg-teal-50 text-teal-800"
                : "border-violet-100 bg-violet-50 text-violet-800"
            )}
          >
            <div className="text-sm font-extrabold">{place.name}</div>
            <div className="mt-1 text-xs opacity-75">{place.type}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function SalaryTab({ occupation }: { occupation: DiagnosticOccupation }) {
  const base = occupation.averageSalary.monthlyGross || 12000;
  const salaryData = [
    { level: "כניסה", salary: Math.round(base * 0.72) },
    { level: "שנה 2", salary: Math.round(base * 0.9) },
    { level: "מנוסה", salary: base },
    { level: "בכיר", salary: Math.round(base * 1.18) },
  ];
  const { ref: salaryRef, shouldAnimate: shouldAnimateSalary } =
    useScrollTriggeredAnimation();

  return (
    <motion.div
      ref={salaryRef}
      variants={softItemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
      className="h-56 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          key={shouldAnimateSalary ? `salary-${occupation.id}-active` : `salary-${occupation.id}-idle`}
          data={salaryData}
          margin={{ left: 0, right: 0, top: 12, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`salary-${occupation.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.44} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <XAxis dataKey="level" tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 12 }} width={42} />
          <Tooltip
            formatter={(value) => formatSalary(Number(value))}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              direction: "rtl",
            }}
          />
          <Area
            type="monotone"
            dataKey="salary"
            stroke="#14b8a6"
            strokeWidth={3}
            fill={`url(#salary-${occupation.id})`}
            isAnimationActive={shouldAnimateSalary}
            animationBegin={0}
            animationDuration={950}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
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
    <motion.div
      variants={softItemVariants}
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-center gap-2 font-bold text-slate-950">
        {icon}
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </motion.div>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div variants={softItemVariants}>
      <h4 className="font-bold text-slate-950">{title}</h4>
      <motion.ul variants={staggerContainerVariants} className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <motion.li
            key={item}
            variants={softItemVariants}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

function InsightCloud({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <motion.div
      variants={softItemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
    >
      <motion.h3 variants={softItemVariants} className="font-bold text-slate-950">
        {title}
      </motion.h3>
      <motion.ul variants={staggerContainerVariants} className="mt-3 flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <motion.li
            key={item}
            variants={softItemVariants}
            className={cn(
              "rounded-full border px-3 py-2 text-lg font-semibold leading-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              muted
                ? "border-slate-500 bg-slate-50 text-slate-800"
                : "border-teal-100 bg-gradient-to-l from-white to-teal-50 text-teal-700",
              index === 0 && !muted && "px-5 py-3",
              index > 3 && "opacity-80"
            )}
          >
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

function SectionTitle({
  icon,
  title,
  tone = "dark",
}: {
  icon?: ReactNode;
  title: string;
  tone?: "dark" | "light";
}) {
  const isLight = tone === "light";

  return (
    <motion.div
      variants={softItemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
      className={cn(
        "flex items-center gap-3",
        isLight
          ? "text-white drop-shadow-[0_2px_8px_rgba(3,7,18,0.55)]"
          : "text-slate-950"
      )}
    >
      {icon ? (
        <motion.div
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.01, margin: SCROLL_TRIGGER_MARGIN }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            isLight
              ? "border border-white/80 bg-white/15 text-white backdrop-blur"
              : "bg-gradient-to-br from-teal-100 to-violet-100 text-teal-700"
          )}
        >
          {icon}
        </motion.div>
      ) : null}
      <motion.h2 variants={softItemVariants} className="text-2xl font-extrabold tracking-normal">
        {title}
      </motion.h2>
    </motion.div>
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

        <PdfSection title="תוצאות שלב א׳">
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
          <PdfTextList
            items={report.nextSteps.filter(
              (step) => step.trim() !== FINAL_RECOMMENDATION
            )}
          />
          <p className="mt-4 rounded-md border border-[#99f6e4] bg-[#f0fdfa] p-4 text-sm leading-7 text-[#134e4a]">
            {FINAL_RECOMMENDATION}
          </p>
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
            {formatSalaryDetails(occupation.averageSalary)}
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
  const labels: Record<DiagnosticApiResponse["provider"], string> = {
    openai: "GPT",
    openrouter: "OpenRouter",
    gemini: "Gemini",
    deterministic: "חישוב מקומי",
  };
  return labels[provider] || "חישוב מקומי";
}

function formatTokenCount(value: number) {
  return new Intl.NumberFormat("he-IL").format(value);
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

function formatSalaryDetails(
  salary: DiagnosticOccupation["averageSalary"]
) {
  const source = salary.source.replace(/^.*?,\s*/, "").trim();
  const note = salary.note
    ?.replace(/^מוצג קישור להרחבה.*?;\s*/, "")
    .trim();
  const parts = [
    source,
    salary.sourceYear ? String(salary.sourceYear) : "",
    note,
  ].filter(Boolean);

  return parts.join(" · ");
}
