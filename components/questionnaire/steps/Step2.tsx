import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step2({ onNext, onPrevious }: Step2Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">
        שלב 2: רקע מקצועי
      </h1>
      <p className="text-lg mb-8 text-center max-w-2xl mx-auto">
        ספר לנו על הניסיון והכישורים המקצועיים שלך
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
              onClick={onNext}
            >
              המשך לשלב הבא
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
