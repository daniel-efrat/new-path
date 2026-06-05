"use client";

import { useState } from "react";

import Step5 from "@/components/questionnaire/steps/Step5";
import Step6 from "@/components/questionnaire/steps/Step6";

interface Step5CombinedProps {
  onNext?: () => void;
  onComplete: () => Promise<void>;
  resultsMode?: boolean;
  onBackToReport?: () => void;
  waitForBreakReminderIfDue?: () => Promise<void>;
  pauseQuestionTimer?: boolean;
}

export default function Step5Combined({
  onNext,
  onComplete,
  resultsMode = false,
  onBackToReport,
  waitForBreakReminderIfDue,
  pauseQuestionTimer = false,
}: Step5CombinedProps) {
  const [part, setPart] = useState<"logic" | "math">("logic");

  if (part === "logic") {
    return (
      <Step5
        onComplete={async () => {}}
        onNext={() => setPart("math")}
        resultsMode={resultsMode}
        onBackToReport={onBackToReport}
        waitForBreakReminderIfDue={waitForBreakReminderIfDue}
        pauseQuestionTimer={pauseQuestionTimer}
      />
    );
  }

  return (
    <Step6
      onComplete={onComplete}
      onNext={onNext}
      resultsMode={resultsMode}
      onBackToReport={onBackToReport}
      waitForBreakReminderIfDue={waitForBreakReminderIfDue}
      pauseQuestionTimer={pauseQuestionTimer}
    />
  );
}
