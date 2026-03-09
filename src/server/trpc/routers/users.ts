import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { users, posts, followers } from "@/lib/db/schema";
import type { Context } from "../context";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure } from "../middlewares/validation";

const userIdSchema = z.number().int().positive();

const updateUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
  username: z.string().max(100).optional().nullable(),
  email: z.string().email().optional(),
  bio: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  profileImage: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

const createAuthorSchema = z.object({
  name: z.string().min(1, "Author name is required"),
  email: z.string().email().optional(),
});

type UserRecord = typeof users.$inferSelect;

const passwordlessColumns = { password: false } as const;

function excludePassword(user: UserRecord) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const usersRouter = createTRPCRouter({
  // Get all users/authors
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      const allUsers = await ctx.db.query.users.findMany({
        columns: passwordlessColumns,
        orderBy: users.name,
      });

      return allUsers;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
        cause: error,
      });
    }
  }),

  // Get user by ID
  getById: validatedProcedure(userIdSchema).query(async ({ ctx, input }) => {
    try {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input),
        columns: passwordlessColumns,
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user",
        cause: error,
      });
    }
  }),

  // Get user by email
  getByEmail: validatedProcedure(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      try {
      const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
          columns: passwordlessColumns,
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user",
          cause: error,
        });
      }
    }),

  // Update user profile
  update: validatedProcedure(updateUserSchema).mutation(
    async ({ ctx, input }) => {
      try {
        const { id, name, username, email, bio, location, profileImage, coverImage, isPublic } = input;

        // Validate user exists
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, id),
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        if (name !== undefined) updateData.name = name;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        // Update user
        const updatedUser = await ctx.db
          .update(users)
          .set(updateData)
          .where(eq(users.id, id))
          .returning();

        if (!updatedUser || updatedUser.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user",
          });
        }

        return excludePassword(updatedUser[0]);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
          cause: error,
        });
      }
    }
  ),

  // Create or get author - used for post creation
  createOrGetAuthor: validatedProcedure(createAuthorSchema).mutation(
    async ({ ctx, input }) => {
      try {
        const { name, email } = input;

        // Auto-generate email if not provided
        const authorEmail =
          email ||
          `${name.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@blog.local`;

        // Check if user exists
        const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.email, authorEmail),
        });

        if (existingUser) {
          return excludePassword(existingUser);
        }

        // Create new author
        const newAuthor = await ctx.db
          .insert(users)
          .values({
            name,
            email: authorEmail,
            role: "author",
            isActive: true,
          })
          .returning();

        if (!newAuthor || newAuthor.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create author",
          });
        }

        return excludePassword(newAuthor[0]);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or get author",
          cause: error,
        });
      }
    }
  ),

  // Delete user
  delete: validatedProcedure(userIdSchema).mutation(async ({ ctx, input }) => {
    try {
      const [deleted] = await ctx.db
        .delete(users)
        .where(eq(users.id, input))
        .returning({ id: users.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { id: deleted.id };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user",
        cause: error,
      });
    }
  }),

  // Get user profile with aggregated stats (single query with subselects)
  getProfile: validatedProcedure(userIdSchema).query(async ({ ctx, input }) => {
    const [result] = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        bio: users.bio,
        location: users.location,
        profileImage: users.profileImage,
        coverImage: users.coverImage,
        isPublic: users.isPublic,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        postsCount: sql<number>`(SELECT count(*)::int FROM ${posts} WHERE ${posts.authorId} = ${users.id})`,
        followersCount: sql<number>`(SELECT count(*)::int FROM ${followers} WHERE ${followers.followingId} = ${users.id})`,
        followingCount: sql<number>`(SELECT count(*)::int FROM ${followers} WHERE ${followers.followerId} = ${users.id})`,
      })
      .from(users)
      .where(eq(users.id, input));

    if (!result) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return {
      id: result.id,
      name: result.name,
      username: result.username,
      email: result.email,
      bio: result.bio,
      location: result.location,
      profileImage: result.profileImage,
      coverImage: result.coverImage,
      isPublic: result.isPublic,
      role: result.role,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      _count: {
        posts: result.postsCount,
        followers: result.followersCount,
        following: result.followingCount,
      },
    };
  }),

  // Get public profile by username or ID — anyone can view
  getPublicProfile: validatedProcedure(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Try lookup by username first; if input is a numeric string, fall back to ID
      let user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: passwordlessColumns,
      });

      if (!user && /^\d+$/.test(input.username)) {
        user = await ctx.db.query.users.findFirst({
          where: eq(users.id, Number(input.username)),
          columns: passwordlessColumns,
        });
      }

      if (!user || user.deletedAt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const [stats] = await ctx.db
        .select({
          postsCount: sql<number>`(SELECT count(*)::int FROM ${posts} WHERE ${posts.authorId} = ${user.id} AND ${posts.published} = true AND ${posts.deletedAt} IS NULL)`,
          followersCount: sql<number>`(SELECT count(*)::int FROM ${followers} WHERE ${followers.followingId} = ${user.id})`,
          followingCount: sql<number>`(SELECT count(*)::int FROM ${followers} WHERE ${followers.followerId} = ${user.id})`,
        })
        .from(users)
        .where(eq(users.id, user.id));

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        isPublic: user.isPublic,
        role: user.role,
        createdAt: user.createdAt,
        _count: {
          posts: stats?.postsCount ?? 0,
          followers: stats?.followersCount ?? 0,
          following: stats?.followingCount ?? 0,
        },
      };
    }),
});
