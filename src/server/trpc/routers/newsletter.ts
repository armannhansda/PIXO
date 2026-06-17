import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      // Check if subscriber already exists
      const existing = await ctx.db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        // If they already exist, reactivate them just in case they were inactive
        if (!existing[0].isActive) {
          await ctx.db
            .update(subscribers)
            .set({ isActive: true })
            .where(eq(subscribers.email, input.email));
          return { success: true, message: "Welcome back! You are resubscribed." };
        }
        return { success: true, message: "You are already subscribed!" };
      }

      // Otherwise insert new subscriber
      await ctx.db.insert(subscribers).values({
        email: input.email,
        isActive: true,
      });

      return { success: true, message: "Successfully subscribed to the newsletter!" };
    }),
});
