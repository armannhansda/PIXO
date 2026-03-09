import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

// Error codes mapped to HTTP status codes
export const errorCodes = {
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  METHOD_NOT_SUPPORTED: 405,
  UNPROCESSABLE_CONTENT: 422,
} as const;

// Custom error types for better handling in the frontend
export const errorTypes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  METHOD_NOT_SUPPORTED: "METHOD_NOT_SUPPORTED",
  UNPROCESSABLE_CONTENT: "UNPROCESSABLE_CONTENT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
} as const;

export type ErrorType = typeof errorTypes[keyof typeof errorTypes];

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  type: ErrorType;
  message: string;
  code: number;
  validationErrors?: ValidationError[];
  details?: Record<string, unknown>;
}

/**
 * Formats a ZodError into a structured validation error object
 */
export function formatZodError(error: ZodError): ValidationError[] {
  const formattedErrors: ValidationError[] = [];
  const { formErrors, fieldErrors } = error.flatten();
  
  // Add form-level errors
  formErrors.forEach(message => {
    formattedErrors.push({
      field: "_form",
      message,
    });
  });
  
  // Add field-level errors
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    if (errors && Array.isArray(errors)) {
      errors.forEach((message: string) => {
        formattedErrors.push({
          field,
          message,
        });
      });
    }
  });
  
  return formattedErrors;
}

/**
 * Custom error handler to create tRPC errors with structured metadata
 */
export function handleError(
  type: ErrorType,
  message: string,
  details?: Record<string, unknown>,
): never {
  let code: "BAD_REQUEST" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "INTERNAL_SERVER_ERROR";
  
  switch (type) {
    case errorTypes.VALIDATION_ERROR:
    case errorTypes.UNPROCESSABLE_CONTENT:
    case errorTypes.METHOD_NOT_SUPPORTED:
    case errorTypes.CONFLICT:
      code = "BAD_REQUEST";
      break;
    case errorTypes.NOT_FOUND:
      code = "NOT_FOUND";
      break;
    case errorTypes.UNAUTHORIZED:
      code = "UNAUTHORIZED";
      break;
    case errorTypes.FORBIDDEN:
      code = "FORBIDDEN";
      break;
    default:
      code = "INTERNAL_SERVER_ERROR";
  }
  
  throw new TRPCError({
    code,
    message,
    cause: {
      type,
      details,
    },
  });
}

/**
 * Handle validation errors specifically
 */
export function handleValidationError(error: ZodError): never {
  const validationErrors = formatZodError(error);
  
  handleError(
    errorTypes.VALIDATION_ERROR,
    "Validation error occurred",
    { validationErrors }
  );
}

/**
 * Create a not found error
 */
export function notFoundError(entity: string, id?: string | number): never {
  const message = id 
    ? `${entity} with id ${id} not found` 
    : `${entity} not found`;
  
  handleError(errorTypes.NOT_FOUND, message);
}

/**
 * Create a conflict error for duplicates
 */
export function duplicateError(entity: string, field: string, value: string): never {
  handleError(
    errorTypes.CONFLICT, 
    `A ${entity} with this ${field} already exists`,
    { field, value }
  );
}