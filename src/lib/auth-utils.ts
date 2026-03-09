import { sign, verify, type SignOptions, type Secret, type SignCallback } from "jsonwebtoken";
import { type UserInfo } from "@/server/trpc/context";
import { errorTypes, handleError } from "@/lib/errors";

// Secret should be in environment variables in production
const JWT_SECRET: Secret = process.env.JWT_SECRET || "super-secret-jwt-token-that-should-be-in-env";

// Token expiration time (1 day by default) - must be string or number
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || "1d";

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  id: string;
  email: string;
  name?: string;
  permissions: string[];
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: Omit<UserInfo, "permissions" | "roles"> & { 
  permissions?: string[]; 
  roles?: string[];
}): string {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    permissions: user.permissions || [],
    roles: user.roles || [],
  };

  // Create options object with proper typing
  const expiresInValue = TOKEN_EXPIRATION;
  
  return sign(
    payload, 
    JWT_SECRET, 
    { expiresIn: expiresInValue } as SignOptions & { expiresIn: string | number }
  );
}

/**
 * Verify and decode a JWT token
 * @throws {TRPCError} If token is invalid or expired
 */
export async function verifyToken(token: string): Promise<UserInfo> {
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload;
    
    // Return user data from token
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      permissions: decoded.permissions || [],
      roles: decoded.roles || [],
    };
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      handleError(
        errorTypes.UNAUTHORIZED,
        "Authentication token has expired",
        { tokenExpired: true }
      );
    }
    
    handleError(
      errorTypes.UNAUTHORIZED,
      "Invalid authentication token",
      { invalidToken: true }
    );
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserInfo | undefined, permission: string): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserInfo | undefined, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

/**
 * Check if user is an administrator
 */
export function isAdmin(user: UserInfo | undefined): boolean {
  if (!user) return false;
  return hasRole(user, "admin") || hasPermission(user, "admin:*");
}

/**
 * Parse a token from various formats
 */
export function parseToken(input: string): string | null {
  if (!input) return null;
  
  // Check if it's already a raw token
  if (!input.includes(" ") && !input.includes("=")) {
    return input;
  }
  
  // Check if it's a bearer token
  if (input.toLowerCase().startsWith("bearer ")) {
    return input.substring(7).trim();
  }
  
  // Extract from cookie format
  const match = input.match(/token=([^;]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}