import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { errorTypes, formatZodError } from "@/lib/errors";
import type { Context } from "./context";

/**
 * Custom error cause type that can include metadata
 */
interface CustomErrorCause {
  type?: string;
  details?: Record<string, unknown>;
}

/**
 * Initialize tRPC with context and custom error formatter
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError = error.cause instanceof ZodError 
      ? error.cause 
      : null;
    
    // Cast cause to our custom type if it exists
    const cause = error.cause as CustomErrorCause | undefined;
    
    const formattedError = {
      ...shape,
      data: {
        ...shape.data,
        type: cause?.type || errorTypes.INTERNAL_SERVER_ERROR,
        validationErrors: zodError ? formatZodError(zodError) : undefined,
        details: cause?.details,
      },
    };

    // Log server-side errors but not client errors
    if (
      error.code === "INTERNAL_SERVER_ERROR" && 
      process.env.NODE_ENV !== "production"
    ) {
      console.error("tRPC Server Error:", error);
    }

    return formattedError;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

/**
 * Handler for catching and formatting database errors
 */
export function handleDbErrors<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((error) => {
    // Handle Postgres unique constraint violation
    if (error.code === "23505") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A record with this value already exists",
        cause: {
          type: errorTypes.CONFLICT,
          details: {
            constraint: error.constraint,
          },
        },
      });
    }

    // Handle foreign key constraint violation
    if (error.code === "23503") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Referenced record does not exist",
        cause: {
          type: errorTypes.NOT_FOUND,
          details: {
            constraint: error.constraint,
          },
        },
      });
    }

    // Re-throw all other errors
    throw error;
  });
}
