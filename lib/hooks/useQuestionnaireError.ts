import { useState, useCallback } from 'react'
import { handleQuestionnaireError, QuestionnaireError, formatErrorForUser, getErrorSeverity, isRetryableError } from '@/lib/errors/questionnaire'
import { useQuestionnaireStore } from '@/lib/stores/questionnaireStore'

interface ErrorState {
  error: QuestionnaireError | null
  userMessage: string
  severity: 'error' | 'warning' | 'info'
  isRetryable: boolean
  retryCount: number
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

export function useQuestionnaireError() {
  const [state, setState] = useState<ErrorState>({
    error: null,
    userMessage: '',
    severity: 'error',
    isRetryable: false,
    retryCount: 0
  })

  const setError = useQuestionnaireStore(state => state.setError)

  const handleError = useCallback((error: unknown) => {
    const questionnaireError = handleQuestionnaireError(error)
    const userMessage = formatErrorForUser(questionnaireError)
    const severity = getErrorSeverity(questionnaireError)
    const canRetry = isRetryableError(questionnaireError)

    setState(prev => ({
      error: questionnaireError,
      userMessage,
      severity,
      isRetryable: canRetry && prev.retryCount < MAX_RETRIES,
      retryCount: prev.retryCount + (canRetry ? 1 : 0)
    }))

    setError(questionnaireError)

    return questionnaireError
  }, [setError])

  const clearError = useCallback(() => {
    setState({
      error: null,
      userMessage: '',
      severity: 'error',
      isRetryable: false,
      retryCount: 0
    })
    setError(null)
  }, [setError])

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (!state.isRetryable) return

    setState(prev => ({
      ...prev,
      error: null,
      userMessage: 'Retrying...',
      severity: 'info'
    }))

    try {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      await operation()
      clearError()
    } catch (error) {
      handleError(error)
    }
  }, [state.isRetryable, clearError, handleError])

  return {
    ...state,
    handleError,
    clearError,
    retry,
    hasMaxRetries: state.retryCount >= MAX_RETRIES,
    remainingRetries: MAX_RETRIES - state.retryCount
  }
}
