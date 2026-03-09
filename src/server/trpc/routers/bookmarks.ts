import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { bookmarks, posts } from "@/lib/db/schema";
import { toggleBookmarkSchema, bookmarkStatusSchema } from "@/lib/validation/bookmarks";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";
import { isAuthenticated } from "../context";

export const bookmarksRouter = createTRPCRouter({
  // Toggle bookmark on a post (authenticated)
  toggle: validatedProcedure(toggleBookmarkSchema)
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

      // Try to delete first — if a row is returned, it was a removal
      const deleted = await ctx.db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, input.postId)))
        .returning({ userId: bookmarks.userId });

      if (deleted.length > 0) {
        return { saved: false };
      }

      // No row deleted means it wasn't bookmarked — insert
      await ctx.db.insert(bookmarks).values({ userId, postId: input.postId });
      return { saved: true };
    }),

  // Get bookmark status for current user
  status: validatedProcedure(bookmarkStatusSchema).query(async ({ ctx, input }) => {
    let saved = false;
    if (isAuthenticated(ctx)) {
      const userId = Number(ctx.user.id);
      const existing = await ctx.db.query.bookmarks.findFirst({
        where: and(eq(bookmarks.userId, userId), eq(bookmarks.postId, input.postId)),
      });
      saved = !!existing;
    }
    return { saved };
  }),

  // List bookmarked posts for current user (authenticated)
  list: publicProcedure
    .use(authMiddleware)
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(20),
      cursor: z.number().int().positive().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);
      const limit = input?.limit ?? 20;

      const rows = await ctx.db.query.bookmarks.findMany({
        where: eq(bookmarks.userId, userId),
        orderBy: desc(bookmarks.createdAt),
        limit: limit + 1,
        with: {
          post: {
            with: {
              author: true,
              categories: {
                with: { category: true },
              },
            },
          },
        },
      });

      let nextCursor: number | undefined;
      if (rows.length > limit) {
        const last = rows.pop()!;
        nextCursor = last.postId;
      }

      return {
        items: rows.map((row) => ({
          ...row.post,
          categories: row.post.categories.map((c: { category: unknown }) => c.category),
          savedAt: row.createdAt,
        })),
        nextCursor,
      };
    }),
});
