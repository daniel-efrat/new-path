import { Metadata } from "next";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { CTASection } from "@/components/homepage/cta-section";
import AuthHandler from "@/components/auth/AuthHandler";

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
    </div>
  );
}
