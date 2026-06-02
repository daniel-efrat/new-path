"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const RATING_OPTIONS = [
  { src: "/slice1.png", label: "מתאים לי מאוד", value: 5 },
  { src: "/slice2.png", label: "מתאים לי", value: 4 },
  { src: "/slice3.png", label: "לא בטוח", value: 3 },
  { src: "/slice4.png", label: "מעט מתאים לי", value: 2 },
  { src: "/slice5.png", label: "בכלל לא מתאים לי", value: 1 },
] as const;

interface RatingScaleProps {
  value?: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

export function RatingScale({ value, onSelect, disabled }: RatingScaleProps) {
  return (
    <div className="mb-1 overflow-hidden sm:mb-2">
      <div
        className="flex items-stretch justify-between gap-1 overflow-x-auto sm:gap-2"
        dir="ltr"
      >
        {RATING_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.src}
              type="button"
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={cn(
                "relative flex min-w-[58px] flex-1 flex-col items-center rounded-lg border p-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-w-[90px] sm:p-2",
                isSelected
                  ? "border-primary bg-primary text-white shadow-lg ring-2 ring-primary/25"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-primary/5"
              )}
              aria-pressed={isSelected}
              aria-label={option.label}
            >
              {isSelected ? (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              ) : null}
              <div className="flex h-[42px] w-[42px] items-center justify-center sm:h-[58px] sm:w-[58px]">
                <Image
                  src={option.src}
                  alt={option.label}
                  width={58}
                  height={58}
                  className="h-full w-full object-contain"
                />
              </div>
              <span
                className={cn(
                  "mt-1 whitespace-nowrap text-[10px] font-semibold sm:mt-2 sm:text-xs",
                  isSelected ? "text-white" : "text-gray-700"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RatingScalePreviewProps {
  selectedValue: number;
}

export function RatingScalePreview({ selectedValue }: RatingScalePreviewProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50/80 p-3">
      <div
        className="flex items-center justify-between gap-0.5 overflow-x-auto sm:gap-2"
        dir="ltr"
        aria-hidden="true"
      >
        {RATING_OPTIONS.map((option) => {
          const isSelected = option.value === selectedValue;

          return (
            <div
              key={option.src}
              className={cn(
                "flex min-w-[52px] flex-col items-center rounded-lg border p-0.5 sm:min-w-[80px] sm:p-2",
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-transparent bg-white"
              )}
            >
              <div className="flex h-[40px] w-[40px] items-center justify-center sm:h-[56px] sm:w-[56px]">
                <Image
                  src={option.src}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
              <span
                className={cn(
                  "mt-1 whitespace-nowrap text-[10px] sm:mt-2 sm:text-xs",
                  isSelected ? "text-white" : "text-gray-700"
                )}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
