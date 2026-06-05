"use client";

import { Card, CardContent } from "../../components/ui/card";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 text-center space-y-4">
        <motion.div
          ref={ref}
          className={`w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto ${feature.color}`}
          initial={{ scale: 1 }}
          animate={isInView ? { scale: 1 } : { scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: index * 0.15,
            bounce: 0.5,
          }}
        >
          <Image
            src={feature.icon}
            alt={`${feature.title} icon`}
            width={84}
            height={84}
          />
        </motion.div>
        <h3 className="font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: "/assets/home/icons/checkmark.png",
      title: "הערכה מקיפה",
      description: "13 שלבים חכמים שחושפים את הפוטנציאל שלך",
      color: "text-emerald-600",
    },
    {
      icon: "/assets/home/icons/group.png",
      title: "מותאם לישראלים",
      description: "פותח במיוחד עבור צעירים בישראל",
      color: "text-indigo-600",
    },
    {
      icon: "/assets/home/icons/growth.png",
      title: "נתונים עדכניים",
      description: "מידע רלוונטי על שוק העבודה הישראלי",
      color: "text-rose-600",
    },
    {
      icon: "/assets/home/icons/medal.png",
      title: "מכללות מובילות",
      description: "שותפות עם המוסדות הטובים ביותר בארץ",
      color: "text-amber-600",
    },
  ];

  return (
    <section className="py-20 px-4  bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            למה לבחור בנו?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            פלטפורמה מתקדמת שמשלבת טכנולוגיה עם הבנה עמוקה של השוק הישראלי
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
