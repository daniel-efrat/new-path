import React from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { QuestionnaireError, getErrorSeverity, formatErrorForUser } from '@/lib/errors/questionnaire'
import { RetryDialog } from './RetryDialog'

interface Props {
  children: ReactNode
  onError?: (error: QuestionnaireError) => void
  maxRetries?: number
  fallback?: ReactNode
}

interface State {
  error: QuestionnaireError | null
  retryCount: number
}

export class QuestionnaireErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    error: null,
    retryCount: 0
  }

  public static getDerivedStateFromError(error: unknown): State {
    return {
      error: QuestionnaireError.from(error),
      retryCount: 0
    }
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    const questionnaireError = QuestionnaireError.from(error)

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(questionnaireError)
    }

    // Log to error reporting service
    console.error('Questionnaire error:', {
      error: questionnaireError,
      componentStack: info.componentStack
    })
  }

  private handleRetry = (): void => {
    this.setState(prevState => ({
      error: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  public render(): ReactNode {
    const { error, retryCount } = this.state
    const { children, maxRetries = 3, fallback } = this.props

    if (error) {
      if (fallback) {
        return fallback
      }

      const severity = getErrorSeverity(error)
      const message = formatErrorForUser(error)
      const canRetry = retryCount < maxRetries

      return (
        <RetryDialog
          error={error}
          severity={severity}
          message={message}
          onRetry={this.handleRetry}
          canRetry={canRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
        />
      )
    }

    return children
  }
}

export function withQuestionnaireErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P> {
  return function WithQuestionnaireErrorBoundary(props: P) {
    return (
      <QuestionnaireErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </QuestionnaireErrorBoundary>
    )
  }
}

// Hook for easier usage in functional components
export const useQuestionnaireErrorBoundary = () => ({
  ErrorBoundary: QuestionnaireErrorBoundary,
  withErrorBoundary: withQuestionnaireErrorBoundary,
  errorBoundaryRef: React.createRef<QuestionnaireErrorBoundary>()
})
