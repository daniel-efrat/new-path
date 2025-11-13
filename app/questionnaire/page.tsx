"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { useStepStore } from "@/lib/stores/stepStore";

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

const stepComponents: Record<number, any> = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
  6: Step6,
  7: Step7,
  8: Step8,
  9: Step9,
  10: Step10,
  11: Step11,
  12: HollandResults,
};

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, validateCurrentStep, initialize } =
    useQuestionnaireStore();
  const { setStepCompletion, initializeSteps, ensureUser } = useStepStore();

  useEffect(() => {
    // Ensure stores are initialized and bound to the current user so progress persists
    (async () => {
      try {
        await ensureUser();
      } finally {
        initializeSteps();
        initialize();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPrevious = () => {
    if (currentStep === 11) {
      // Temporarily skip step 10 and 9 when going back from 11
      setCurrentStep(8);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onNext = () => {
    // Temporarily hide steps 9 and 10: jump from 8 directly to 11
    if (currentStep === 8) {
      setCurrentStep(11);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const onComplete = async () => {
    // For step 8, mark as completed unconditionally to ensure Step 11 unlocks,
    // since validation may miss answers loaded only into local component state.
    if (currentStep === 8) {
      setStepCompletion(8, true);
      return;
    }
    const validation = validateCurrentStep();
    setStepCompletion(currentStep, validation.isValid);
  };

  const Current = stepComponents[currentStep];

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
    <div className="container mx-auto bg-tech p-4">
      <Current
        onPrevious={onPrevious}
        onNext={onNext}
        onComplete={onComplete}
      />
    </div>
  );
}
