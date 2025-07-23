"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useStepStore } from "@/lib/stores/stepStore"
import { useQuestionnaireStore } from "@/lib/stores/questionnaireStore"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import QuestionnaireProgress from "@/components/ui/QuestionnaireProgress"
import { Check, ChevronLeft, Play, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  title: string
  description: string
  isCompleted: boolean
  isLocked: boolean
}

export default function QuestionnaireDashboard() {
  const {
    steps,
    setStepCompletion,
    initializeSteps,
    resetFromStep,
    resetSteps,
  } = useStepStore()
  const { setCurrentStep } = useQuestionnaireStore()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const stepDetails = [
    {
      id: 1,
      title: "תכונות ועוגני קריירה",
      description: "בחר את התכונות המאפיינות אותך וענה על שאלון הקריירה",
    },
    {
      id: 2,
      title: "תרגיל ערכים ועבודה",
      description: "סמן את הערכים שיתווספו לתעודת הזהות שלך",
    },
    {
      id: 3,
      title: "משפטי ייעוד מקצועיים",
      description: "ספר לנו על הניסיון והכישורים המקצועיים שלך",
    },
    {
      id: 4,
      title: "תעודת זהות תעסוקתית",
      description: "סיכום הנתונים שלך עד כה",
    },
    {
      id: 5,
      title: "סיכום ואישור",
      description: "סקור את כל המידע ואשר את השלמת השאלון",
    },
  ]

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth error:", error)
          setIsAuthenticated(false)
          router.push("/signin")
          return
        }

        if (!session) {
          setIsAuthenticated(false)
          router.push("/signin")
          return
        }

        setUser(session.user)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        router.push("/signin")
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false)
        setUser(null)
        router.push("/signin")
      } else if (session) {
        setUser(session.user)
        setIsAuthenticated(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Initialize steps if none exist
  useEffect(() => {
    if (steps.length === 0 && isAuthenticated) {
      initializeSteps()
    }
  }, [steps.length, initializeSteps, isAuthenticated])

  const completedSteps = steps.filter((step: any) => step.isCompleted).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const handleStepClick = (stepId: number) => {
    const step = steps.find((s: any) => s.id === stepId)
    if (step && !step.isLocked) {
      if (step.isCompleted) {
        // Reset this step and all following steps when editing
        resetFromStep(stepId)
      }
      setCurrentStep(stepId)
      router.push(`/questionnaire`)
    }
  }

  const toggleStepCompletion = (stepId: number) => {
    const step = steps.find((s: any) => s.id === stepId)
    if (step && !step.isLocked) {
      setStepCompletion(stepId, !step.isCompleted)
    }
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">בודק הרשאות...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-24"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-right duration-500 delay-200">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mt-6">
                שאלון הערכה מקצועית
              </h1>
              <p className="text-muted-foreground mt-1">
                השלם את כל השלבים כדי לקבל המלצות מותאמות אישית
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <QuestionnaireProgress
            value={progressPercentage}
            completed={completedSteps}
            total={steps.length}
            className="animate-in slide-in-from-left duration-600 delay-300"
          />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {stepDetails.map((details, index) => {
            const step = steps.find((s: any) => s.id === details.id) || {
              isCompleted: false,
              isLocked: true,
            }
            return (
              <Card
                key={details.id}
                className={cn(
                  "transition-all hover:shadow-md cursor-pointer border-2 animate-in slide-in-from-bottom duration-500",
                  step.isCompleted
                    ? "border-green-200 bg-green-50/50"
                    : step.isLocked
                    ? "border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60"
                    : "border-blue-200 bg-white hover:border-blue-300"
                )}
                style={{
                  animationDelay: `${500 + index * 150}ms`,
                  animationFillMode: "both",
                }}
                onClick={() => handleStepClick(details.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Step Icon */}
                    <div className="flex gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 animate-in zoom-in",
                          step.isCompleted
                            ? "bg-secondary text-white"
                            : step.isLocked
                            ? "bg-gray-300 text-gray-500"
                            : "bg-blue-500 text-white"
                        )}
                        style={{
                          animationDelay: `${700 + index * 150}ms`,
                          animationFillMode: "both",
                        }}
                      >
                        {step.isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : step.isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div
                        className="flex-1 animate-in slide-in-from-right duration-400"
                        style={{
                          animationDelay: `${800 + index * 150}ms`,
                          animationFillMode: "both",
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className="text-lg sm:text-xl
                          
                          font-semibold text-foreground"
                          >
                            שלב {details.id}: {details.title}
                          </h3>
                          {step.isCompleted && (
                            <Badge
                              variant="default"
                              className="bg-secondary text-white animate-in slide-in-from-right duration-300 hidden sm:block"
                              style={{
                                animationDelay: `${900 + index * 150}ms`,
                                animationFillMode: "both",
                              }}
                            >
                              הושלם ✓
                            </Badge>
                          )}
                          {step.isLocked && (
                            <Badge
                              variant="secondary"
                              className="bg-gray-200 text-muted-foreground"
                            >
                              נעול
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-base leading-relaxed">
                          {details.description}
                        </p>
                      </div>
                    </div>
                    {/* Action Button */}
                    <div
                      className="flex flex-col gap-2 animate-in fade-in duration-400"
                      style={{
                        animationDelay: `${1000 + index * 150}ms`,
                        animationFillMode: "both",
                      }}
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
                          className={cn(
                            "transition-all duration-200",
                            step.isCompleted &&
                              "border-green-500 text-green-700 hover:bg-green-50"
                          )}
                        >
                          {step.isCompleted
                            ? "עריכה"
                            : step.isLocked
                            ? "נעול"
                            : "התחל"}
                        </Button>

                        {/* Demo toggle button */}
                        {!step.isLocked && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStepCompletion(details.id)
                            }}
                            className="text-xs"
                          >
                            {step.isCompleted ? "בטל השלמה" : "סמן כהושלם"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center animate-in slide-in-from-bottom duration-600 delay-1000">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="h-4 w-4" />
            חזור לדף הבית
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (
                  window.confirm("האם אתה בטוח שברצונך לאפס את כל ההתקדמות?")
                ) {
                  resetSteps()
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
        </div>
      </div>
    </div>
  )
}
