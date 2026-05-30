"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const iconLayers = [1, 2, 3, 4, 5, 6, 7];

interface LevelCompleteModalProps {
  isOpen: boolean;
  questionnaireName: string;
  onContinue: () => void;
}

export default function LevelCompleteModal({
  isOpen,
  questionnaireName,
  onContinue,
}: LevelCompleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="level-complete fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="level-complete-title"
            className="w-full max-w-md rounded-lg border border-white/20 bg-background p-6 text-center text-foreground shadow-2xl"
            dir="rtl"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 330, damping: 24 }}
          >
            <div className="mx-auto mb-5 flex justify-center">
              <div className="relative aspect-[1075/988] w-36 sm:w-40">
                {iconLayers.map((layer, index) => (
                  <div
                    key={layer}
                    className="level-complete-icon-layer absolute inset-0"
                    style={{ animationDelay: `${index * 115}ms` }}
                  >
                    <img
                      src={`/complete/${layer}.png`}
                      alt=""
                      aria-hidden="true"
                      className="block h-full w-full object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <h2
              id="level-complete-title"
              className="text-2xl font-bold leading-tight"
            >
              סיימת את השאלון {questionnaireName}
            </h2>

            <div className="mt-6 flex justify-center">
              <Button type="button" size="lg" onClick={onContinue} autoFocus>
                המשך
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
