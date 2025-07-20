import React, { useState } from "react";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionnaireAnswers {
  traits?: string[];
  anchors?: number[];
}

export default function FloatingProgress() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { answers } = useQuestionnaireStore();
  const typedAnswers = answers as QuestionnaireAnswers;
  
  const traitsProgress = Math.min((typedAnswers.traits?.length ?? 0) * 10, 100);
  const anchorsProgress = 
    ((typedAnswers.anchors?.filter(val => val !== undefined).length ?? 0) / 8) * 100;

  const totalProgress = Math.round((traitsProgress + anchorsProgress) / 2);

  return (
    <div 
      className={`fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
        isExpanded ? 'p-4' : 'p-2'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {isExpanded ? 'התקדמות בשלב הנוכחי' : `${totalProgress}% הושלם`}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "צמצם תצוגת התקדמות" : "הרחב תצוגת התקדמות"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div 
        className={`space-y-2 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'mt-2 max-h-48' : 'max-h-0'
        }`}
      >
        <div className="flex justify-between text-xs text-gray-600">
          <span>תכונות אישיות</span>
          <span>{Math.round(traitsProgress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${traitsProgress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600">
          <span>עוגני קריירה</span>
          <span>{Math.round(anchorsProgress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${anchorsProgress}%` }}
          />
        </div>

        <div className="mt-4 pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">סה״כ השלמה</span>
            <span className={`text-sm font-bold ${
              totalProgress === 100 ? 'text-green-600' : 'text-blue-600'
            }`}>
              {totalProgress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
