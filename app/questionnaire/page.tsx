"use client";

import { useEffect, useState } from "react";
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
import Step5 from "@/components/questionnaire/steps/Step5";
import Step6 from "@/components/questionnaire/steps/Step6";
import Step7 from "@/components/questionnaire/steps/Step7";
import Step8 from "@/components/questionnaire/steps/Step8";
import Step9 from "@/components/questionnaire/steps/Step9";
import Step10 from "@/components/questionnaire/steps/Step10";
import Step11 from "@/components/questionnaire/steps/Step11";
import HollandResults from "@/components/questionnaire/steps/HollandResults";
import Step12 from "@/components/questionnaire/steps/Step12";
import Step13 from "@/components/questionnaire/steps/Step13";

const stepComponents: Record<number, any> = {
  1: Step1,
  2: Step4,
  3: Step11,
  4: Step12,
  5: Step2,
  6: Step3,
  7: Step5,
  8: Step6,
  9: Step7,
  10: Step8,
  11: Step9,
  12: Step10,
  13: Step13,
};

const gilbertStepIntros: Record<number, GilbertPopupCopy> = {
  1: {
    title: "פותחים מעבדה קטנה לעתיד",
    message:
      "שלום, אני גילברט פיינשטיין. אין פה מבחן באלגברה, רק כמה סימנים שיעזרו להבין מה מתאים לך. אני עם הלוח, אתם עם הכנות.",
  },
  3: {
    title: "רגע לפני הולנד",
    message:
      "השאלון הזה מחפש נטיות, לא תוויות. אם משהו מרגיש בערך נכון, זה כבר מידע טוב. מדע מדויק עם מקום לאינטואיציה, כמו שאני אוהב.",
  },
  5: {
    title: "עברית, אבל בלי דקדוק על הראש",
    message:
      "נכנסים לכמה שאלות זריזות. לקרוא לאט, לבחור בשקט, ולא לתת לשעון לעשות פרצופים. את זה אני עושה מספיק בשביל כולנו.",
  },
  8: {
    title: "מתמטיקה באה לביקור",
    message:
      "אם המספרים נראים דרמטיים, תזכרו שהם רק מספרים. הם לא יודעים לפתוח דלת, ואתם כן. נושמים ובוחרים.",
  },
  10: {
    title: "ידע מחשבים, לא ראיון עבודה",
    message:
      "כאן בודקים היכרות בסיסית, לא האם בניתם שרת בחניה. תשובה טובה היא תשובה שקולה, גם אם היא באה אחרי גירוד קטן בראש.",
  },
  12: {
    title: "שאלות אישיות יותר לפנינו",
    message:
      "פה אין תשובות נוצצות במיוחד. יש תשובות שלכם. גילברט מאשר לענות בכנות, גם כשזה פחות מתאים לפוסטר השראה.",
  },
  13: {
    title: "ערכים בליבה",
    message:
      "הגענו לחלק שמנסה להבין מה באמת חשוב לכם. לא צריך להישמע עמוק. לפעמים הדבר הכי מדויק הוא פשוט הדבר שהייתם בוחרים גם ביום עמוס.",
  },
};

const gilbertMidStepCopy: Record<number, GilbertPopupCopy> = {
  1: {
    title: "עצירת גילברט קצרה",
    message:
      "למתוח כתפיים, למצמץ, ולהיזכר שאתם לא טופס אקסל. כבר נאספים פה רמזים יפים.",
    cta: "חוזרים לבחור",
  },
  5: {
    title: "בדיקת דופק לשונית",
    message:
      "אם עברית התחילה להרגיש כמו חדר בריחה, הכול תקין. לקרוא שוב זה לא חולשה, זו אסטרטגיה עם משקפיים.",
    cta: "ממשיכים",
  },
  8: {
    title: "המספרים תחת שליטה",
    message:
      "גם אם שאלה אחת עיקמה גבה, לא עושים ממנה קריירה. עוברים לשאלה הבאה וממשיכים לאסוף נקודות בהדרגה.",
    cta: "יאללה לשאלה",
  },
  12: {
    title: "לא חייבים להגדיר את כל האישיות",
    message:
      "מספיק לענות מה הכי קרוב כרגע. גם לגילברט יש ימים של 'תלוי אם שתיתי קפה', וזה עדיין מידע.",
    cta: "חוזרים לשאלון",
  },
};

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
    if (completedStep === 3) {
      if (resultsMode) {
        setShowHollandResults(true);
      } else {
        setCurrentStep(4);
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
    setCurrentStep(4);
  };

  const onComplete = async () => {
    await setStepCompletion(currentStep, true);
  };

  const onBackToReport = () => {
    router.push("/questionnaire/diagnostic?saved=1");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep, showHollandResults]);

  useEffect(() => {
    if (!storeReady || showHollandResults || levelComplete) return;

    const introCopy = gilbertStepIntros[currentStep];
    if (!introCopy) return;

    const storageKey = `gilbert-intro-step-${currentStep}`;
    if (getSessionFlag(storageKey)) return;

    const timer = window.setTimeout(() => {
      setSessionFlag(storageKey);
      setGilbertPopup(introCopy);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [currentStep, levelComplete, showHollandResults, storeReady]);

  useEffect(() => {
    if (!storeReady || showHollandResults || levelComplete || gilbertPopup) {
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
    levelComplete,
    showHollandResults,
    storeReady,
  ]);

  const Current = showHollandResults
    ? HollandResults
    : stepComponents[currentStep];

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
      <div className="container mx-auto p-4">
        <Current
          onNext={showHollandResults ? continueFromHollandResults : onNext}
          onComplete={onComplete}
          resultsMode={resultsMode}
          onBackToReport={onBackToReport}
        />
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
        eyebrow={gilbertPopup?.eyebrow}
        onClose={() => setGilbertPopup(null)}
      />
    </>
  );
}
