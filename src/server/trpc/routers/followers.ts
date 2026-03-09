import { TRPCError } from "@trpc/server";
import { and, eq, or, sql, desc } from "drizzle-orm";
import { z } from "zod";

import { followers, users } from "@/lib/db/schema";
import { toggleFollowSchema, followStatusSchema, listFollowersSchema } from "@/lib/validation/followers";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";
import { isAuthenticated } from "../context";

export const followersRouter = createTRPCRouter({
  // Toggle follow (authenticated)
  toggle: validatedProcedure(toggleFollowSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const followerId = Number(ctx.user.id);

      if (followerId === input.targetUserId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot follow yourself" });
      }

      // Check target user exists
      const target = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.targetUserId),
        columns: { id: true },
      });
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Try to delete first — if a row is returned, it was an unfollow
      const deleted = await ctx.db
        .delete(followers)
        .where(and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, input.targetUserId),
        ))
        .returning({ followerId: followers.followerId });

      if (deleted.length > 0) {
        return { following: false };
      }

      // No row deleted means not following — insert
      await ctx.db.insert(followers).values({
        followerId,
        followingId: input.targetUserId,
      });
      return { following: true };
    }),

  // Get follow status for current user -> target user
  status: validatedProcedure(followStatusSchema).query(async ({ ctx, input }) => {
    let following = false;
    if (isAuthenticated(ctx)) {
      const followerId = Number(ctx.user.id);
      const existing = await ctx.db.query.followers.findFirst({
        where: and(
          eq(followers.followerId, followerId),
          eq(followers.followingId, input.targetUserId),
        ),
      });
      following = !!existing;
    }
    return { following };
  }),

  // Get followers count for a user (single query)
  counts: validatedProcedure(z.object({ userId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({
          followers: sql<number>`count(*) FILTER (WHERE ${followers.followingId} = ${input.userId})::int`,
          following: sql<number>`count(*) FILTER (WHERE ${followers.followerId} = ${input.userId})::int`,
        })
        .from(followers)
        .where(or(
          eq(followers.followingId, input.userId),
          eq(followers.followerId, input.userId),
        ));

      return {
        followers: result?.followers ?? 0,
        following: result?.following ?? 0,
      };
    }),

  // List followers of a user
  listFollowers: validatedProcedure(listFollowersSchema).query(async ({ ctx, input }) => {
    const { userId, limit } = input;

    const rows = await ctx.db.query.followers.findMany({
      where: eq(followers.followingId, userId),
      orderBy: desc(followers.createdAt),
      limit: limit + 1,
      with: {
        follower: {
          columns: { id: true, name: true, bio: true, profileImage: true },
        },
      },
    });

    let nextCursor: number | undefined;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.followerId;
    }

    return {
      items: rows.map((r) => r.follower),
      nextCursor,
    };
  }),

  // List users that a user follows
  listFollowing: validatedProcedure(listFollowersSchema).query(async ({ ctx, input }) => {
    const { userId, limit } = input;

    const rows = await ctx.db.query.followers.findMany({
      where: eq(followers.followerId, userId),
      orderBy: desc(followers.createdAt),
      limit: limit + 1,
      with: {
        following: {
          columns: { id: true, name: true, bio: true, profileImage: true },
        },
      },
    });

    let nextCursor: number | undefined;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.followingId;
    }

    return {
      items: rows.map((r) => r.following),
      nextCursor,
    };
  }),
});
