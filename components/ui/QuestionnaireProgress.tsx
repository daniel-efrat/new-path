import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuestionnaireProgressProps {
  value: number; // percentage
  completed: number;
  total: number;
  className?: string;
}

export default function QuestionnaireProgress({
  value,
  completed,
  total,
  className = "",
}: QuestionnaireProgressProps) {
  return (
    <div className={`bg-white rounded-lg px-6 py-2   ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            התקדמות כללית
          </h2>
          <p className="text-sm text-gray-600">
            {completed} מתוך {total} שלבים הושלמו
          </p>
        </div>
        <Badge
          variant={completed === total ? "default" : "secondary"}
          className="text-sm"
        >
          {Math.round(value)}% הושלם
        </Badge>
      </div>
      <Progress value={value} className="h-3" />
    </div>
  );
}
