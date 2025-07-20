import React from 'react'
import type { ErrorSeverity, QuestionnaireError } from '@/lib/errors/questionnaire'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface RetryDialogProps {
  error: QuestionnaireError
  severity: ErrorSeverity
  message: string
  onRetry: () => void
  canRetry: boolean
  retryCount: number
  maxRetries: number
}

const severityIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const severityColors = {
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info'
}

const severityTitles = {
  error: 'Error',
  warning: 'Warning',
  info: 'Notice'
}

export function RetryDialog({
  error,
  severity,
  message,
  onRetry,
  canRetry,
  retryCount,
  maxRetries
}: RetryDialogProps) {
  const Icon = severityIcons[severity]
  const colorClass = severityColors[severity]
  const title = severityTitles[severity]

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={colorClass} data-testid={`${severity}-icon`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogDescription>
          <p className="text-muted-foreground mb-4">{message}</p>
          <p className="text-sm text-muted-foreground">Error details: {error.message}</p>
          {canRetry && (
            <p className="text-sm text-muted-foreground mt-2">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
        </DialogDescription>

        <div className="flex justify-end gap-2">
          {canRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              disabled={!canRetry}
            >
              Retry
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
