"use client"

import React, { createContext, useContext, useCallback, useState } from "react"
import { RetryDialog, type RetryDialogProps } from "./RetryDialog"
import { ANIMATION_DURATIONS } from "@/lib/constants/questionnaire"

interface DialogContextType {
  showRetryDialog: (props: Omit<RetryDialogProps, "isOpen">) => Promise<boolean>
}

const DialogContext = createContext<DialogContextType | null>(null)

interface DialogProviderProps {
  children: React.ReactNode
  /** Whether to show animations */
  animate?: boolean
  /** Custom classes for dialog overlay */
  overlayClassName?: string
  /** Custom classes for dialog content */
  dialogClassName?: string
}

export function DialogProvider({
  children,
  animate = true,
  overlayClassName,
  dialogClassName,
}: DialogProviderProps) {
  const [dialogState, setDialogState] = useState<{
    props: Omit<RetryDialogProps, "isOpen">
    resolve: (value: boolean) => void
  } | null>(null)

  const showRetryDialog = useCallback(
    (props: Omit<RetryDialogProps, "isOpen">): Promise<boolean> => {
      return new Promise((resolve) => {
        setDialogState({ props, resolve })
      })
    },
    []
  )

  const handleClose = useCallback(async (result: boolean) => {
    if (!dialogState) return

    // If animating, wait for animation to complete
    if (animate) {
      await new Promise((resolve) => 
        setTimeout(resolve, Math.max(ANIMATION_DURATIONS.FADE, ANIMATION_DURATIONS.TRANSITION))
      )
    }

    dialogState.resolve(result)
    setDialogState(null)
  }, [dialogState, animate])

  const handleConfirm = useCallback(() => {
    handleClose(true)
  }, [handleClose])

  const handleCancel = useCallback(() => {
    handleClose(false)
  }, [handleClose])

  return (
    <DialogContext.Provider value={{ showRetryDialog }}>
      {children}
      {dialogState && (
        <RetryDialog
          {...dialogState.props}
          isOpen={true}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          animate={animate}
          overlayClassName={overlayClassName}
          dialogClassName={dialogClassName}
        />
      )}
    </DialogContext.Provider>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider")
  }
  return context
}

export function withDialog<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithDialogComponent(props: P) {
    return (
      <DialogProvider>
        <WrappedComponent {...props} />
      </DialogProvider>
    )
  }
}
