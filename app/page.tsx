import { Metadata } from "next";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { CTASection } from "@/components/homepage/cta-section";

export const metadata: Metadata = {
  title: "אבחון קריירה - מצא את המסלול המקצועי האידיאלי שלך",
  description: "השלם את השאלון שלנו כדי לקבל המלצות קריירה ומכללות מותאמות אישית",
};

export default function Home() {
  return (
    <div dir="rtl" className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <footer className="py-8 bg-gray-100 text-center">
        <div className="container mx-auto">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} אבחון קריירה | כל הזכויות שמורות
          </p>
          <div className="mt-4 flex justify-center space-x-4 space-x-reverse">
            <a 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              מדיניות פרטיות
            </a>
            <a 
              href="/terms" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              תנאי שימוש
            </a>
            <a 
              href="/contact" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              צור קשר
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
