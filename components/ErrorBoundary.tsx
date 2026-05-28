"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="bg-red-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                אירעה שגיאה בלתי צפויה
              </h2>
              <p className="text-red-800 mb-4">
                אנו מתנצלים על התקלה. נסה לרענן את הדף או לחזור מאוחר יותר.
              </p>
              <div className="space-x-2 rtl:space-x-reverse">
                <Button
                  onClick={() => window.location.reload()}
                  variant="destructive"
                >
                  רענן דף
                </Button>
                <Button
                  onClick={() => window.location.assign("/dashboard")}
                  variant="outline"
                >
                  ללוח הבקרה
                </Button>
              </div>
            </div>
            {process.env.NODE_ENV === "development" && (
              <div className="text-left bg-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                <pre className="text-xs text-red-800">
                  {this.state.error?.toString()}
                  {"\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
