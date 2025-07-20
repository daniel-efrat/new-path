"use client"

import React from 'react'
import { QuestionnaireErrorBoundary, useQuestionnaireErrorBoundary, withQuestionnaireErrorBoundary } from './QuestionnaireErrorBoundary'
import { useQuestionnaireStore } from '@/lib/stores/questionnaireStore'
import { Button } from '@/components/ui/button'
import { QuestionnaireError } from '@/lib/errors/questionnaire'

// Example 1: Using the hook in a functional component
function FunctionalExample() {
  const { errorBoundaryRef, withErrorHandling } = useQuestionnaireErrorBoundary()
  const submitQuestionnaire = useQuestionnaireStore(state => state.submitQuestionnaire)

  const handleSubmit = React.useCallback(async () => {
    await withErrorHandling(async () => {
      await submitQuestionnaire()
    })
  }, [withErrorHandling, submitQuestionnaire])

  return (
    <QuestionnaireErrorBoundary ref={errorBoundaryRef}>
      <Button onClick={handleSubmit}>Submit</Button>
    </QuestionnaireErrorBoundary>
  )
}

// Example 2: Using the class component with HOC
class ClassExample extends React.Component {
  handleError = (error: QuestionnaireError) => {
    console.error('Questionnaire error:', error)
  }

  render() {
    return (
      <Button onClick={() => {
        throw new Error('Example error')
      }}>
        Trigger Error
      </Button>
    )
  }
}

const ClassExampleWithError = withQuestionnaireErrorBoundary(ClassExample, {
  onError: (error) => console.error('Wrapped error:', error),
  maxRetries: 2
})

// Example 3: Direct usage with custom error handling
function DirectExample() {
  return (
    <QuestionnaireErrorBoundary
      onError={(error) => console.error('Direct error:', error)}
      fallback={<div>Something went wrong</div>}
      maxRetries={3}
    >
      <div>Protected content</div>
    </QuestionnaireErrorBoundary>
  )
}

// Example 4: Using with async operations
function AsyncExample() {
  const { errorBoundaryRef, withErrorHandling } = useQuestionnaireErrorBoundary()
  const updateStepData = useQuestionnaireStore(state => state.updateStepData)

  const handleSave = React.useCallback(async () => {
    await withErrorHandling(async () => {
      await updateStepData({
        stepKey: {
          value: 'example',
          isValid: true
        }
      })
    })
  }, [withErrorHandling, updateStepData])

  return (
    <QuestionnaireErrorBoundary ref={errorBoundaryRef}>
      <Button onClick={handleSave}>Save Progress</Button>
    </QuestionnaireErrorBoundary>
  )
}

// Example 5: Composing with other components
function ComposedExample() {
  const { errorBoundaryRef, withErrorHandling } = useQuestionnaireErrorBoundary()
  const { stepData, currentStep } = useQuestionnaireStore()

  const handleOperation = React.useCallback(async () => {
    await withErrorHandling(async () => {
      // Complex operation that might fail
      await Promise.all([
        // Multiple async operations
      ])
    })
  }, [withErrorHandling])

  return (
    <QuestionnaireErrorBoundary 
      ref={errorBoundaryRef}
      fallback={<div>Error state UI</div>}
    >
      <div>
        <h2>Current Step: {currentStep}</h2>
        <pre>{JSON.stringify(stepData, null, 2)}</pre>
        <Button onClick={handleOperation}>
          Perform Operation
        </Button>
      </div>
    </QuestionnaireErrorBoundary>
  )
}

export {
  FunctionalExample,
  ClassExampleWithError,
  DirectExample,
  AsyncExample,
  ComposedExample
}
