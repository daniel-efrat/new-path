import { useEffect } from "react";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { QUESTIONNAIRE_CONFIG } from "@/lib/constants/questionnaire";

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export function useQuestionnaireAnalytics() {
  const { answers, currentStep } = useQuestionnaireStore();

  // Track step changes
  useEffect(() => {
    trackEvent({
      category: "Questionnaire",
      action: "Step Change",
      label: `Step ${currentStep}`,
      value: currentStep,
    });
  }, [currentStep]);

  // Track trait selections
  useEffect(() => {
    const traitsCount = answers.traits?.length ?? 0;
    if (traitsCount > 0) {
      trackEvent({
        category: "Questionnaire",
        action: "Traits Selected",
        label: `${traitsCount}/${QUESTIONNAIRE_CONFIG.MAX_TRAITS} traits`,
        value: traitsCount,
      });
    }
  }, [answers.traits]);

  // Track anchor responses
  useEffect(() => {
    const anchorsCompleted = answers.anchors?.filter(Boolean).length ?? 0;
    if (anchorsCompleted > 0) {
      trackEvent({
        category: "Questionnaire",
        action: "Anchors Completed",
        label: `${anchorsCompleted}/${QUESTIONNAIRE_CONFIG.TOTAL_ANCHORS} anchors`,
        value: anchorsCompleted,
      });
    }
  }, [answers.anchors]);

  // Helper functions
  const trackEvent = (event: AnalyticsEvent) => {
    try {
      // For development, just log to console
      if (process.env.NODE_ENV === "development") {
        console.log("Analytics Event:", event);
        return;
      }

      // In production, you would send this to your analytics service
      // Example: mixpanel.track(event.action, event)
      // Example: gtag('event', event.action, { ...event })
    } catch (error) {
      console.error("Error tracking analytics event:", error);
    }
  };

  const trackError = (error: Error, context?: string) => {
    trackEvent({
      category: "Error",
      action: error.name,
      label: `${context}: ${error.message}`,
    });
  };

  const trackCompletion = (timeSpentMs: number) => {
    trackEvent({
      category: "Questionnaire",
      action: "Completed",
      label: `Time spent: ${Math.round(timeSpentMs / 1000)}s`,
      value: Math.round(timeSpentMs / 1000),
    });
  };

  return {
    trackEvent,
    trackError,
    trackCompletion,
  };
}
