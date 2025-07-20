import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5 bg-cover bg-center" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm font-medium">
            <Sparkles className="w-4 h-4 " />
            מופעל בעזרת בינה מלאכותית
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            מה הדרך שלך?
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            גלה את המקצוע המושלם עבורך עם אבחון חכם בתוך דקות
          </p>
        </div>

        <Card className="max-w-md mx-auto p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-gray-600">
              {/* <div className="flex items-center">
                <Clock className="w-4 h-4 ml-1" />5 דקות
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 ml-1" />
                GDPR ✓
              </div> */}
            </div>

            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full text-lg font-semibold h-12 bg-secondary hover:bg-emerald-700"
              >
                התחל אבחון
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>

            <p className="text-xs text-gray-500 text-center mt-2">
              ללא התחייבות • ביטול בכל עת
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900">התאמה מדויקת</h3>
            <p className="text-sm text-gray-600">
              אלגוריתם חכם שמתאים לך מקצועות
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="font-semibold text-gray-900">מכללות שותפות</h3>
            <p className="text-sm text-gray-600">
              חיבור ישיר למוסדות לימוד מובילים
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900">נתוני שכר</h3>
            <p className="text-sm text-gray-600">
              מידע עדכני על שכר צפוי בתחום
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
