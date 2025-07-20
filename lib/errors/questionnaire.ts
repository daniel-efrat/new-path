import type { LucideIcon } from "lucide-react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export class QuestionnaireError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code: string) {
    super(message);
    this.name = "QuestionnaireError";
    this.code = code;

    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public setStatus(status: number): this {
    this.status = status;
    return this;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
    };
  }

  public static isQuestionnaireError(
    error: unknown
  ): error is QuestionnaireError {
    return (
      error instanceof QuestionnaireError &&
      typeof (error as QuestionnaireError).code === "string" &&
      typeof (error as QuestionnaireError).message === "string"
    );
  }

  public static from(error: unknown): QuestionnaireError {
    if (error instanceof QuestionnaireError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    return new QuestionnaireError(message, ERROR_CODES.UNKNOWN);
  }
}

// Error codes
export const ERROR_CODES = {
  VALIDATION: "VALIDATION_ERROR",
  NETWORK: "NETWORK_ERROR",
  SERVER: "SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  UNKNOWN: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type ErrorSeverity = "error" | "warning" | "info";

// Retryable error codes
export const RETRYABLE_ERROR_CODES = [
  ERROR_CODES.NETWORK,
  ERROR_CODES.SERVER,
] as const;

export type RetryableErrorCode = (typeof RETRYABLE_ERROR_CODES)[number];

// Error handlers and utilities
export function handleQuestionnaireError(error: unknown): QuestionnaireError {
  return QuestionnaireError.from(error);
}

export function formatErrorForUser(error: QuestionnaireError): string {
  switch (error.code) {
    case ERROR_CODES.VALIDATION:
      return "אנא בדוק את הקלט ונסה שוב.";
    case ERROR_CODES.NETWORK:
      return "שגיאת רשת. אנא בדוק את חיבור האינטרנט.";
    case ERROR_CODES.SERVER:
      return "שגיאת שרת. אנא נסה שוב מאוחר יותר.";
    case ERROR_CODES.UNAUTHORIZED:
      return "אינך מורשה לבצע פעולה זו.";
    case ERROR_CODES.NOT_FOUND:
      return "המשאב המבוקש לא נמצא.";
    default:
      return "אירעה שגיאה בלתי צפויה.";
  }
}

export function getErrorSeverity(error: QuestionnaireError): ErrorSeverity {
  switch (error.code) {
    case ERROR_CODES.VALIDATION:
      return "warning";
    case ERROR_CODES.NETWORK:
    case ERROR_CODES.UNAUTHORIZED:
      return "info";
    default:
      return "error";
  }
}

export function isRetryableError(error: QuestionnaireError): boolean {
  return RETRYABLE_ERROR_CODES.includes(error.code as RetryableErrorCode);
}

// UI elements for error display
export const severityIcons: Record<ErrorSeverity, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const severityColors: Record<ErrorSeverity, string> = {
  error: "text-destructive",
  warning: "text-warning",
  info: "text-info",
};

// Type exports
export type { LucideIcon };
