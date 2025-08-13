"use client"

import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, Sparkles, Shield, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

function HeroIcon({ src, alt, bgColor, children, index }: { 
  src: string; 
  alt: string; 
  bgColor: string;
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div className="text-center space-y-2">
      <motion.div
        ref={ref}
        className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto`}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          bounce: 0.5,
          delay: index * 0.15
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={src.includes("money") ? 84 : 80}
          height={src.includes("money") ? 84 : 80}
          className={src.includes("target") ? "-mt-2" : ""}
        />
      </motion.div>
      {children}
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="mt-4 relative flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-indigo-50 p-4">
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg?height=800&width=1200')] opacity-20 bg-cover bg-center" />

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
          <HeroIcon src="/icons/target.png" alt="Target icon" bgColor="bg-emerald-200" index={0}>
            <h3 className="font-semibold text-foreground">התאמה מדויקת</h3>
            <p className="text-sm text-muted-foreground">
              אלגוריתם חכם שמתאים לך מקצועות
            </p>
          </HeroIcon>

          <HeroIcon src="/icons/cap.png" alt="Graduation cap icon" bgColor="bg-indigo-100" index={1}>
            <h3 className="font-semibold text-foreground">מכללות שותפות</h3>
            <p className="text-sm text-muted-foreground">
              חיבור ישיר למוסדות לימוד מובילים
            </p>
          </HeroIcon>

          <HeroIcon src="/icons/money.png" alt="Money icon" bgColor="bg-rose-100" index={2}>
            <h3 className="font-semibold text-foreground">נתוני שכר</h3>
            <p className="text-sm text-muted-foreground">
              מידע עדכני על שכר צפוי בתחום
            </p>
          </HeroIcon>
        </div>
      </div>
    </section>
  )
}
