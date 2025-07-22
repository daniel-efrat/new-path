import { useEffect, useCallback } from "react";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { STORAGE_KEYS } from "@/lib/constants/questionnaire";
import { validateQuestionnaireData } from "@/lib/utils/format-questionnaire";

export function useQuestionnairePersistence() {
  const { stepData, setAnswer, resetQuestionnaire } = useQuestionnaireStore();

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedStepData = localStorage.getItem(STORAGE_KEYS.ANSWERS);
        if (savedStepData) {
          const parsed = JSON.parse(savedStepData);
          const validation = validateQuestionnaireData(parsed);
          
          if (validation.isValid) {
            Object.entries(parsed).forEach(([key, value]) => {
              setAnswer(key, value);
            });
          } else {
            console.warn("Invalid saved data found:", validation.errors);
            await clearSavedData();
          }
        }
      } catch (error) {
        console.error("Error loading saved questionnaire data:", error);
        await clearSavedData();
      }
    };

    loadSavedData();
  }, [setAnswer]);

  // Save data on changes
  useEffect(() => {
    const saveData = async () => {
      try {
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(stepData));
      } catch (error) {
        console.error("Error saving questionnaire data:", error);
      }
    };

    if (Object.keys(stepData).length > 0) {
      saveData();
    }
  }, [stepData]);

  // Clear saved data
  const clearSavedData = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.STEP);
      resetQuestionnaire();
    } catch (error) {
      console.error("Error clearing saved data:", error);
      throw error;
    }
  }, [resetQuestionnaire]);

  // Export saved data
  const exportData = useCallback(() => {
    try {
      const data = {
        answers: stepData,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `questionnaire-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }, [stepData]);

  // Import saved data
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.answers) {
        throw new Error("Invalid data format");
      }

      const validation = validateQuestionnaireData(data.answers);
      if (!validation.isValid) {
        throw new Error(`Invalid data: ${validation.errors.join(", ")}`);
      }

      await clearSavedData();
      Object.entries(data.answers).forEach(([key, value]) => {
        setAnswer(key, value);
      });
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }, [clearSavedData, setAnswer]);

  return {
    clearSavedData,
    exportData,
    importData,
  };
}
