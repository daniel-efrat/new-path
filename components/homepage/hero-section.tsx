import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-4">
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg?height=800&width=1200')] opacity-7 bg-cover bg-center" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm font-medium">
            <Sparkles className="w-4 h-4 " />
            מופעל בעזרת בינה מלאכותית
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            מה הדרך שלך?
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            גלה את המקצוע המושלם עבורך עם אבחון חכם בתוך דקות
          </p>
        </div>

        <Card className="max-w-md mx-auto p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-muted-foreground">
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
                className="w-full text-lg font-semibold h-12 bg-primary hover:bg-secondary"
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
            <div className="w-20 h-20 bg-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <Image
                src="/icons/target.png"
                className="-mt-2"
                alt="Target icon"
                width={80}
                height={80}
              />
            </div>
            <h3 className="font-semibold text-foreground">התאמה מדויקת</h3>
            <p className="text-sm text-muted-foreground">
              אלגוריתם חכם שמתאים לך מקצועות
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Image
                src="/icons/cap.png"
                alt="Graduation cap icon"
                width={80}
                height={80}
              />
            </div>
            <h3 className="font-semibold text-foreground">מכללות שותפות</h3>
            <p className="text-sm text-muted-foreground">
              חיבור ישיר למוסדות לימוד מובילים
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <Image
                src="/icons/money.png"
                alt="Money icon"
                width={84}
                height={84}
              />
            </div>
            <h3 className="font-semibold text-foreground">נתוני שכר</h3>
            <p className="text-sm text-muted-foreground">
              מידע עדכני על שכר צפוי בתחום
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
