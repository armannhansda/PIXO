import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { comments, posts, users } from "@/lib/db/schema";
import {
  createCommentSchema,
  updateCommentSchema,
  listCommentsByPostSchema,
  commentIdSchema,
} from "@/lib/validation/comments";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";
import { rateLimitMiddleware } from "../middlewares/rateLimit";

export const commentsRouter = createTRPCRouter({
  // List comments for a post (public, top-level only with replies)
  listByPost: validatedProcedure(listCommentsByPostSchema).query(async ({ ctx, input }) => {
    const { postId, limit } = input;

    // Get top-level comments (no parent)
    const topLevel = await ctx.db.query.comments.findMany({
      where: and(
        eq(comments.postId, postId),
        isNull(comments.parentId),
        isNull(comments.deletedAt),
      ),
      orderBy: desc(comments.createdAt),
      limit: limit + 1,
      with: {
        author: {
          columns: { id: true, name: true, profileImage: true },
        },
        replies: {
          where: isNull(comments.deletedAt),
          orderBy: comments.createdAt,
          with: {
            author: {
              columns: { id: true, name: true, profileImage: true },
            },
          },
        },
      },
    });

    let nextCursor: number | undefined;
    if (topLevel.length > limit) {
      const last = topLevel.pop()!;
      nextCursor = last.id;
    }

    return { items: topLevel, nextCursor };
  }),

  // Get comment count for a post
  count: validatedProcedure(z.object({ postId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(and(eq(comments.postId, input.postId), isNull(comments.deletedAt)));
      return { count: result?.count ?? 0 };
    }),

  // Create a comment (authenticated)
  create: validatedProcedure(createCommentSchema)
    .use(rateLimitMiddleware)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const authorId = Number(ctx.user.id);

      // Check post exists
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.postId),
        columns: { id: true },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // If replying, check parent comment exists
      if (input.parentId) {
        const parent = await ctx.db.query.comments.findFirst({
          where: and(eq(comments.id, input.parentId), isNull(comments.deletedAt)),
          columns: { id: true },
        });
        if (!parent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Parent comment not found" });
        }
      }

      const [created] = await ctx.db
        .insert(comments)
        .values({
          content: input.content,
          postId: input.postId,
          authorId,
          parentId: input.parentId ?? null,
        })
        .returning();

      // Fetch with author
      const result = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, created.id),
        with: {
          author: {
            columns: { id: true, name: true, profileImage: true },
          },
        },
      });

      return result;
    }),

  // Update a comment (authenticated, owner only)
  update: validatedProcedure(updateCommentSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);

      const comment = await ctx.db.query.comments.findFirst({
        where: and(eq(comments.id, input.id), isNull(comments.deletedAt)),
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      if (comment.authorId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own comments" });
      }

      const [updated] = await ctx.db
        .update(comments)
        .set({ content: input.content, updatedAt: new Date() })
        .where(eq(comments.id, input.id))
        .returning();

      return updated;
    }),

  // Soft-delete a comment (authenticated, owner only)
  delete: validatedProcedure(commentIdSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);
      const commentId = typeof input === 'string' ? Number(input) : input;

      const comment = await ctx.db.query.comments.findFirst({
        where: and(eq(comments.id, commentId), isNull(comments.deletedAt)),
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      if (comment.authorId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments" });
      }

      await ctx.db
        .update(comments)
        .set({ deletedAt: new Date() })
        .where(eq(comments.id, commentId));

      return { id: commentId };
    }),
});
