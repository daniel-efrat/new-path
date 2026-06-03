"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStepStore } from "@/lib/stores/stepStore";
import { RIASEC_MAP } from "@/lib/constants/questions";
import supabase from "@/lib/supabase";

interface HollandResultsProps {
  onNext?: () => void;
  resultsMode?: boolean;
  onBackToReport?: () => void;
}

export default function HollandResults({
  onNext,
  resultsMode = false,
  onBackToReport,
}: HollandResultsProps) {
  const [results, setResults] = useState<{
    riasec_vector: Record<string, number>;
    riasec_code: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const hollandResults = useStepStore((state) => state.hollandResults);

  useEffect(() => {
    if (hollandResults) {
      setResults(hollandResults);
      setIsLoading(false);
      return;
    }

    const loadLatestResults = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadError("לא נמצאו תוצאות הולנד שמורות.");
          return;
        }

        const { data, error } = await supabase
          .from("holland_results")
          .select("riasec_vector, riasec_code")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          setLoadError("לא הצלחנו לטעון את תוצאות הולנד.");
          return;
        }

        if (!data) {
          setLoadError("לא נמצאו תוצאות הולנד שמורות.");
          return;
        }

        setResults({
          riasec_vector: data.riasec_vector as Record<string, number>,
          riasec_code: data.riasec_code,
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadLatestResults();
  }, [hollandResults]);

  if (isLoading || !results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-full"
      >
        <Card className="max-w-3xl mx-auto bg-white text-background p-6">
          <CardContent>
            <p className="text-center text-gray-600">
              {isLoading
                ? "טוען תוצאות הולנד..."
                : loadError ?? "לא נמצאו תוצאות הולנד שמורות."}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const { riasec_vector, riasec_code } = results;
  const topThree = riasec_code.split("").slice(0, 3);

  // Get full descriptions for top 3 codes
  const descriptions = topThree
    .map((code) => RIASEC_MAP[code as keyof typeof RIASEC_MAP])
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
      className="w-full mt-6"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        תוצאות שאלון הולנד
      </motion.h1>

      <Card className="max-w-3xl mx-auto bg-white text-background p-6 mb-6">
        <CardHeader>
          <CardTitle className="text-center">הקוד שלך: {riasec_code}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {descriptions.map((desc, index) => (
              <motion.div
                key={desc.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center p-4 border rounded-lg"
              >
                <div className="flex flex-col items-center mb-2">
                  <motion.div
                    className="relative w-24 h-24"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 10,
                      delay: index * 0.1,
                      bounce: 0.5,
                    }}
                  >
                    <img
                      src={desc.image}
                      alt={desc.name}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 1.6, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 10,
                      delay: index * 0.1 + 0.1,
                      bounce: 0.5,
                    }}
                    className="w-20 h-1 rounded-[50%] flex items-center justify-center mx-auto blur-[5px] bg-[#00000050]"
                  />
                </div>
                <h3 className="font-bold text-lg">
                  {desc.name} ({desc.code})
                </h3>
                <p className="text-sm text-gray-600 mt-2">{desc.description}</p>
                <p className="text-sm text-gray-800 mt-1">
                  <span className="font-semibold">אחוז:</span>{" "}
                  {riasec_vector[desc.code]}%
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl mx-auto bg-white text-background p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4 text-center">
            האבחון המלא שלך
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(riasec_vector).map(([code, score]) => {
              const name =
                RIASEC_MAP[code as keyof typeof RIASEC_MAP]?.name ?? code;
              return (
                <div
                  key={code}
                  className="text-center p-2 border text-background rounded"
                >
                  <span className="font-semibold">{name}:</span> {score}%
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-6">
            {resultsMode ? (
              <Button onClick={onBackToReport}>חזרה לדו״ח הראשי</Button>
            ) : (
              <Button onClick={onNext}>המשך</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
