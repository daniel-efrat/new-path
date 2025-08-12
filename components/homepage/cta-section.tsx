"use client";

import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";

export function CTASection() {
  return (
    <LazyMotion features={domAnimation}>
      <m.section 
        className="py-20 px-4 relative overflow-hidden"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ 
          backgroundPosition: "100% 50%",
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
        style={{
          background: "linear-gradient(270deg, #059669, #4f46e5, #059669)",
          backgroundSize: "200% 200%",
        }}
      >
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

          <p className="text-sm text-emerald-100 mt-4">
            ללא עלות • ללא התחייבות • תוצאות מיידיות
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 pt-8">
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
    </m.section>
  </LazyMotion>
);
}
