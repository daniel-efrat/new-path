import React from 'react'
import { 
  QuestionnaireErrorBoundary,
  withQuestionnaireErrorBoundary,
  useQuestionnaireErrorBoundary 
} from '@/components/questionnaire/QuestionnaireErrorBoundary'
import { QuestionnaireError } from '@/lib/errors/questionnaire'

// Types for error handling
export interface ErrorHandlerProps {
  onError?: (error: QuestionnaireError) => void
  maxRetries?: number
  fallback?: React.ReactNode
}

export interface ErrorBoundaryProps extends ErrorHandlerProps {
  children?: React.ReactNode
}

export interface ErrorHandlingHook {
  ErrorBoundary: typeof QuestionnaireErrorBoundary
  withErrorBoundary: <P extends object>(
    Component: React.ComponentType<P>,
    props?: ErrorHandlerProps
  ) => React.ComponentType<P>
  withErrorHandling: <P extends object>(
    handler: (props: P) => React.ReactNode | Promise<React.ReactNode>,
    props?: ErrorHandlerProps
  ) => React.ComponentType<P>
  errorBoundaryRef: React.RefObject<QuestionnaireErrorBoundary>
}

// Helper component for handling async content
interface AsyncContentProps {
  promise: Promise<React.ReactNode>
  fallback?: React.ReactNode
}

const AsyncContent: React.FC<AsyncContentProps> = ({ promise, fallback = null }) => {
  const [content, setContent] = React.useState<React.ReactNode>(fallback)
  const [error, setError] = React.useState<QuestionnaireError | null>(null)

  React.useEffect(() => {
    let mounted = true

    promise
      .then((result) => {
        if (mounted) {
          setContent(result)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(QuestionnaireError.from(err))
        }
      })

    return () => {
      mounted = false
    }
  }, [promise])

  if (error) {
    throw error
  }

  return React.createElement(React.Fragment, null, content)
}

// Create error handling HOC
export function createErrorHandler<P extends object>(
  handler: (props: P) => React.ReactNode | Promise<React.ReactNode>,
  errorBoundaryProps?: ErrorHandlerProps
): React.ComponentType<P> {
  const ErrorHandler: React.FC<P> = (props) => {
    try {
      const result = handler(props)
      if (result instanceof Promise) {
        return React.createElement(AsyncContent, { promise: result })
      }
      return React.createElement(React.Fragment, null, result)
    } catch (error) {
      throw QuestionnaireError.from(error)
    }
  }

  // Preserve display name for debugging
  ErrorHandler.displayName = `ErrorHandler(${handler.name || 'Anonymous'})`

  return withQuestionnaireErrorBoundary(ErrorHandler, errorBoundaryProps)
}

// Create form error handler
export function createFormErrorHandler<T extends object, R>(
  handler: (data: T) => Promise<R>,
  errorBoundaryProps?: ErrorHandlerProps
): (data: T) => Promise<R> {
  return async (data: T): Promise<R> => {
    try {
      return await handler(data)
    } catch (error) {
      throw QuestionnaireError.from(error)
    }
  }
}

// Export error handling utilities
export const useErrorHandling = (): ErrorHandlingHook => {
  const { ErrorBoundary, errorBoundaryRef } = useQuestionnaireErrorBoundary()

  const withErrorHandling = <P extends object>(
    handler: (props: P) => React.ReactNode | Promise<React.ReactNode>,
    errorBoundaryProps?: ErrorHandlerProps
  ): React.ComponentType<P> => createErrorHandler(handler, errorBoundaryProps)

  return {
    ErrorBoundary,
    withErrorBoundary: withQuestionnaireErrorBoundary,
    withErrorHandling,
    errorBoundaryRef
  }
}

// Export types and utilities
export type { 
  QuestionnaireError,
  QuestionnaireErrorBoundary
}

export {
  withQuestionnaireErrorBoundary as withErrorBoundary
}

// Create protected component HOC
export function createProtectedComponent<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: ErrorHandlerProps
): React.ComponentType<P> {
  const ProtectedComponent = withQuestionnaireErrorBoundary(Component, errorBoundaryProps)
  ProtectedComponent.displayName = `Protected(${Component.displayName || Component.name || 'Component'})`
  return ProtectedComponent
}
