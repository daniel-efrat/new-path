"use client";

import { Button } from "@/components/ui/button";

interface Step9Props {
  onNext?: () => void;
  onPrevious: () => void;
  onComplete: () => Promise<void> | void;
}

export default function Step9({ onNext, onPrevious, onComplete }: Step9Props) {
  const handleComplete = async () => {
    await onComplete?.();
    onNext?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-2">שלב 9 (Placeholder)</h1>
      <p className="text-gray-600 mb-6">
        זהו קומפוננט זמני עבור שלב 9. אפשר להמשיך לפתח את התוכן בהמשך.
      </p>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          שלב קודם
        </Button>
        <Button onClick={handleComplete}>סמן כהושלם והמשך</Button>
      </div>
    </div>
  );
}
