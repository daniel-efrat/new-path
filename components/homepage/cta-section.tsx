"use client"

import { Button } from "../../components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { LazyMotion, domAnimation, m, useInView } from "framer-motion"
import { useRef } from "react"

function StatIcon({ src, alt, bgColor, children, index }: { 
  src: string; 
  alt: string; 
  bgColor: string;
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <m.div
      ref={ref}
      className="text-center"
      initial={{ scale: 0 }}
      animate={isInView ? { scale: 1 } : { scale: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        bounce: 0.5,
        delay: 0.5 + (index * 0.15)
      }}
    >
      <div className={`w-20 h-20 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="mx-auto"
        />
      </div>
      {children}
    </m.div>
  )
}

export function CTASection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        ref={sectionRef}
        className="py-20 px-4 relative overflow-hidden"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{
          backgroundPosition: "100% 50%",
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
        style={{
          background: "linear-gradient(270deg, #059669, #4f46e5, #059669)",
          backgroundSize: "200% 200%",
        }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <m.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              מוכן להתחיל את המסע?
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              הצטרף לאלפי צעירים שכבר מצאו את הדרך שלהם
            </p>
          </m.div>

          <m.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
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
          </m.div>

          <m.div
            className="flex justify-center items-center gap-8 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <StatIcon
              src="/icons/checklist.png"
              alt="Checklist icon"
              bgColor="bg-white/20"
              index={0}
            >
              <div className="text-2xl font-bold text-white">10,000+</div>
              <div className="text-sm text-emerald-100">הערכות הושלמו</div>
            </StatIcon>

            <StatIcon
              src="/icons/star.png"
              alt="Star icon"
              bgColor="bg-white/20"
              index={1}
            >
              <div className="text-2xl font-bold text-white">95%</div>
              <div className="text-sm text-emerald-100">שביעות רצון</div>
            </StatIcon>

            <StatIcon
              src="/icons/college.png"
              alt="College icon"
              bgColor="bg-white/20"
              index={2}
            >
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-sm text-emerald-100">מכללות שותפות</div>
            </StatIcon>
          </m.div>
        </div>
      </m.section>
    </LazyMotion>
  )
}
