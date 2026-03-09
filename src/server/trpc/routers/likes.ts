import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { likes, posts } from "@/lib/db/schema";
import { toggleLikeSchema, likeStatusSchema } from "@/lib/validation/likes";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";
import { isAuthenticated } from "../context";

export const likesRouter = createTRPCRouter({
  // Toggle like on a post (authenticated)
  toggle: validatedProcedure(toggleLikeSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);

      // Check post exists
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
        columns: { id: true },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Try to delete first — if a row is returned, it was an unlike
      const deleted = await ctx.db
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.postId, input.postId)))
        .returning({ userId: likes.userId });

      if (deleted.length > 0) {
        return { liked: false };
      }

      // No row deleted means it wasn't liked — insert
      await ctx.db.insert(likes).values({ userId, postId: input.postId });
      return { liked: true };
    }),

  // Get like status for current user + total count (single query)
  status: validatedProcedure(likeStatusSchema).query(async ({ ctx, input }) => {
    const userId = isAuthenticated(ctx) ? Number(ctx.user.id) : null;

    const [result] = await ctx.db
      .select({
        count: sql<number>`count(*)::int`,
        liked: userId
          ? sql<boolean>`bool_or(${likes.userId} = ${userId})`
          : sql<boolean>`false`,
      })
      .from(likes)
      .where(eq(likes.postId, input.postId));

    return {
      count: result?.count ?? 0,
      liked: result?.liked ?? false,
    };
  }),

  // Get like count for a post (public)
  count: validatedProcedure(z.object({ postId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(likes)
        .where(eq(likes.postId, input.postId));
      return { count: result?.count ?? 0 };
    }),

  // List posts liked by the current user (authenticated, paginated)
  listByUser: publicProcedure
    .use(authMiddleware)
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);
      const limit = input?.limit ?? 20;

      const likedRows = await ctx.db.query.likes.findMany({
        where: eq(likes.userId, userId),
        orderBy: desc(likes.createdAt),
        limit: limit + 1,
        with: {
          post: {
            with: {
              categories: { with: { category: true } },
              tags: { with: { tag: true } },
              author: true,
            },
          },
        },
      });

      let hasMore = false;
      if (likedRows.length > limit) {
        likedRows.pop();
        hasMore = true;
      }

      return {
        items: likedRows
          .filter((r: any) => r.post)
          .map((r: any) => r.post),
        hasMore,
      };
    }),
});
