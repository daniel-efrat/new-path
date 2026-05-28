"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStepStore } from "@/lib/stores/stepStore";
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore";
import { useStep12Store } from "@/lib/stores/step12Store";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuestionnaireProgress from "@/components/ui/QuestionnaireProgress";
import { Check, House, Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, MotionConfig } from "framer-motion";
import {
  STEP2_QUESTIONS,
  STEP3_QUESTIONS,
  STEP4_QUESTIONS,
  STEP7_QUESTIONS,
  STEP8_QUESTIONS,
  STEP10_QUESTIONS,
  STEP11_QUESTIONS,
} from "@/lib/constants/questions";

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
  const {
    steps,
    setStepCompletion,
    resetSteps,
    resetProgress,
    initializeSteps,
    ensureUser,
  } = useStepStore();
  const { setCurrentStep, initialize, reset: resetQuestionnaire } =
    useQuestionnaireStore();
  const { ensureUser: ensureStep12User, reset: resetStep12 } =
    useStep12Store();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [storeReady, setStoreReady] = useState(false);
  const router = useRouter();

  const stepDetails = [
    {
      id: 1,
      group: "שאלון 1",
      title: "תכונות ליבה",
      description: "בחר/י עד 10 תכונות מובילות",
      time: "לא מוגבל בזמן",
    },
    {
      id: 2,
      group: "שאלון 1",
      title: "עוגני קריירה",
      description: `${STEP4_QUESTIONS.length} שאלות`,
      time: "לא מוגבל בזמן",
    },
    {
      id: 3,
      group: "שאלון 1",
      title: "שאלון הולנד",
      description: `${STEP11_QUESTIONS.length} שאלות`,
      time: "לא מוגבל בזמן",
    },
    {
      id: 4,
      group: "שאלון 1",
      title: "משפטי ייעוד",
      description:
        "תן/י ציונים לתחומים מקצועיים כלליים (סמן/י עד 5 תחומים כלליים בעדיפות)",
      time: "לא מוגבל בזמן",
    },
    {
      id: 5,
      group: "שאלון 2",
      title: "מבחן שפה - עברית",
      description: `${STEP2_QUESTIONS.length} שאלות - מבחן אמריקאי`,
      time: "20 שניות לשאלה",
    },
    {
      id: 6,
      group: "שאלון 2",
      title: "מבחן שפה - אנגלית",
      description: `${STEP3_QUESTIONS.length} שאלות - מבחן אמריקאי`,
      time: "40 שניות לשאלה",
    },
    {
      id: 7,
      group: "שאלון 2",
      title: "מבחן לוגיקה",
      description: "20 שאלות לוגיקה",
      time: "90 שניות לשאלה",
    },
    {
      id: 8,
      group: "שאלון 2",
      title: "מבחן מתמטיקה",
      description: "20 שאלות מתמטיקה",
      time: "90 שניות לשאלה",
    },
    {
      id: 9,
      group: "שאלון 2",
      title: "מבחן צורות חזותי",
      description: `${STEP7_QUESTIONS.length} שאלות`,
      time: "45 שניות לשאלה",
    },
    {
      id: 10,
      group: "שאלון 2",
      title: "מבחן ידע בסיסי במחשב",
      description: `${STEP8_QUESTIONS.length} שאלות`,
      time: "45 שניות לשאלה",
    },
    {
      id: 11,
      group: "שאלון 2",
      title: "מבדק קשב, סינון מידע וזיכרון",
      description: "15 שאלות",
      time: "20 שניות לשאלה",
    },
    {
      id: 12,
      group: "שאלון 2",
      title: "מבחני אישיות",
      description: `${STEP10_QUESTIONS.length} היגדים`,
      time: "לא מוגבל בזמן",
    },
    {
      id: 13,
      group: "שאלון 2",
      title: "ליבת הערכים אישיים",
      description: "בחירת ערכים",
      time: "לא מוגבל בזמן",
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        resetQuestionnaire();
        resetStep12();
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
  }, [router, resetQuestionnaire, resetStep12, resetSteps]);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (isAuthenticated && user?.id) {
        setStoreReady(false);
        await Promise.all([ensureUser(user.id), ensureStep12User(user.id)]);
        await initializeSteps();
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
  }, [
    isAuthenticated,
    user,
    initializeSteps,
    initialize,
    ensureUser,
    ensureStep12User,
  ]);

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

  const HIDDEN_STEP_IDS = new Set<number>();
  const visibleSteps = steps.filter((s: any) => !HIDDEN_STEP_IDS.has(s.id));
  const visibleCompletedSteps = visibleSteps.filter(
    (s: any) => s.isCompleted
  ).length;
  const visibleTotalSteps = visibleSteps.length;
  const progressPercentage =
    visibleTotalSteps > 0
      ? (visibleCompletedSteps / visibleTotalSteps) * 100
      : 0;

  // Loading (keep spinner working — no noRotate here)
  if (isAuthenticated === null || !storeReady) {
    return (
      <div
        className="dashboard-glass-page min-h-screen w-full flex items-center justify-center"
        dir="rtl"
      >
        <div className="relative z-[1] flex flex-col items-center justify-center">
          <motion.div
            className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
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
      className="dashboard-glass-page min-h-screen bg-transparent flex items-center justify-center"
      dir="rtl"
    >
      <div className="relative z-[1] w-full flex mt-4 flex-col items-center max-w-4xl mx-auto px-3 sm:px-4">
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
              <h1 className="text-3xl font-bold text-white/95 mt-6 tracking-tight">
                שאלון הערכה מקצועית
              </h1>
              <p className="text-white/90 mt-1">
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
                completed={visibleCompletedSteps}
                total={visibleTotalSteps}
                className="dashboard-progress-panel"
              />
            </motion.div>
          </MotionConfig>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 max-w-4xl w-full">
          {stepDetails
            .filter((details) => !HIDDEN_STEP_IDS.has(details.id))
            .map((details, index) => {
              const step = steps.find((s: any) => s.id === details.id) || {
                isCompleted: false,
                isLocked: true,
              };
              const effectiveLocked = step.isLocked;
              const previousDetails = stepDetails[index - 1];
              const showGroupTitle =
                !previousDetails || previousDetails.group !== details.group;
              return (
                <div key={details.id}>
                  {showGroupTitle && (
                    <h2 className="px-1 pt-2 text-xl font-bold text-white/95">
                      {details.group}
                    </h2>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20, rotate: 0 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                  <Card
                    className={cn(
                      "dashboard-glass-card transition-all duration-300",
                      step.isCompleted
                        ? "dashboard-glass-card--complete"
                        : effectiveLocked
                        ? "dashboard-glass-card--locked"
                        : "dashboard-glass-card--active",
                      effectiveLocked ? "cursor-default" : "cursor-pointer"
                    )}
                    onClick={() => handleStepClick(details.id)}
                  >
                    <CardContent className="relative z-[1] p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        {/* Step Icon */}
                        <div className="flex gap-4">
                          {!effectiveLocked && (
                            <motion.div
                              className={cn(
                                "dashboard-step-orb flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                step.isCompleted
                                  ? "dashboard-step-orb--complete"
                                  : "dashboard-step-orb--active"
                              )}
                              initial={{ scale: 0, rotate: 0 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: (700 + index * 100) / 1000,
                              }}
                            >
                              {step.isCompleted ? (
                                <Check className="h-6 w-6" />
                              ) : (
                                <Play className="h-5 w-5" />
                              )}
                            </motion.div>
                          )}

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
                              <h3 className="text-lg sm:text-xl font-semibold text-white/95">
                                {details.title}
                              </h3>
                              {step.isCompleted && (
                                <Badge
                                  variant="secondary"
                                  className="dashboard-glass-badge hidden sm:block"
                                >
                                  הושלם
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/90 text-base leading-relaxed">
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
                          {effectiveLocked ? (
                            <motion.div
                              className="dashboard-step-orb dashboard-step-orb--locked flex items-center justify-center w-12 h-12 rounded-full"
                              initial={{ scale: 0, rotate: 0 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: (700 + index * 100) / 1000,
                              }}
                              aria-label="נעול"
                            >
                              <Lock className="h-5 w-5" />
                            </motion.div>
                          ) : (
                            <div className="flex sm:flex-col justify-start gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className={cn(
                                  "dashboard-glass-button",
                                  !step.isCompleted &&
                                    "dashboard-glass-button--primary"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (step.isCompleted) {
                                    setCurrentStep(details.id);
                                    router.push("/questionnaire");
                                  } else {
                                    handleStepClick(details.id);
                                  }
                                }}
                              >
                                {step.isCompleted ? "תוצאות" : "התחל"}
                              </Button>

                              <Button
                                variant="secondary"
                                size="sm"
                                className="dashboard-glass-button dashboard-glass-button--subtle"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStepCompletion(details.id);
                                }}
                              >
                                {step.isCompleted ? "בטל השלמה" : "סמן כהושלם"}
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                </div>
              );
            })}
        </div>

        {/* Footer Actions */}
        <motion.div
          className="dashboard-glass-toolbar my-8 flex flex-wrap justify-between items-center gap-3 px-3 py-3 sm:px-4"
          initial={{ opacity: 0, y: 20, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Button
            variant="outline"
            className="dashboard-glass-button gap-2 bg-transparent"
            onClick={() => router.push("/")}
          >
            חזור לדף הבית
            <House className="h-4 w-4" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="dashboard-glass-button gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                if (
                  window.confirm("האם אתה בטוח שברצונך לאפס את כל ההתקדמות?")
                ) {
                  resetProgress();
                }
              }}
            >
              אפס התקדמות
            </Button>
            <Button
              disabled={visibleCompletedSteps !== visibleTotalSteps}
              className="dashboard-glass-button dashboard-glass-button--primary gap-2"
              onClick={() => router.push("/questionnaire/diagnostic")}
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
