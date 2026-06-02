"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTransition } from "@/components/ui/DialogTransition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Clock } from "lucide-react";

interface TypeDescription {
  title: string;
  description: string;
  traits: string[];
  careers: string[];
}

type TypeDescriptions = {
  [key in
    | "אומנותי"
    | "חקרני"
    | "ביצועי"
    | "מִנהלי"
    | "יזמי"
    | "חברתי"]: TypeDescription;
};

const typeDescriptions: TypeDescriptions = {
  אומנותי: {
    title: "הטיפוס האומנותי (A - Artistic)",
    description:
      "אנשים יצירתיים המעדיפים עבודה לא שגרתית. הם נהנים מביטוי עצמי דרך אומנות, מוזיקה, כתיבה או עיצוב. הם מעריכים חופש יצירתי ומקוריות.",
    traits: ["יצירתיות", "דמיון עשיר", "חוש אסתטי", "עצמאות מחשבתית"],
    careers: ["מעצב/ת", "אדריכל/ית", "צלם/ת", "מוזיקאי/ת", "סופר/ת"],
  },
  חקרני: {
    title: "הטיפוס המחקרי (I - Investigative)",
    description:
      "אנשים סקרנים האוהבים לפתור בעיות מורכבות. הם נהנים מלימוד ומחקר, ומעדיפים עבודה הדורשת חשיבה אנליטית.",
    traits: [
      "חשיבה אנליטית",
      "סקרנות אינטלקטואלית",
      "דיוק",
      "יכולת פתרון בעיות",
    ],
    careers: ["מדען/ית", "רופא/ה", "מהנדס/ת", "חוקר/ת", "מתכנת/ת"],
  },
  ביצועי: {
    title: "הטיפוס הביצועי (R - Realistic)",
    description:
      "אנשים מעשיים האוהבים לעבוד עם הידיים והכלים. הם מעדיפים תוצאות מוחשיות ונהנים מפעילות פיזית.",
    traits: ["מעשיות", "יכולת טכנית", "כושר גופני", "עבודת כפיים"],
    careers: ["טכנאי/ת", "מכונאי/ת", "חשמלאי/ת", "נגר/ית", "שף/ית"],
  },
  מִנהלי: {
    title: "הטיפוס המִנהלי (C - Conventional)",
    description:
      "אנשים מסודרים האוהבים לעבוד עם נתונים ופרטים. הם מעריכים דיוק, יציבות וארגון.",
    traits: ["ארגון", "דייקנות", "אחריות", "יכולת מעקב אחר נהלים"],
    careers: ["רואה חשבון", "מנהל/ת משרד", "בנקאי/ת", "מזכיר/ה בכיר/ה"],
  },
  יזמי: {
    title: "הטיפוס היוזם (E - Enterprising)",
    description:
      "אנשים שאפתנים האוהבים להוביל ולהשפיע. הם נהנים ממכירות, ניהול והובלת אנשים להשגת מטרות.",
    traits: ["מנהיגות", "שכנוע", "ביטחון עצמי", "יוזמה"],
    careers: ["מנהל/ת עסקים", "יזם/ית", "סוכן/ת מכירות", "עורך/ת דין"],
  },
  חברתי: {
    title: "הטיפוס החברתי (S - Social)",
    description:
      "אנשים אמפתיים האוהבים לעזור לאחרים. הם נהנים מעבודה עם אנשים, הוראה, ייעוץ ותמיכה.",
    traits: ["אמפתיה", "יכולת הקשבה", "סבלנות", "תקשורת בינאישית"],
    careers: ["מורה", "יועץ/ת", "עובד/ת סוציאלי/ת", "פסיכולוג/ית", "מאמן/ת"],
  },
};

interface TypeIconProps {
  type: { name: keyof TypeDescriptions; image: string };
  index: number;
  onClick: () => void;
}

function TypeIcon({ type, index, onClick }: TypeIconProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={onClick}
      className="flex w-full flex-col items-center space-y-4 p-4 border border-white/70 rounded-lg shadow-sm hover:bg-white/10 hover:shadow-md active:bg-white/15 transition-all cursor-pointer"
    >
      <span className="text-xl font-semibold text-foreground">{type.name}</span>
      <motion.div
        ref={ref}
        className="relative w-24 h-24"
        initial={{ y: -50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: -50, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 5,
          delay: index * 0.1 + 0.3,
          bounce: 1,
          duration: 1.5,
        }}
      >
        <Image
          src={type.image}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain"
        />
      </motion.div>
      <motion.div
        initial={{ scaleX: 1.6, opacity: 0 }}
        animate={
          isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 1, opacity: 0.6 }
        }
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 5,
          delay: index * 0.1 + 0.3,
          bounce: 1,
          duration: 1.5,
        }}
        className="w-20 h-1 rounded-[50%] flex items-center justify-center mx-auto blur-[5px] bg-[#000000]"
      />
    </button>
  );
}

interface TypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeName: keyof TypeDescriptions | "";
}

function TypeModal({ isOpen, onClose, typeName }: TypeModalProps) {
  const typeInfo = typeName
    ? typeDescriptions[typeName as keyof TypeDescriptions]
    : null;

  if (!typeInfo) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-2xl overflow-hidden">
            <DialogTransition>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  {typeInfo.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                <motion.p
                  className="text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {typeInfo.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold text-lg mb-2">
                    מאפיינים בולטים:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {typeInfo.traits.map((trait: string, index: number) => (
                      <motion.li
                        key={trait}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {trait}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="font-semibold text-lg mb-2">
                    מקצועות מתאימים:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {typeInfo.careers.map((career: string, index: number) => (
                      <motion.li
                        key={career}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        {career}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </DialogTransition>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

export default function AboutHollandPage() {
  const [selectedType, setSelectedType] = useState<
    keyof TypeDescriptions | null
  >(null);

  const types: Array<{ name: keyof TypeDescriptions; image: string }> = [
    { name: "אומנותי", image: "/RIASEC/A.png" },
    { name: "חקרני", image: "/RIASEC/I.png" },
    { name: "ביצועי", image: "/RIASEC/R.png" },
    { name: "מִנהלי", image: "/RIASEC/C.png" },
    { name: "יזמי", image: "/RIASEC/E.png" },
    { name: "חברתי", image: "/RIASEC/S.png" },
  ];

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl w-full space-y-8">
        <nav aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                דף הבית
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <span className="text-foreground">שאלון הולנד</span>
            </li>
          </ol>
        </nav>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
            שאלון הולנד להכוונה מקצועית
          </h1>
        </div>

        <div className="text-center">
          <p className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
            מצאו את הכיוון המקצועי שלכם עם שאלון הולנד
          </p>
        </div>

        <div className="mt-8 text-lg text-muted-foreground space-y-6 text-right leading-relaxed">
          <p>
            מחפשים כיוון תעסוקתי? השאלון שלנו יעזור לכם למפות את תחומי העניין
            והנטיות המקצועיות שלכם. חשוב לזכור, זהו כלי להכוונה עצמית ואינו
            מהווה תחליף לייעוץ קריירה מקצועי.
          </p>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-foreground">
              מה זה בעצם שאלון הולנד (RIASEC)?
            </h2>
            <p className="mt-2">
              זהו שאלון ייחודי שממיין אנשים ל-6 טיפוסים על פי תחומי העניין
              והסביבה התעסוקתית המועדפת עליהם. יוצר השאלון, ג'ון הולנד, האמין
              שכאשר בוחרים מסלול לימודים או עבודה שתואם את הטיפוס שלנו, חווים
              יותר סיפוק והצלחה.
            </p>
          </div>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-foreground">
              גרסאות מותאמות ומהירות
            </h2>
            <p className="mt-2">
              כדי להקל עליכם, יצרנו שתי גרסאות של השאלון: גרסה מהירה של 30 שאלות
              וגרסה מורחבת של 60. שתי הגרסאות הן תרגום של{" "}
              <span className="font-semibold text-white underline underline-offset-2">
                השאלון האמריקאי המקוצר
              </span>
              , והותאמו ותוקפו באופן מלא לקהל הישראלי.
            </p>
          </div>
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-foreground">
              למה דווקא שאלון הולנד?
            </h2>
            <p className="mt-2">
              למרות שישנן דרכים רבות למצוא כיוון מקצועי, שאלון הולנד הוא הכלי
              הוותיק, המוכח והנפוץ ביותר בעולם לאבחון נטיות תעסוקתיות. הוא נמצא
              בשימוש נרחב במכוני מיון והכוונה בזכות מהימנותו ופשטותו.
            </p>
          </div>
        </div>

        <div className="py-12 text-center">
          <h2 className="text-3xl font-extrabold text-foreground">
            ששת הטיפוסים של הולנד
          </h2>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-8">
            {types.map((type, index) => (
              <TypeIcon
                key={type.name}
                type={type}
                index={index}
                onClick={() => setSelectedType(type.name)}
              />
            ))}
          </div>
        </div>

        <Card className="max-w-md mx-auto p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 space-x-reverse text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="w-4 h-4 ml-1" />
                <span>מאובטח</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mx-1" />
                <span>10-15 דקות</span>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full text-lg font-semibold h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/questionnaire">
                למילוי שאלון ההכוונה
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Link>
            </Button>

            
          </div>
        </Card>
      </div>

      <TypeModal
        isOpen={!!selectedType}
        onClose={() => setSelectedType(null)}
        typeName={selectedType || ""}
      />
    </div>
  );
}
