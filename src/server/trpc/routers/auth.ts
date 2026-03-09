import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import { users } from "@/lib/db/schema";
import { generateToken } from "@/lib/auth-utils";
import { isAuthenticated } from "../context";
import type { Context } from "../context";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";
import type { InferSelectModel } from "drizzle-orm";
import { rateLimitMiddleware } from "../middlewares/rateLimit";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** Generate a unique username from name or email, retrying if it already exists in the DB */
async function generateUsername(
  db: Context["db"],
  name: string,
  email: string
): Promise<string> {
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "")
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const candidate = `${base}${suffix}`;
    const existing = await db.query.users.findFirst({
      where: eq(users.username, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
  }

  // Fallback: use timestamp for guaranteed uniqueness
  return `${base}${Date.now()}`;
}

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AuthResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage: string | null;
};

type User = InferSelectModel<typeof users>;

async function getUserResponse(user: User): Promise<UserResponse> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "author",
    profileImage: user.profileImage ?? null,
  };
}

export const authRouter = createTRPCRouter({
  signup: validatedProcedure(signupSchema).mutation(async ({ ctx, input }) => {
    try {
      const { name, email, password } = input;

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await ctx.db
        .insert(users)
        .values({
          name,
          username: await generateUsername(ctx.db, name, email),
          email,
          password: hashedPassword,
          role: "author",
          isActive: true,
        })
        .returning();

      const userResponse = await getUserResponse(newUser[0]);
      const token = generateToken({
        id: String(newUser[0].id),
        email: newUser[0].email,
        name: newUser[0].name || undefined,
        permissions: ["posts:create", "posts:update", "posts:delete"],
        roles: ["author"],
      });

      return {
        success: true,
        user: userResponse,
        token,
        message: "Account created successfully",
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create account",
        cause: error,
      });
    }
  }),

  login: validatedProcedure(loginSchema).use(rateLimitMiddleware).mutation(async ({ ctx, input }) => {
    try {
      const { email, password } = input;

      // Find user by email
      const foundUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!foundUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (!foundUser.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been deactivated",
        });
      }

      // If no password is set (for demo users), allow login
      if (!foundUser.password) {
        const userResponse = await getUserResponse(foundUser);
        const token = generateToken({
          id: String(foundUser.id),
          email: foundUser.email,
          name: foundUser.name || undefined,
          permissions: ["posts:create", "posts:update", "posts:delete"],
          roles: ["author"],
        });

        return {
          success: true,
          user: userResponse,
          token,
          message: "Login successful",
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const userResponse = await getUserResponse(foundUser);
      const token = generateToken({
        id: String(foundUser.id),
        email: foundUser.email,
        name: foundUser.name || undefined,
        permissions: ["posts:create", "posts:update", "posts:delete"],
        roles: ["author"],
      });

      return {
        success: true,
        user: userResponse,
        token,
        message: "Login successful",
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to login",
        cause: error,
      });
    }
  }),

  // logout mutation
  // logout: publicProcedure.mutation(({ ctx }) => {
  //   ctx.res.cookies.set("session-token", "", {
  //   maxAge: 0,
  //   path: "/"
  // });

  // return { success: true };
  // });

  // Get current authenticated user
  me: publicProcedure
    .use(authMiddleware)
    .query(async ({ ctx }) => {
      const userId = Number(ctx.user.id);

      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return getUserResponse(user);
    }),

  googleLogin: publicProcedure
    .input(z.object({ credential: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid Google credential",
        });
      }

      // Find or create user
      const existingGoogleUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, payload.email),
      });

      let foundUser: User;

      if (!existingGoogleUser) {
        const gName = payload.name || payload.email.split("@")[0];
        const newUser = await ctx.db
          .insert(users)
          .values({
            name: gName,
            username: await generateUsername(ctx.db, gName, payload.email),
            email: payload.email,
            profileImage: payload.picture || null,
            role: "author",
            isActive: true,
          })
          .returning();
        foundUser = newUser[0];
      } else {
        foundUser = existingGoogleUser;
        if (!foundUser.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your account has been deactivated",
          });
        }
        // Backfill username for users who signed up before the username feature
        if (!foundUser.username) {
          const newUsername = await generateUsername(
            ctx.db,
            foundUser.name,
            foundUser.email
          );
          await ctx.db
            .update(users)
            .set({ username: newUsername })
            .where(eq(users.id, foundUser.id));
          foundUser = { ...foundUser, username: newUsername };
        }
      }

      const userResponse = await getUserResponse(foundUser);
      const token = generateToken({
        id: String(foundUser.id),
        email: foundUser.email,
        name: foundUser.name || undefined,
        permissions: ["posts:create", "posts:update", "posts:delete"],
        roles: ["author"],
      });

      return {
        success: true,
        user: userResponse,
        token,
        message: "Login successful",
      };
    }),
});
