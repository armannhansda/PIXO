"use client";

import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { type inferRouterOutputs, type inferRouterInputs } from "@trpc/server";
import { useState, useEffect, useRef } from "react";
import superjson from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { AppRouter } from "@/server/trpc/router";

/**
 * Extend the base headers interface to allow for custom headers
 */
interface CustomHeaders {
  Authorization?: string;
  "x-trpc-source"?: string;
}

/**
 * Create a client-side tRPC instance
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get auth token from localStorage with debugging
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

/**
 * tRPC provider for server components
 */
export function TRPCProvider({
  children,
  headers = {},
}: {
  children: React.ReactNode;
  headers?: CustomHeaders;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          async headers() {
            // Get auth token fresh for every request
            const authToken = getAuthToken();
            const finalHeaders = {
              ...headers,
              ...(authToken && { Authorization: `Bearer ${authToken}` }),
              "x-trpc-source": "react",
            };
            return finalHeaders;
          },
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Type helper for inferring tRPC router inputs
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Type helper for inferring tRPC router outputs
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
