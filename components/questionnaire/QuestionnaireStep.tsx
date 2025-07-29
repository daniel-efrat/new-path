import React from "react";

export type QuestionType = "select" | "multiselect";

export interface QuestionProps {
  question: {
    id: string;
    question: string;
    type: QuestionType;
    options: string[];
    maxSelections?: number;
  };
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export default function QuestionnaireStep({
  question,
  value,
  onChange,
}: QuestionProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleCheckboxChange = (option: string) => {
    const currentValues = Array.isArray(value) ? value : [];

    if (currentValues.includes(option)) {
      // Remove the option if already selected
      onChange(currentValues.filter((item) => item !== option));
    } else {
      // Add the option if not already selected and within max selections
      if (
        !question.maxSelections ||
        currentValues.length < question.maxSelections
      ) {
        onChange([...currentValues, option]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium">{question.question}</h3>

      {question.type === "select" && (
        <select
          value={value as string}
          onChange={handleSelectChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>
            בחר אפשרות
          </option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {question.type === "multiselect" && (
        <div className="space-y-2">
          {question.maxSelections && (
            <p className="text-sm text-gray-500">
              בחר עד {question.maxSelections} אפשרויות
              {Array.isArray(value) && value.length > 0 && (
                <span>
                  {" "}
                  ({value.length}/{question.maxSelections} נבחרו)
                </span>
              )}
            </p>
          )}

          {question.options.map((option) => {
            const isChecked = Array.isArray(value) && value.includes(option);
            const isDisabled =
              question.maxSelections &&
              Array.isArray(value) &&
              value.length >= question.maxSelections &&
              !isChecked;

            return (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${question.id}-${option}`}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option)}
                  disabled={isDisabled ? true : false}
                  className="mr-2 h-5 w-5"
                />
                <label
                  htmlFor={`${question.id}-${option}`}
                  className={`${isDisabled ? "text-gray-400" : ""}`}
                >
                  {option}
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
