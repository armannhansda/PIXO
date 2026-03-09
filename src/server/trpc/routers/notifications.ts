import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { notifications } from "@/lib/db/schema";
import {
  listNotificationsSchema,
  markReadSchema,
  notificationIdSchema,
} from "@/lib/validation/notifications";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";

export const notificationsRouter = createTRPCRouter({
  // List notifications for current user (authenticated)
  list: publicProcedure
    .use(authMiddleware)
    .input(listNotificationsSchema.optional())
    .query(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);
      const limit = input?.limit ?? 20;
      const unreadOnly = input?.unreadOnly ?? false;

      const conditions = [eq(notifications.userId, userId)];
      if (unreadOnly) {
        conditions.push(eq(notifications.read, false));
      }

      const rows = await ctx.db.query.notifications.findMany({
        where: and(...conditions),
        orderBy: desc(notifications.createdAt),
        limit: limit + 1,
        with: {
          actor: {
            columns: { id: true, name: true, profileImage: true },
          },
        },
      });

      let nextCursor: number | undefined;
      if (rows.length > limit) {
        const last = rows.pop()!;
        nextCursor = last.id;
      }

      return { items: rows, nextCursor };
    }),

  // Get unread count (authenticated)
  unreadCount: publicProcedure
    .use(authMiddleware)
    .query(async ({ ctx }) => {
      const userId = Number(ctx.user.id);

      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

      return { count: result?.count ?? 0 };
    }),

  // Mark notifications as read (authenticated)
  markRead: validatedProcedure(markReadSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.user.id);

      await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.userId, userId),
            inArray(notifications.id, input.notificationIds),
          ),
        );

      return { success: true };
    }),

  // Mark all as read (authenticated)
  markAllRead: publicProcedure
    .use(authMiddleware)
    .mutation(async ({ ctx }) => {
      const userId = Number(ctx.user.id);

      await ctx.db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

      return { success: true };
    }),
});
