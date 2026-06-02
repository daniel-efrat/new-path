"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const iconLayers = [1, 2, 3, 4, 5, 6, 7];

interface LevelCompleteModalProps {
  isOpen: boolean;
  questionnaireName: string;
  onContinue: () => void;
}

const completionLines = [
  "רשמתי בלוח: חקר, גילוי, תכנון, הצלחה. כן, אני אוהב וי ירוק.",
  "עניתם על שאלון שלם בלי להפוך לשאלון בעצמכם. הישג מדעי בהחלט.",
  "הנתונים בדרך לעשות סדר. אני בדרך לסדר את השיער, משימה מורכבת יותר.",
  "עוד שכבה של עתיד התבהרה. במעבדה קוראים לזה רגע קטן של נחת.",
];

function getCompletionLine(questionnaireName: string) {
  const seed = Array.from(questionnaireName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return completionLines[seed % completionLines.length];
}

export default function LevelCompleteModal({
  isOpen,
  questionnaireName,
  onContinue,
}: LevelCompleteModalProps) {
  const completionLine = getCompletionLine(questionnaireName);

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
            className="grid w-full max-w-2xl overflow-hidden rounded-lg border border-white/20 bg-white text-slate-950 shadow-2xl sm:grid-cols-[1fr_210px]"
            dir="rtl"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 330, damping: 24 }}
          >
            <div className="p-6 text-center sm:p-8">
              <div className="mx-auto mb-5 flex justify-center">
                <div className="relative aspect-[1075/988] w-28 sm:w-32">
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

              <p className="mb-2 text-sm font-semibold text-blue-800">
                גילברט מאשר התקדמות
              </p>
              <h2
                id="level-complete-title"
                className="text-2xl font-bold leading-tight"
              >
                סיימת את השאלון {questionnaireName}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-700">
                {completionLine}
              </p>

              <div className="mt-6 flex justify-center">
                <Button type="button" size="lg" onClick={onContinue} autoFocus>
                  המשך
                </Button>
              </div>
            </div>

            <div className="relative hidden min-h-full overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-amber-50 sm:block">
              <motion.div
                className="absolute right-8 top-10 h-12 w-12 rounded-full bg-amber-300/80 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
              <motion.img
                src="/gilbert.png"
                alt="גילברט פיינשטיין"
                className="absolute bottom-0 left-1/2 h-[108%] max-h-[330px] -translate-x-1/2 object-contain drop-shadow-2xl"
                draggable={false}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
