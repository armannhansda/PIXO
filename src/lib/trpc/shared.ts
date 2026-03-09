import { type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/router";

// Export endpoint URL for browser client
export const TRPC_API_ENDPOINT = "/api/trpc";

// Export types for client usage
export type RouterOutputs = inferRouterOutputs<AppRouter>;