import { useState, useCallback, useRef } from 'react'
import { QuestionnaireError } from '@/lib/errors/questionnaire'
import { useQuestionnaireError } from './useQuestionnaireError'

interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  backoffFactor?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: QuestionnaireError) => void
  onSuccess?: () => void
  onFail?: (error: QuestionnaireError) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  onRetry: () => {},
  onSuccess: () => {},
  onFail: () => {},
}

interface RetryState {
  isRetrying: boolean
  attempts: number
  lastError: QuestionnaireError | null
}

export function useQuestionnaireRetry(options: RetryOptions = {}) {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    lastError: null,
  })

  const { handleError } = useQuestionnaireError()
  const abortControllerRef = useRef<AbortController>()
  
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const calculateDelay = useCallback((attempt: number) => {
    const delay = opts.initialDelay * Math.pow(opts.backoffFactor, attempt)
    return Math.min(delay, opts.maxDelay)
  }, [opts.initialDelay, opts.backoffFactor, opts.maxDelay])

  const sleep = useCallback((ms: number) => {
    return new Promise<void>(resolve => {
      const timeout = setTimeout(resolve, ms)
      abortControllerRef.current?.signal.addEventListener('abort', () => {
        clearTimeout(timeout)
        resolve()
      })
    })
  }, [])

  const retry = useCallback(async <T>(operation: () => Promise<T>): Promise<T> => {
    abortControllerRef.current = new AbortController()
    let lastError: QuestionnaireError | null = null
    
    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setState(prev => ({
            ...prev,
            isRetrying: true,
            attempts: attempt,
          }))
          
          const delay = calculateDelay(attempt - 1)
          await sleep(delay)
          
          opts.onRetry(attempt, lastError!)
        }

        const result = await operation()
        
        setState({
          isRetrying: false,
          attempts: 0,
          lastError: null,
        })
        
        opts.onSuccess()
        return result

      } catch (error) {
        lastError = handleError(error)
        
        setState(prev => ({
          ...prev,
          lastError,
        }))

        if (attempt === opts.maxRetries) {
          opts.onFail(lastError)
          throw lastError
        }
      }
    }

    // This should never be reached due to the throw above
    throw new Error('Unexpected retry loop completion')
  }, [opts, calculateDelay, sleep, handleError])

  const cancelRetry = useCallback(() => {
    abortControllerRef.current?.abort()
    setState({
      isRetrying: false,
      attempts: 0,
      lastError: null,
    })
  }, [])

  return {
    ...state,
    retry,
    cancelRetry,
    canRetry: state.attempts < opts.maxRetries,
    remainingRetries: opts.maxRetries - state.attempts,
  }
}
