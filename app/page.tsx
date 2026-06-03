import { Metadata } from "next";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { CTASection } from "@/components/homepage/cta-section";
import AuthHandler from "@/components/auth/AuthHandler";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אבחון קריירה - מצא את המסלול המקצועי האידיאלי שלך",
  description:
    "השלם את השאלון שלנו כדי לקבל המלצות קריירה ומכללות מותאמות אישית",
};

export default function Home() {
  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-tech">
      <AuthHandler />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <footer className="py-8 text-center border-t border-border/60 bg-transparent">
        <div className="container mx-auto">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} איציק רצימור – דרך חדשה. כל הזכויות שמורות
          </p>
          <div className="mt-4 flex justify-center gap-4 space-x-reverse">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              מדיניות פרטיות
            </Link>
            <Link
              href="/accessibility"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              הצהרת נגישות
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              תנאי שימוש
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              צור קשר
            </Link>
            <Link
              href="/aboutHolland"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              אודות השאלון
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
