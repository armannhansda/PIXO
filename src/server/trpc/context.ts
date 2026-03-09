import { db as getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth-utils";
import { type NextRequest } from "next/server";

/**
 * User information that will be available in the context
 */
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  permissions: string[];
  roles: string[];
}

export type CreateContextOptions = {
  headers: Headers;
};

/**
 * Creates context for tRPC procedures with optional user authentication
 */
export async function createContext({ headers }: CreateContextOptions) {
  // Default context without user - create a getter for db to defer initialization
  const baseContext = {
    get db() {
      return getDb();
    },
    headers,
  };
  
  // Try to get authorization header (case-insensitive)
  let authHeader = headers.get("authorization");
  if (!authHeader) {
    authHeader = headers.get("Authorization");
  }
  
  if (!authHeader) {
    return baseContext;
  }
  
  // Extract bearer token
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.substring(7).trim()
    : null;
    
  // If no token, return the base context
  if (!bearerToken) {
    return baseContext;
  }
  
  try {
    // Verify and decode the token
    const user = await verifyToken(bearerToken);
    
    // Add user to context if token is valid
    return {
      ...baseContext,
      user,
    };
  } catch (error) {
    // Token verification failed, return context without user
    console.error("Token verification failed:", error);
    return baseContext;
  }
}

/**
 * Creates context from a Next.js API request
 */
export async function createTRPCContext({ req }: { req: NextRequest }) {
  // Get session token from cookie
  const sessionToken = req.cookies.get("session-token")?.value;
  
  // Add token to authorization header if found in cookie
  const headers = new Headers(req.headers);
  if (sessionToken && !headers.has("authorization")) {
    headers.set("authorization", `Bearer ${sessionToken}`);
  }
  
  // Create context with the enhanced headers
  return createContext({ headers });
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Type guard to check if context has authenticated user
export function isAuthenticated(ctx: Context): ctx is Context & { user: UserInfo } {
  return 'user' in ctx && !!ctx.user;
}
