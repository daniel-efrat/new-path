"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { useStepStore } from "@/lib/stores/stepStore";
import { useStep12Store } from "@/lib/stores/step12Store";
import { QUESTIONNAIRE_STEP_TITLES } from "@/lib/constants/questionnaire";
import GilbertPopup, {
  type GilbertPopupCopy,
} from "@/components/questionnaire/GilbertPopup";
import LevelCompleteModal from "@/components/questionnaire/LevelCompleteModal";

import Step1 from "@/components/questionnaire/steps/Step1";
import Step2 from "@/components/questionnaire/steps/Step2";
import Step3 from "@/components/questionnaire/steps/Step3";
import Step4 from "@/components/questionnaire/steps/Step4";
import Step7 from "@/components/questionnaire/steps/Step7";
import Step8 from "@/components/questionnaire/steps/Step8";
import Step9 from "@/components/questionnaire/steps/Step9";
import Step10 from "@/components/questionnaire/steps/Step10";
import Step11 from "@/components/questionnaire/steps/Step11";
import HollandResults from "@/components/questionnaire/steps/HollandResults";
import Step12 from "@/components/questionnaire/steps/Step12";
import Step13 from "@/components/questionnaire/steps/Step13";
import Step14 from "@/components/questionnaire/steps/Step14";
import Step5Combined from "@/components/questionnaire/steps/Step5Combined";

const stepComponents: Record<number, any> = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5Combined,
  6: Step7,
  7: Step8,
  8: Step9,
  9: Step10,
  10: Step11,
  11: Step12,
  12: Step13,
  13: Step14,
};

const gilbertStepIntros: Record<number, GilbertPopupCopy> = {
  1: {
    title: "פותחים מעבדה קטנה לעתיד",
    message:
      "שלום, אני פרופסור גילברט פיינשטיין. אין פה מבחן באלגברה, רק כמה סימנים שיעזרו להבין מה מתאים לך. אני עם הלוח, אתם עם הכנות.",
  },
  10: {
    title: "רגע לפני הולנד",
    message:
      "השאלון הזה מחפש נטיות, לא תוויות. אם משהו מרגיש בערך נכון, זה כבר מידע טוב. מדע מדויק עם מקום לאינטואיציה, כמו שאני אוהב.",
    secondaryCta: "מידע על שאלון הולנד",
    secondaryHref: "/aboutHolland",
  },
  11: {
    title: "נטיות לב כלליות",
    message:
      "בחרו 5 תחומי עיסוק מהרשימה. אלה יהיו התחומים שתדרגו ותעמיקו בהם בהמשך.",
    cta: "לבחירת 5 תחומים",
  },
  2: {
    title: "עברית, אבל בלי לשבור את הראש",
    message:
      "נכנסים לכמה שאלות זריזות. לקרוא לאט, לבחור בשקט, ולא לתת לשעון לעשות פרצופים. את זה אני עושה מספיק בשביל כולנו.",
  },
  5: {
    title: "מתמטיקה באה לביקור",
    message:
      `החדשות הטובות: המספרים לא שופטים אתכם.
הם פשוט יושבים שם ומחכים שתבינו מה הם רוצים.`,
  },
  7: {
    title: "ידע מחשבים, לא ראיון עבודה",
    message:
      "כאן בודקים היכרות בסיסית, לא הוכחה שבניתם מרכז נתונים במרתף. תשובה טובה היא תשובה שקולה, גם אם היא באה אחרי גירוד קטן בראש.",
  },
  9: {
    title: "שאלות אישיות יותר לפנינו",
    message:
      "פה אין תשובות נוצצות במיוחד. יש תשובות שלכם. גילברט מאשר לענות בכנות, גם כשזה פחות מתאים לפוסט בלינקד-אין.",
  },
  12: {
    title: "שלב ב׳: ערכים בליבה",
    message:
      "מכאן נכנסים לחלק עם יועץ קריירה. מתחילים בערכים האישיים, כי לפעמים הדבר הכי מדויק הוא מה שהייתם בוחרים גם ביום עמוס.",
  },
  13: {
    title: "משפטי הייעוד האישיים",
    message:
      "בשלב הזה בוחרים עם היועץ משפטים שמזקקים למה שמושך אתכם בתחומים שסימנתם. קצר, ממוקד, ומאוד שימושי לדוח.",
  },
};

const gilbertMidStepCopy: Record<number, GilbertPopupCopy> = {
  1: {
    title: "עצירת גילברט קצרה",
    message:
      "למתוח כתפיים, למצמץ, ולהיזכר שאתם לא טופס אקסל. כבר נאספים פה רמזים יפים.",
    cta: "חוזרים לבחור",
  },
  2: {
    title: "בדיקת דופק לשונית",
    message:
      "אם עברית התחילה להרגיש כמו חדר בריחה, הכול תקין. לקרוא שוב זאת לא חולשה, זאת אסטרטגיה עם משקפיים.",
    cta: "ממשיכים",
  },
  5: {
    title: "המספרים תחת שליטה",
    message:
      "גם אם שאלה אחת עיקמה גבה, לא עושים ממנה קריירה. עוברים לשאלה הבאה וממשיכים לאסוף נקודות בהדרגה.",
    cta: "יאללה לשאלה",
  },
  9: {
    title: "לא חייבים להגדיר את כל האישיות",
    message:
      "מספיק לענות מה הכי קרוב כרגע. גם לגילברט יש ימים של 'תלוי אם שתיתי קפה', וזה עדיין מידע.",
    cta: "חוזרים לשאלון",
  },
};

const BREAK_REMINDER_INTERVAL_MS = 30 * 60 * 1000;
const IDLE_BREAK_INTERVAL_MS = 5 * 60 * 1000;
const TIMED_QUESTION_STEPS = new Set([2, 3, 5, 6, 7, 8]);

const gilbertBreakReminderCopy: GilbertPopupCopy = {
  eyebrow: "גילברט מזכיר לנשום",
  title: "כבר 30 דקות ברצף",
  message:
    "עבדתם יפה ובריכוז. עכשיו כדאי לקחת הפסקה קצרה: לקום, לשתות מים, למתוח כתפיים, ולחזור עם עיניים קצת יותר טריות. השאלון יחכה כאן בסבלנות.",
  cta: "לקחתי רגע, חוזרים",
  videoSrc: "/assets/media/break.mp4",
  videoLabel: "גילברט ממליץ לקחת הפסקה קצרה",
};

type GilbertIntroPhase = "idle" | "open" | "dismissed";

function getSessionFlag(key: string) {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(key) === "1";
}

function setSessionFlag(key: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, "1");
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, initialize } =
    useQuestionnaireStore();
  const { setStepCompletion, initializeSteps, ensureUser } = useStepStore();
  const ensureStep12User = useStep12Store((state) => state.ensureUser);
  const [storeReady, setStoreReady] = useState(false);
  const [showHollandResults, setShowHollandResults] = useState(false);
  const [resultsMode, setResultsMode] = useState(false);
  const [levelComplete, setLevelComplete] = useState<{
    step: number;
    questionnaireName: string;
  } | null>(null);
  const [gilbertPopup, setGilbertPopup] = useState<GilbertPopupCopy | null>(
    null
  );
  const [introPhase, setIntroPhase] = useState<GilbertIntroPhase>("idle");
  const [pageVisible, setPageVisible] = useState(true);
  const [userRecentlyActive, setUserRecentlyActive] = useState(true);
  const [pendingBreakReminder, setPendingBreakReminder] = useState(false);
  const breakReminderRemainingRef = useRef(BREAK_REMINDER_INTERVAL_MS);
  const breakReminderStartedAtRef = useRef<number | null>(null);
  const idleBreakTimerRef = useRef<number | null>(null);
  const breakReminderResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([ensureUser(), ensureStep12User()]);
        await initializeSteps();
        await initialize();
        const params = new URLSearchParams(window.location.search);
        setResultsMode(params.get("results") === "1");
        const requestedStep = Number(params.get("step"));
        if (
          Number.isInteger(requestedStep) &&
          requestedStep >= 1 &&
          requestedStep <= 13
        ) {
          setCurrentStep(requestedStep);
        }
      } finally {
        setStoreReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advanceAfterStep = (completedStep: number) => {
    if (completedStep === 10) {
      if (resultsMode) {
        setShowHollandResults(true);
      } else {
        setCurrentStep(11);
      }
    } else if (completedStep === 13) {
      router.push("/questionnaire/diagnostic");
    } else {
      setCurrentStep(completedStep + 1);
    }
  };

  const onNext = () => {
    setLevelComplete({
      step: currentStep,
      questionnaireName:
        QUESTIONNAIRE_STEP_TITLES[currentStep] ?? `שלב ${currentStep}`,
    });
  };

  const continueAfterLevelComplete = () => {
    if (!levelComplete) return;
    const completedStep = levelComplete.step;
    setLevelComplete(null);
    advanceAfterStep(completedStep);
  };

  const continueFromHollandResults = () => {
    setShowHollandResults(false);
    setCurrentStep(11);
  };

  const onComplete = async () => {
    await setStepCompletion(currentStep, true);
  };

  const onBackToReport = () => {
    router.push("/questionnaire/diagnostic?saved=1");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setGilbertPopup(null);
    setIntroPhase("idle");
  }, [currentStep, showHollandResults]);

  useEffect(() => {
    const updatePageVisibility = () => {
      setPageVisible(document.visibilityState === "visible");
    };

    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updatePageVisibility);
    };
  }, []);

  useEffect(() => {
    if (!userRecentlyActive) {
      breakReminderRemainingRef.current = BREAK_REMINDER_INTERVAL_MS;
      breakReminderStartedAtRef.current = null;
      setPendingBreakReminder(false);
    }
  }, [userRecentlyActive]);

  useEffect(() => {
    const resetIdleBreakTimer = () => {
      if (idleBreakTimerRef.current !== null) {
        window.clearTimeout(idleBreakTimerRef.current);
      }

      setUserRecentlyActive(true);
      idleBreakTimerRef.current = window.setTimeout(() => {
        setUserRecentlyActive(false);
      }, IDLE_BREAK_INTERVAL_MS);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "keydown",
      "pointerdown",
      "pointermove",
      "scroll",
      "touchstart",
    ];

    resetIdleBreakTimer();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleBreakTimer, { passive: true });
    });

    return () => {
      if (idleBreakTimerRef.current !== null) {
        window.clearTimeout(idleBreakTimerRef.current);
      }

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleBreakTimer);
      });
    };
  }, []);

  useEffect(() => {
    if (!storeReady || resultsMode || showHollandResults || levelComplete) return;

    const introCopy = gilbertStepIntros[currentStep];
    if (!introCopy) return;
    if (introPhase !== "idle") return;

    setGilbertPopup(introCopy);
    setIntroPhase("open");
  }, [
    currentStep,
    introPhase,
    levelComplete,
    resultsMode,
    showHollandResults,
    storeReady,
  ]);

  useEffect(() => {
    if (
      !storeReady ||
      resultsMode ||
      showHollandResults ||
      levelComplete ||
      gilbertPopup
    ) {
      return;
    }

    const introCopy = gilbertStepIntros[currentStep];
    if (introCopy && introPhase !== "dismissed") {
      return;
    }

    const midCopy = gilbertMidStepCopy[currentStep];
    if (!midCopy) return;

    const storageKey = `gilbert-mid-step-${currentStep}`;
    if (getSessionFlag(storageKey)) return;

    const timer = window.setTimeout(() => {
      if (getSessionFlag(storageKey)) return;
      setSessionFlag(storageKey);
      setGilbertPopup(midCopy);
    }, 42000);

    return () => window.clearTimeout(timer);
  }, [
    currentStep,
    gilbertPopup,
    introPhase,
    levelComplete,
    resultsMode,
    showHollandResults,
    storeReady,
  ]);

  const openBreakReminder = useCallback(() => {
    if (resultsMode) return;
    setPendingBreakReminder(false);
    setGilbertPopup(gilbertBreakReminderCopy);
  }, [resultsMode]);

  const waitForBreakReminderIfDue = useCallback(() => {
    if (!pendingBreakReminder || gilbertPopup) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      breakReminderResolverRef.current = resolve;
      openBreakReminder();
    });
  }, [gilbertPopup, openBreakReminder, pendingBreakReminder]);

  const shouldRunBreakReminderTimer =
    storeReady &&
    pageVisible &&
    !resultsMode &&
    userRecentlyActive &&
    !pendingBreakReminder &&
    !showHollandResults &&
    !levelComplete &&
    !gilbertPopup;

  useEffect(() => {
    if (!shouldRunBreakReminderTimer) {
      return;
    }

    breakReminderStartedAtRef.current = Date.now();

    const timer = window.setTimeout(() => {
      breakReminderStartedAtRef.current = null;
      breakReminderRemainingRef.current = BREAK_REMINDER_INTERVAL_MS;
      if (TIMED_QUESTION_STEPS.has(currentStep)) {
        setPendingBreakReminder(true);
      } else {
        openBreakReminder();
      }
    }, breakReminderRemainingRef.current);

    return () => {
      window.clearTimeout(timer);

      if (breakReminderStartedAtRef.current === null) {
        return;
      }

      const elapsed = Date.now() - breakReminderStartedAtRef.current;
      breakReminderRemainingRef.current = Math.max(
        0,
        breakReminderRemainingRef.current - elapsed
      );
      breakReminderStartedAtRef.current = null;
    };
  }, [currentStep, openBreakReminder, shouldRunBreakReminderTimer]);

  const pauseQuestionTimer = gilbertPopup === gilbertBreakReminderCopy;

  const Current = showHollandResults
    ? HollandResults
    : stepComponents[currentStep];
  const shouldBlockForGilbertIntro =
    storeReady &&
    !showHollandResults &&
    !levelComplete &&
    Boolean(gilbertStepIntros[currentStep]) &&
    !resultsMode &&
    introPhase !== "dismissed";

  if (!storeReady) {
    return (
      <div className="container mx-auto p-6">
        <p>טוען שאלון...</p>
      </div>
    );
  }

  if (!Current) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">שאלון</h1>
        <p className="mb-4">השלב {currentStep} אינו נתמך עדיין.</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => router.push("/dashboard")}
        >
          חזרה ללוח הבקרה
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 md:pb-32">
        {shouldBlockForGilbertIntro ? (
          <div className="flex min-h-[360px] items-center justify-center text-center text-muted-foreground">
            מתכוננים לשלב הבא...
          </div>
        ) : (
          <Current
            onNext={showHollandResults ? continueFromHollandResults : onNext}
            onComplete={onComplete}
            resultsMode={resultsMode}
            onBackToReport={onBackToReport}
            waitForBreakReminderIfDue={waitForBreakReminderIfDue}
            pauseQuestionTimer={pauseQuestionTimer}
          />
        )}
      </div>
      <LevelCompleteModal
        isOpen={levelComplete !== null}
        questionnaireName={levelComplete?.questionnaireName ?? ""}
        onContinue={continueAfterLevelComplete}
      />
      <GilbertPopup
        isOpen={gilbertPopup !== null}
        title={gilbertPopup?.title ?? ""}
        message={gilbertPopup?.message ?? ""}
        cta={gilbertPopup?.cta}
        secondaryCta={gilbertPopup?.secondaryCta}
        secondaryHref={gilbertPopup?.secondaryHref}
        eyebrow={gilbertPopup?.eyebrow}
        videoSrc={gilbertPopup?.videoSrc}
        videoLabel={gilbertPopup?.videoLabel}
        onClose={() => {
          const shouldDismissIntro = gilbertPopup === gilbertStepIntros[currentStep];
          setGilbertPopup(null);
          if (shouldDismissIntro) {
            setIntroPhase("dismissed");
          }
          breakReminderResolverRef.current?.();
          breakReminderResolverRef.current = null;
        }}
      />
    </>
  );
}
