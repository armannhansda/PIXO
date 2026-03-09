import { ZodError, type ZodTypeAny, z } from "zod";
import { handleValidationError } from "@/lib/errors";

import { middleware, publicProcedure } from "../trpc";

/**
 * Middleware that validates input against a Zod schema
 * and transforms the input to the parsed data
 */
export const validationMiddleware = <TSchema extends ZodTypeAny>(schema: TSchema) =>
  middleware(async ({ getRawInput, next }) => {
    try {
      const rawInput = await getRawInput();
      const parsed = schema.safeParse(rawInput);

      if (!parsed.success) {
        // Use our custom error handler for validation errors
        handleValidationError(parsed.error);
      }

      // Continue with the parsed and validated input
      return next({
        input: parsed.data,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error);
      }
      throw error;
    }
  });

/**
 * A procedure that validates input against a Zod schema
 * This is a convenience wrapper around publicProcedure.use(validationMiddleware)
 * Uses z.any() for .input() to skip the second validation and use only middleware validation
 */
export const validatedProcedure = <TSchema extends ZodTypeAny>(schema: TSchema) =>
  publicProcedure.use(validationMiddleware(schema)).input(z.any());
