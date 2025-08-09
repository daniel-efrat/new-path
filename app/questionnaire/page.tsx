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
};

export default function QuestionnairePage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, validateCurrentStep, initialize } =
    useQuestionnaireStore();
  const { setStepCompletion, initializeSteps } = useStepStore();

  useEffect(() => {
    // Ensure stores are initialized
    initialize();
    initializeSteps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const onComplete = async () => {
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
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push("/dashboard")}
        >
          חזרה ללוח הבקרה
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Current onPrevious={onPrevious} onNext={onNext} onComplete={onComplete} />
    </div>
  );
}

