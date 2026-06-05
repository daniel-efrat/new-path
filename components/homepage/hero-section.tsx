"use client";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Sparkles, Shield, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const HERO_FEATURE_REVEAL_MARGIN = "0px 0px 35% 0px";
const HERO_FEATURE_ICON_DELAY = 0.15;
const HERO_FEATURE_ICON_STAGGER = 0.1;

function HeroIcon({
  src,
  alt,
  bgColor,
  children,
  index,
}: {
  src: string;
  alt: string;
  bgColor: string;
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: HERO_FEATURE_REVEAL_MARGIN,
  });

  return (
    <motion.div
      ref={ref}
      className="text-center space-y-2"
      initial={{ scale: 1 }}
      animate={isInView ? { scale: 1 } : { scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        bounce: 0.5,
        delay: HERO_FEATURE_ICON_DELAY + index * HERO_FEATURE_ICON_STAGGER,
      }}
    >
      <div
        className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto`}
      >
        <Image
          src={src}
          alt={alt}
          width={src.includes("money") ? 84 : 80}
          height={src.includes("money") ? 84 : 80}
          className={src.includes("target") ? "-mt-2" : ""}
        />
      </div>
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const cardRef = useRef(null);
  const gridRef = useRef(null);

  const isBadgeInView = useInView(badgeRef, { once: true, margin: "-100px" });
  const isHeadingInView = useInView(headingRef, {
    once: true,
    margin: "-100px",
  });
  const isDescriptionInView = useInView(descriptionRef, {
    once: true,
    margin: "-100px",
  });
  const isCardInView = useInView(cardRef, { once: true, margin: "-100px" });
  const isGridInView = useInView(gridRef, {
    once: true,
    margin: HERO_FEATURE_REVEAL_MARGIN,
  });

  return (
    <section className="mt-8 relative flex items-center justify-center bg-transparent p-4">
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <motion.div
            ref={badgeRef}
            initial={{ opacity: 1, y: 0 }}
            animate={
              isBadgeInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Badge variant="secondary" className="text-sm font-medium">
              <Sparkles className="w-4 h-4 " />
              מופעל בעזרת בינה מלאכותית
            </Badge>
          </motion.div>

          <motion.h1
            ref={headingRef}
            initial={{ opacity: 1, y: 0 }}
            animate={
              isHeadingInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
          >
            מה הדרך שלך?
          </motion.h1>

          <motion.p
            ref={descriptionRef}
            initial={{ opacity: 1, y: 0 }}
            animate={
              isDescriptionInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }
            }
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            גלה את המקצוע המושלם עבורך עם אבחון חכם בתוך דקות
          </motion.p>
        </div>

        <motion.div
          ref={cardRef}
          initial={{ opacity: 1, y: 0 }}
          animate={isCardInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="max-w-md mx-auto p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4 space-x-reverse text-sm text-muted-foreground"></div>

              <Button
                asChild
                size="lg"
                className="w-full text-lg font-semibold h-12 bg-primary hover:bg-secondary custom-btn"
              >
                <Link href="/dashboard">
                  התחל אבחון
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                ללא התחייבות • ביטול בכל עת
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          ref={gridRef}
          initial={{ opacity: 1, y: 0 }}
          animate={isGridInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12"
        >
          <HeroIcon
            src="/assets/home/icons/target.png"
            alt="Target icon"
            // bgColor="bg-emerald-200"
            bgColor="transparent"
            index={0}
          >
            <h3 className="font-semibold text-foreground">התאמה מדויקת</h3>
            <p className="text-sm text-muted-foreground">
              אלגוריתם חכם שמתאים לך מקצועות
            </p>
          </HeroIcon>

          <HeroIcon
            src="/assets/home/icons/cap.png"
            alt="Graduation cap icon"
            // bgColor="bg-indigo-100"
            bgColor="transparent"
            index={1}
          >
            <h3 className="font-semibold text-foreground">מכללות שותפות</h3>
            <p className="text-sm text-muted-foreground">
              חיבור ישיר למוסדות לימוד מובילים
            </p>
          </HeroIcon>

          <HeroIcon
            src="/assets/home/icons/money.png"
            alt="Money icon"
            // bgColor="bg-rose-100"
            bgColor="transparent"
            index={2}
          >
            <h3 className="font-semibold text-foreground">נתוני שכר</h3>
            <p className="text-sm text-muted-foreground">
              מידע עדכני על שכר צפוי בתחום
            </p>
          </HeroIcon>
        </motion.div>
      </div>
    </section>
  );
}
