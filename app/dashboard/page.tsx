"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStepStore } from "@/lib/stores/stepStore";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuestionnaireProgress from "@/components/ui/QuestionnaireProgress";
import { Check, House, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, MotionConfig } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
}

/** Kill any injected rotate in Framer's composed transform (debug-only) */
const noRotate = (_props: any, transform: string) =>
  transform
    .replace(/rotate3d\([^)]*\)/g, "rotate3d(0,0,0,0deg)")
    .replace(/rotate\([^)]*\)/g, "rotate(0deg)");

export default function QuestionnaireDashboard() {
  const { steps, setStepCompletion, resetSteps, initializeSteps, ensureUser } =
    useStepStore();
  const { setCurrentStep, initialize } = useQuestionnaireStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [storeReady, setStoreReady] = useState(false);
  const router = useRouter();

  const stepDetails = [
    {
      id: 1,
      title: "תכונות ליבה",
      description: "סמן/י 8 חוזקות אישיוּת מובילות",
      time: "לא מוגבל בזמן",
    },
    {
      id: 2,
      title: "מבחן שפה - עברית",
      description: "10 שאלות - מבחן אמריקאי",
      time: "20 שניות לשאלה",
    },
    {
      id: 3,
      title: "מבחן שפה - אנגלית",
      description: "10 שאלות - מבחן אמריקאי",
      time: "40 שניות לשאלה",
    },
    {
      id: 4,
      title: "עוגני קריירה",
      description: "24 שאלות",
      time: "לא מוגבל בזמן",
    },
    {
      id: 5,
      title: "מבחן לוגיקה",
      description: "20 שאלות לוגיקה",
      time: "90 שניות לשאלה",
    },
    {
      id: 6,
      title: "מבחן מתמטיקה",
      description: "20 שאלות מתמטיקה",
      time: "90 שניות לשאלה",
    },
    {
      id: 7,
      title: "מבחן צורות חזותי",
      description: "15 שאלות",
      time: "45 שניות לשאלה",
    },
    {
      id: 8,
      title: "מבחן ידע בסיסי במחשב",
      description: "15 שאלות",
      time: "45 שניות לשאלה",
    },
    {
      id: 9,
      title: "מבדק קשב, סינון מידע וזיכרון",
      description: "15 שאלות",
      time: "20 שניות לשאלה",
    },
    { id: 10, title: "מבחני אישיות", description: "", time: "לא מוגבל בזמן" },
    {
      id: 11,
      title: "שאלון הולנד",
      description: "20 שאלות",
      time: "לא מוגבל בזמן",
    },
    {
      id: 12,
      title: "נטיות לב",
      description:
        "תן/י ציונים לתחומים מקצועיים כלליים (סמן/י עד 5 תחומים כלליים בעדיפות)",
      time: "90 שניות לשאלה",
    },
  ];

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!user) return;
      await ensureUser(user.id);
      initializeSteps();
      setStoreReady(true);
    };
    if (isAuthenticated) initializeDashboard();
  }, [isAuthenticated, user, ensureUser, initializeSteps]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth error:", error);
          setIsAuthenticated(false);
          router.push("/signin");
          return;
        }
        if (!session) {
          setIsAuthenticated(false);
          router.push("/signin");
          return;
        }
        setUser(session.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        router.push("/signin");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "SIGNED_OUT" || !session) {
        resetSteps();
        useStepStore.setState({ userId: undefined });
        setIsAuthenticated(false);
        setUser(null);
        router.push("/signin");
      } else if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        useStepStore.getState().ensureUser(session.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, resetSteps]);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (isAuthenticated && user?.id) {
        setStoreReady(false);
        await ensureUser(user.id);
        initializeSteps();
        try {
          await initialize();
        } catch (error) {
          console.error("Failed to initialize questionnaire store:", error);
        } finally {
          setStoreReady(true);
        }
      }
    };
    initializeDashboard();
  }, [isAuthenticated, user, initializeSteps, initialize, ensureUser]);

  const handleStepClick = (stepId: number) => {
    const step = steps.find((s: any) => s.id === stepId);
    if (step && !step.isLocked) {
      setCurrentStep(stepId);
      router.push("/questionnaire");
    }
  };

  const toggleStepCompletion = (stepId: number) => {
    const step = steps.find((s: any) => s.id === stepId);
    if (step) setStepCompletion(stepId, !step.isCompleted);
  };

  const completedSteps = steps.filter((step: any) => step.isCompleted).length;
  const progressPercentage =
    steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  // Loading (keep spinner working — no noRotate here)
  if (isAuthenticated === null || !storeReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground">בודק הרשאות...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full flex mt-4 flex-col items-center max-w-4xl mx-auto px-2">
        {/* Header (force rotate=0 & strip any injected rotate) */}
        <motion.div
          className="mb-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: -20, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7 }}
          transformTemplate={noRotate}
        >
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            // transformTemplate={noRotate}
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mt-6">
                שאלון הערכה מקצועית
              </h1>
              <p className="text-muted-foreground mt-1">
                השלים/י את כל השלבים כדי לקבל המלצות מותאמות אישית
              </p>
            </div>
          </motion.div>

          {/* Progress Overview (test with reducedMotion and noRotate) */}
          <MotionConfig reducedMotion="never">
            <motion.div
              initial={{ opacity: 0, y: -20, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              transformTemplate={noRotate}
            >
              <QuestionnaireProgress
                value={progressPercentage}
                completed={completedSteps}
                total={steps.length}
              />
            </motion.div>
          </MotionConfig>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 max-w-4xl w-full">
          {stepDetails.map((details, index) => {
            const step = steps.find((s: any) => s.id === details.id) || {
              isCompleted: false,
              isLocked: true,
            };
            return (
              <motion.div
                key={details.id}
                initial={{ opacity: 0, y: 20, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                // transformTemplate={noRotate}
              >
                <Card
                  className={cn(
                    "transition-all hover:shadow-md cursor-pointer border-2",
                    step.isCompleted
                      ? "border-green-200 bg-green-50/50"
                      : step.isLocked
                      ? "border-gray-200 bg-gray-50/50"
                      : "border-blue-200 bg-blue-50/50 hover:border-blue-300"
                  )}
                  onClick={() => handleStepClick(details.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      {/* Step Icon */}
                      <div className="flex gap-4">
                        <motion.div
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                            step.isCompleted
                              ? "bg-secondary text-secondary-foreground"
                              : step.isLocked
                              ? "bg-gray-300 text-gray-500"
                              : "bg-primary text-white"
                          )}
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: (700 + index * 100) / 1000,
                          }}
                          // transformTemplate={noRotate}
                        >
                          {step.isCompleted ? (
                            <Check className="h-6 w-6" />
                          ) : step.isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </motion.div>

                        {/* Step Content */}
                        <motion.div
                          className="flex-1"
                          initial={{ opacity: 0, x: 20, rotate: 0 }}
                          animate={{ opacity: 1, x: 0, rotate: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: (800 + index * 150) / 1000,
                          }}
                          // transformTemplate={noRotate}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                              {details.title}
                            </h3>
                            {step.isCompleted && (
                              <Badge
                                variant="secondary"
                                className="bg-secondary text-secondary-foreground hidden sm:block"
                              >
                                הושלם
                              </Badge>
                            )}
                            {step.isLocked && (
                              <Badge
                                variant="outline"
                                className="border-gray-300 text-gray-500 hidden sm:block"
                              >
                                נעול
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {details.description}
                          </p>
                        </motion.div>
                      </div>

                      {/* Action Button */}
                      <motion.div
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0, rotate: 0 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: (1000 + index * 150) / 1000,
                        }}
                        // transformTemplate={noRotate}
                      >
                        <div className="flex sm:flex-col justify-start gap-2">
                          <Button
                            variant={
                              step.isCompleted
                                ? "default"
                                : step.isLocked
                                ? "ghost"
                                : "default"
                            }
                            disabled={step.isLocked}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (step.isCompleted) {
                                setCurrentStep(details.id);
                                router.push("/questionnaire");
                              } else if (!step.isLocked) {
                                handleStepClick(details.id);
                              }
                            }}
                          >
                            {step.isCompleted
                              ? "תוצאות"
                              : step.isLocked
                              ? "נעול"
                              : "התחל"}
                          </Button>

                          {!step.isLocked && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStepCompletion(details.id);
                              }}
                            >
                              {step.isCompleted ? "בטל השלמה" : "סמן כהושלם"}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <motion.div
          className="my-8 flex justify-between items-center"
          initial={{ opacity: 0, y: 20, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          // transformTemplate={noRotate}
        >
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => router.push("/")}
          >
            חזור לדף הבית
            <House className="h-4 w-4" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (
                  window.confirm("האם אתה בטוח שברצונך לאפס את כל ההתקדמות?")
                ) {
                  resetSteps();
                }
              }}
            >
              אפס התקדמות
            </Button>
            <Button
              disabled={completedSteps !== steps.length}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              סיים ושלח שאלון
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
