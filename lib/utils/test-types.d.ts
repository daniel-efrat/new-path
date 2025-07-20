/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { ReactNode } from 'react'
import { QuestionnaireError } from '@/lib/errors/questionnaire'

declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T
      mockClear(): void
      mockReset(): void
      mockRestore(): void
      mockImplementation(fn: (...args: Y) => T): this
      mockImplementationOnce(fn: (...args: Y) => T): this
      mockReturnThis(): this
      mockReturnValue(value: T): this
      mockReturnValueOnce(value: T): this
      mockResolvedValue<U extends T>(value: U): this
      mockResolvedValueOnce<U extends T>(value: U): this
      mockRejectedValue(value: any): this
      mockRejectedValueOnce(value: any): this
      getMockName(): string
      mock: {
        calls: Y[]
        instances: T[]
        contexts: any[]
        results: { type: 'return' | 'throw'; value: any }[]
        lastCall: Y
      }
    }

    interface Matchers<R = void, T = any> {
      // Custom matchers
      toBeValidQuestionnaireError(): R

      // String matchers
      toMatch(pattern: string | RegExp): R
      toContain(substring: string): R
      toHaveLength(length: number): R

      // Generic matchers
      toBe(expected: any): R
      toEqual(expected: any): R
      toBeDefined(): R
      toBeUndefined(): R
      toBeNull(): R
      toBeTruthy(): R
      toBeFalsy(): R
      toBeInstanceOf(expected: any): R
      toThrow(expected?: string | Error | RegExp): R
      toThrowError(expected?: string | Error | RegExp): R

      // DOM matchers
      toBeInTheDocument(): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveAttribute(attr: string, value?: any): R

      // Jest function matchers
      toHaveBeenCalled(): R
      toHaveBeenCalledTimes(times: number): R
      toHaveBeenCalledWith(...args: any[]): R

      // Additional properties
      not: Matchers<R, T>
    }

    interface MockedFunction<T extends (...args: any) => any> extends Mock<ReturnType<T>, Parameters<T>> {}
  }

  interface JestAssertionError extends Error {
    matcherResult?: {
      pass: boolean
      message: () => string
    }
  }

  // Extend expect
  interface ExpectStatic {
    <T = any>(actual: T): jest.Matchers<void, T> & jest.AsyncMatchers<void, T>
    extend(matchers: Record<string, unknown>): void
    assertions(expected: number): void
    hasAssertions(): void
    anything(): any
    any(constructor: unknown): any
    objectContaining<T extends object>(obj: Partial<T>): T
  }

  const expect: ExpectStatic

  // Jest global object
  const jest: {
    fn: <T = any, Y extends any[] = any[]>() => jest.Mock<T, Y>
    spyOn: <T extends {}, M extends keyof T>(
      object: T,
      method: M
    ) => jest.Mock<T[M] extends (...args: any[]) => any ? ReturnType<T[M]> : any>
    mock: (moduleName: string, factory?: () => unknown) => void
    clearAllMocks: () => void
    resetAllMocks: () => void
    restoreAllMocks: () => void
    useFakeTimers: () => void
    useRealTimers: () => void
    runAllTimers: () => void
    advanceTimersByTime: (msToRun: number) => void
    clearAllTimers: () => void
    objectContaining: <T extends object>(obj: Partial<T>) => T
    any: (constructor: unknown) => any
  }

  // Test functions
  function describe(name: string, fn: () => void): void
  function test(name: string, fn: () => void | Promise<void>): void
  function it(name: string, fn: () => void | Promise<void>): void
  function beforeEach(fn: () => void | Promise<void>): void
  function afterEach(fn: () => void | Promise<void>): void
  function beforeAll(fn: () => void | Promise<void>): void
  function afterAll(fn: () => void | Promise<void>): void
}

export {}
