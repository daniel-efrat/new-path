"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { useStepStore } from "@/lib/stores/stepStore";
import { useStep12Store } from "@/lib/stores/step12Store";

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

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, initialize } =
    useQuestionnaireStore();
  const { setStepCompletion, initializeSteps, ensureUser } = useStepStore();
  const ensureStep12User = useStep12Store((state) => state.ensureUser);
  const [storeReady, setStoreReady] = useState(false);
  const [showHollandResults, setShowHollandResults] = useState(false);
  const [resultsMode, setResultsMode] = useState(false);

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

  const onNext = () => {
    if (currentStep === 3) {
      if (resultsMode) {
        setShowHollandResults(true);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 13) {
      router.push("/questionnaire/diagnostic");
    } else {
      setCurrentStep(currentStep + 1);
    }
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
    <div className="container mx-auto p-4">
      <Current
        onNext={showHollandResults ? continueFromHollandResults : onNext}
        onComplete={onComplete}
        resultsMode={resultsMode}
        onBackToReport={onBackToReport}
      />
    </div>
  );
}
