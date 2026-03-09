import { TRPCError } from "@trpc/server";
import { eq, ilike, inArray, desc } from "drizzle-orm";
import { z } from "zod";

import { tags, postsToTags } from "@/lib/db/schema";
import { generateSlug } from "@/lib/utils/slug";
import { createTagSchema, searchTagsSchema, tagIdSchema } from "@/lib/validation/tags";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { validatedProcedure, authMiddleware } from "../middlewares";

export const tagsRouter = createTRPCRouter({
  // List all tags
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.tags.findMany({
      orderBy: tags.name,
    });
  }),

  // Search tags by name (autocomplete)
  search: validatedProcedure(searchTagsSchema).query(async ({ ctx, input }) => {
    return ctx.db.query.tags.findMany({
      where: ilike(tags.name, `%${input.query}%`),
      limit: input.limit,
      orderBy: tags.name,
    });
  }),

  // Create a tag (authenticated)
  create: validatedProcedure(createTagSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const slug = generateSlug(input.name);

      // Check for duplicate
      const existing = await ctx.db.query.tags.findFirst({
        where: eq(tags.slug, slug),
      });
      if (existing) {
        return existing; // Return existing tag instead of erroring
      }

      const [created] = await ctx.db
        .insert(tags)
        .values({ name: input.name, slug })
        .returning();

      return created;
    }),

  // Get or create tags by names (batch: 2 queries max instead of N)
  getOrCreateMany: publicProcedure
    .use(authMiddleware)
    .input(z.object({ names: z.array(z.string().min(1).max(50)).min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      // Build slug map for all input names
      const slugMap = new Map<string, string>();
      for (const name of input.names) {
        slugMap.set(generateSlug(name), name.trim());
      }
      const allSlugs = [...slugMap.keys()];

      // Single query to find all existing tags
      const existing = await ctx.db.query.tags.findMany({
        where: inArray(tags.slug, allSlugs),
      });
      const existingBySlug = new Map(existing.map((t) => [t.slug, t]));

      // Batch insert all missing tags
      const missing = allSlugs
        .filter((slug) => !existingBySlug.has(slug))
        .map((slug) => ({ name: slugMap.get(slug)!, slug }));

      let created: typeof existing = [];
      if (missing.length > 0) {
        created = await ctx.db.insert(tags).values(missing).returning();
      }

      // Return in original input order
      const allBySlug = new Map([
        ...existingBySlug,
        ...created.map((t) => [t.slug, t] as const),
      ]);
      return allSlugs.map((slug) => allBySlug.get(slug)!).filter(Boolean);
    }),

  // Delete a tag (admin only)
  delete: validatedProcedure(tagIdSchema)
    .use(authMiddleware)
    .mutation(async ({ ctx, input }) => {
      const tagId = typeof input === 'string' ? Number(input) : input;

      const [deleted] = await ctx.db
        .delete(tags)
        .where(eq(tags.id, tagId))
        .returning({ id: tags.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      return { id: deleted.id };
    }),
});
