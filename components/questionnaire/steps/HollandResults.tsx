"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStepStore } from "@/lib/stores/stepStore";
import { RIASEC_MAP } from "@/lib/constants/questions";

interface HollandResultsProps {
  onNext?: () => void;
  onPrevious: () => void;
}

export default function HollandResults({
  onNext,
  onPrevious,
}: HollandResultsProps) {
  const [results, setResults] = useState<{
    riasec_vector: Record<string, number>;
    riasec_code: string;
  } | null>(null);

  const hollandResults = useStepStore((state) => state.hollandResults);

  useEffect(() => {
    if (hollandResults) {
      setResults(hollandResults);
    }
  }, [hollandResults]);

  if (!results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-full"
      >
        <Card className="max-w-3xl mx-auto bg-white p-6">
          <CardContent>
            <p className="text-center text-gray-600">
              No Holland results available. Please complete Step 11 first.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={onPrevious}>חזור לשלב 11</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const { riasec_vector, riasec_code } = results;
  const topThree = riasec_code.split("").slice(0, 3);

  // Get full descriptions for top 3 codes
  const descriptions = topThree.map(
    (code) => RIASEC_MAP[code as keyof typeof RIASEC_MAP]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
      className="w-full"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        תוצאות שאלון הולנד
      </motion.h1>

      <Card className="max-w-3xl mx-auto bg-white p-6 mb-6">
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
                <div className="flex justify-center mb-2">
                  <img
                    src={desc.image}
                    alt={desc.name}
                    width={80}
                    height={80}
                    className="rounded-full"
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

      <Card className="max-w-3xl mx-auto bg-white p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4 text-center">
            האבחון המלא שלך
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(riasec_vector).map(([code, score]) => {
              const name = RIASEC_MAP[code as keyof typeof RIASEC_MAP]?.name ?? code;
              return (
                <div key={code} className="text-center p-2 border rounded">
                  <span className="font-semibold">{name}:</span> {score}%
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onPrevious}>
              שלב קודם
            </Button>
            <Button onClick={onNext}>המשך</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
