import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  onBack: () => void;
}

export default function Header({ onBack }: HeaderProps) {
  return (
    <div className="max-w-3xl mx-auto mb-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            שאלון אבחון קריירה
          </h1>
          <p className="text-muted-foreground mt-1">
            השלם את כל השלבים כדי לקבל המלצות מותאמות אישית
          </p>
        </div>
      </div>
    </div>
  );
}
