"use client"

import { useEffect, useRef } from "react"
import { Button } from "./button"
import { ANIMATION_DURATIONS } from "@/lib/constants/questionnaire"

export interface RetryDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
  attempt?: number
  maxAttempts?: number
  error?: Error
  /** Custom class for the overlay */
  overlayClassName?: string
  /** Custom class for the dialog */
  dialogClassName?: string
  /** Whether to show animation */
  animate?: boolean
}

export function RetryDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = "הפעולה נכשלה. האם לנסות שוב?",
  attempt = 1,
  maxAttempts = 3,
  error,
  overlayClassName = "",
  dialogClassName = "",
  animate = true,
}: RetryDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const lastActiveElement = useRef<HTMLElement | null>(null)

  // Store last active element and focus dialog
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement
      dialogRef.current?.focus()

      // Prevent body scroll
      document.body.style.overflow = "hidden"
    } else {
      // Restore focus and scroll
      lastActiveElement.current?.focus()
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on escape
      if (e.key === "Escape") {
        onCancel()
        return
      }

      // Focus trap
      if (e.key === "Tab") {
        const dialog = dialogRef.current
        if (!dialog) return

        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstFocusable = focusableElements[0] as HTMLElement
        const lastFocusable = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const overlayClasses =
    `fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50
    ${animate ? "animate-in fade-in duration-${ANIMATION_DURATIONS.FADE}" : ""}
    ${overlayClassName}`.trim()

  const dialogClasses =
    `bg-white  rounded-lg shadow-xl max-w-md w-full p-6 space-y-4
    ${
      animate
        ? "animate-in zoom-in-95 duration-${ANIMATION_DURATIONS.TRANSITION}"
        : ""
    }
    ${dialogClassName}`.trim()

  return (
    <div
      className={overlayClasses}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="retry-dialog-title"
      aria-describedby="retry-dialog-description"
    >
      <div
        ref={dialogRef}
        className={dialogClasses}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2
          id="retry-dialog-title"
          className="text-xl font-semibold text-right"
        >
          שגיאה
        </h2>

        <div className="space-y-2">
          <p
            id="retry-dialog-description"
            className="text-muted-foreground  text-right"
          >
            {message}
          </p>

          {/* Attempt counter */}
          <div
            className="text-sm text-gray-500 text-right"
            role="status"
            aria-live="polite"
          >
            ניסיון {attempt} מתוך {maxAttempts}
          </div>

          {/* Error details in development */}
          {process.env.NODE_ENV === "development" && error && (
            <pre
              className="text-xs text-destructive bg-red-50 p-2 rounded mt-2 overflow-auto max-h-32 text-right"
              role="alert"
            >
              {error.message}
            </pre>
          )}
        </div>

        <div className="flex justify-start gap-3 pt-4 border-t">
          <Button
            onClick={onConfirm}
            variant="default"
            className="min-w-[100px]"
            autoFocus
          >
            נסה שוב
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="min-w-[100px]"
          >
            ביטול
          </Button>
        </div>
      </div>
    </div>
  )
}
