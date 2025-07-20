import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Step5Props {
  onPrevious: () => void;
  onComplete: () => void;
}

export default function Step5({ onPrevious, onComplete }: Step5Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        שלב 5: סיכום ואישור
      </h1>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        סקור את כל המידע ואשר את השלמת השאלון
      </p>

      <Card className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-8">שלב זה בפיתוח. תכנים יתווספו בקרוב.</p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
            >
              חזור לשלב הקודם
            </Button>
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              סיים ושלח
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
