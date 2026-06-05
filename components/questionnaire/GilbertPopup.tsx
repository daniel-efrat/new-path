"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

export interface GilbertPopupCopy {
  eyebrow?: string;
  title: string;
  message: string;
  cta?: string;
  videoSrc?: string;
  videoLabel?: string;
}

interface GilbertPopupProps extends GilbertPopupCopy {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_INTERVAL_MS = 24;

export default function GilbertPopup({
  isOpen,
  eyebrow = "גילברט פיינשטיין",
  title,
  message,
  cta = "הבנתי, ממשיכים",
  videoSrc,
  videoLabel = "סרטון המלצה להפסקה קצרה",
  onClose,
}: GilbertPopupProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setVisibleCharacters(0);
      return;
    }

    setVisibleCharacters(0);
    const interval = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= message.length) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, TYPE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isOpen, message]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const typedMessage = useMemo(
    () => message.slice(0, visibleCharacters),
    [message, visibleCharacters]
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-slate-950/70 px-4 py-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gilbert-title"
            aria-describedby="gilbert-message"
            dir="rtl"
            className="relative my-auto grid max-h-[calc(100vh-2.5rem)] w-full max-w-3xl overflow-hidden rounded-lg border border-white/25 bg-white text-slate-950 shadow-2xl sm:grid-cols-[minmax(0,1fr)_260px]"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute left-3 top-3 z-10 grid size-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="סגירת הודעת גילברט"
            >
              <X className="size-5" />
            </button>

            <div className="relative order-2 p-6 pt-12 sm:order-1 sm:p-8">
              <motion.div
                className="mb-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                {eyebrow}
              </motion.div>
              <motion.h2
                id="gilbert-title"
                className="text-2xl font-bold leading-tight sm:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                {title}
              </motion.h2>
              <p
                id="gilbert-message"
                className="mt-4 min-h-[5.5rem] text-lg leading-8 text-slate-700"
                aria-live="polite"
              >
                {typedMessage}
                {visibleCharacters < message.length && (
                  <motion.span
                    className="mr-1 inline-block h-5 w-0.5 translate-y-1 bg-blue-700"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    aria-hidden="true"
                  />
                )}
              </p>

              <div className="mt-6 flex justify-start">
                <Button type="button" size="lg" onClick={onClose} autoFocus>
                  {cta}
                </Button>
              </div>
            </div>

            <div className="relative order-1 min-h-60 overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-amber-50 sm:order-2 sm:min-h-full">
              {videoSrc ? (
                <motion.video
                  src={videoSrc}
                  aria-label={videoLabel}
                  className="h-full min-h-60 w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.28 }}
                />
              ) : (
                <>
                  <motion.div
                    className="absolute right-6 top-6 h-14 w-14 rounded-full bg-amber-300/70 blur-xl"
                    animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                  />
                  <motion.img
                    src="/gilbert.png"
                    alt="גילברט פיינשטיין"
                    className="absolute bottom-0 left-1/2 h-[112%] max-h-[430px] -translate-x-1/2 object-contain drop-shadow-2xl"
                    draggable={false}
                    initial={{ y: 28, rotate: -2, opacity: 0 }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 18 }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}
