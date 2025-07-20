import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            מוכן להתחיל את המסע?
          </h2>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            הצטרף לאלפי צעירים שכבר מצאו את הדרך שלהם
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg font-semibold h-12 px-8"
            >
              התחל אבחון עכשיו
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </Link>

          <p className="text-sm text-emerald-100">
            ללא עלות • ללא התחייבות • תוצאות מיידיות
          </p>
        </div>

        <div className="flex justify-center items-center space-x-8 space-x-reverse pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10,000+</div>
            <div className="text-sm text-emerald-100">הערכות הושלמו</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">95%</div>
            <div className="text-sm text-emerald-100">שביעות רצון</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-emerald-100">מכללות שותפות</div>
          </div>
        </div>
      </div>
    </section>
  );
}
