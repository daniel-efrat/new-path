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
    <div
      className={`dashboard-glass-panel rounded-2xl px-5 py-4 sm:px-6 mt-8 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white/95">
            התקדמות כללית
          </h2>
          <p className="text-sm text-white/90">
            {completed} מתוך {total} שלבים הושלמו
          </p>
        </div>
        <Badge
          variant={completed === total ? "default" : "secondary"}
          className="dashboard-progress-badge text-sm"
        >
          {Math.round(value)}% הושלם
        </Badge>
      </div>
      <Progress value={value} className="dashboard-progress-track h-2.5" />
    </div>
  );
}
