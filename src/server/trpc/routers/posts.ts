import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, isNull, ilike, like, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { generateSlug, generateFallbackSlug } from "@/lib/utils/slug";
import { categories, posts, postsToCategories, postsToTags, tags, likes, users } from "@/lib/db/schema";
import {
  assignCategoriesSchema,
  createPostSchema,
  filterPostsByCategorySchema,
  postIdSchema,
  updatePostSchema,
} from "@/lib/validation/posts";

import type { Context } from "../context";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { 
  validatedProcedure,
  authMiddleware,
  loggerMiddleware,
  permissionMiddleware
} from "../middlewares";

const slugInputSchema = z.object({ slug: z.string().min(1) });

type PostRecord = typeof posts.$inferSelect;
type CategoryRecord = typeof categories.$inferSelect;
type TagRecord = typeof tags.$inferSelect;
type UserRecord = typeof users.$inferSelect;
type PostWithCategoryLinks = PostRecord & {
  categories: {
    category: CategoryRecord;
  }[];
  tags?: {
    tag: TagRecord;
  }[];
  author?: UserRecord | null;
};

type PostResponse = PostRecord & {
  categories: CategoryRecord[];
  tags: TagRecord[];
  author?: UserRecord | null;
  authorId?: number | null;
};

const mapPost = (post: PostWithCategoryLinks): PostResponse => ({
  ...post,
  categories: post.categories.map((link) => link.category),
  tags: (post.tags ?? []).map((link) => link.tag),
  authorId: post.authorId,
});

/**
 * Generates and ensures a unique slug for a post
 * 
 * @param ctx - Database context for querying
 * @param source - Source text for slug generation (title or custom slug)
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns A unique slug for the post
 */
async function ensureUniquePostSlug(ctx: Context, source: string, excludeId?: string | number) {
  // Generate base slug or use fallback
  const base = generateSlug(source) || generateFallbackSlug("post");
  
  // Return immediately if below certain length (likely already a custom slug)
  if (base.length <= 5 && source === base) {
    const timestamp = Date.now().toString().slice(-6);
    return `${base}-${timestamp}`;
  }

  const excludeIdNum = excludeId !== undefined ? Number(excludeId) : undefined;

  // Single query: fetch all slugs that match the base pattern
  const conditions: SQL<unknown>[] = [
    or(eq(posts.slug, base), like(posts.slug, `${base}-%`))!,
  ];
  if (excludeIdNum !== undefined) {
    conditions.push(sql`${posts.id} != ${excludeIdNum}`);
  }

  const existing = await ctx.db
    .select({ slug: posts.slug })
    .from(posts)
    .where(and(...conditions));

  // If no conflicts, use base slug directly
  if (existing.length === 0) {
    return base;
  }

  // Build a set of taken slugs and find the next available suffix
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) {
    return base;
  }

  let suffix = 1;
  while (taken.has(`${base}-${suffix}`)) {
    suffix++;
  }
  return `${base}-${suffix}`;
}

async function assertCategoriesExist(ctx: Context, categoryIds: number[]) {
  if (!categoryIds.length) {
    return;
  }

  const uniqueIds = Array.from(new Set(categoryIds));
  const records = await ctx.db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, uniqueIds));

  if (records.length !== uniqueIds.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "One or more categories do not exist" });
  }
}

async function setPostCategories(ctx: Context, postId: number, categoryIds?: number[]) {
  if (!categoryIds) {
    return;
  }

  const uniqueIds = Array.from(new Set(categoryIds));
  await assertCategoriesExist(ctx, uniqueIds);

  await ctx.db.transaction(async (tx) => {
    await tx.delete(postsToCategories).where(eq(postsToCategories.postId, postId));

    if (!uniqueIds.length) {
      return;
    }

    await tx.insert(postsToCategories).values(
      uniqueIds.map((categoryId) => ({ postId, categoryId })),
    );
  });
}

async function fetchPost(ctx: Context, where: SQL<unknown>): Promise<PostResponse | null> {
  const record = await ctx.db.query.posts.findFirst({
    where,
    with: {
      categories: {
        with: {
          category: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
      author: true,
    },
  });

  if (!record) {
    return null;
  }

  return mapPost(record as PostWithCategoryLinks);
}

export const postsRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 50;
      const rows = (await ctx.db.query.posts.findMany({
        where: and(eq(posts.published, true), isNull(posts.deletedAt)),
        orderBy: desc(posts.createdAt),
        limit,
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      return rows.map((post) => mapPost(post));
    }),

  listByAuthor: publicProcedure
    .input(z.object({
      authorId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const rows = (await ctx.db.query.posts.findMany({
        where: eq(posts.authorId, input.authorId),
        orderBy: desc(posts.createdAt),
        limit: input.limit,
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      return rows.map((post) => mapPost(post));
    }),

  // List only published posts by an author (for public profile)
  listPublishedByAuthor: publicProcedure
    .input(z.object({
      authorId: z.number().int().positive(),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const rows = (await ctx.db.query.posts.findMany({
        where: and(
          eq(posts.authorId, input.authorId),
          eq(posts.published, true),
          isNull(posts.deletedAt),
        ),
        orderBy: desc(posts.createdAt),
        limit: input.limit,
        with: {
          categories: {
            with: {
              category: true,
            },
          },
          tags: {
            with: {
              tag: true,
            },
          },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      return rows.map((post) => mapPost(post));
    }),

  getById: validatedProcedure(postIdSchema).query(async ({ ctx, input }) => {
    // Convert string IDs to numbers if needed
    const postId = typeof input === 'string' ? Number(input) : input;
    const post = await fetchPost(ctx, eq(posts.id, postId));

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    return post;
  }),
  getBySlug: validatedProcedure(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const post = await fetchPost(ctx, eq(posts.slug, input.slug));

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post;
    }),
  create: validatedProcedure(createPostSchema)
    .use(loggerMiddleware({ logInput: true }))
    .mutation(async ({ ctx, input }) => {
      const slug = await ensureUniquePostSlug(ctx, input.slug ?? input.title);

      try {
        // Convert authorId to number if it's a string
        const authorId = typeof input.authorId === 'string' ? Number(input.authorId) : input.authorId;

        const [created] = await ctx.db
          .insert(posts)
          .values({
            title: input.title,
            subtitle: input.subtitle || null,
            slug,
            content: input.content,
            excerpt: input.excerpt,
            coverImage: input.coverImage || null,
            published: input.published ?? false,
            authorId,
          })
          .returning();

        // Convert categoryIds to numbers if needed
        const categoryIds = input.categoryIds?.map((id: string | number) => typeof id === 'string' ? Number(id) : id);
        await setPostCategories(ctx, created.id, categoryIds);

        // Set tags if provided
        if (input.tagIds?.length) {
          const tagIdNums = input.tagIds.map((id: string | number) => typeof id === 'string' ? Number(id) : id);
          await ctx.db.insert(postsToTags).values(
            tagIdNums.map((tagId: number) => ({ postId: created.id, tagId })),
          );
        }

        const post = await fetchPost(ctx, eq(posts.id, created.id));

        if (!post) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load created post" });
        }
        
        return post;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to create post", cause: error });
      }
    }),
  update: validatedProcedure(updatePostSchema)
    .use(loggerMiddleware({ logInput: true }))
    .mutation(async ({ ctx, input }) => {
      // Convert string IDs to numbers if needed
      const postId = typeof input.id === 'string' ? Number(input.id) : input.id;
      
      const existing = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, postId),
        columns: {
          id: true,
          title: true,
        },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const slugSource = input.slug ?? input.title ?? existing.title;
      const slug = await ensureUniquePostSlug(ctx, slugSource, postId);

      try {
        // Convert authorId to number if it's a string
        const authorId = input.authorId !== undefined 
          ? (typeof input.authorId === 'string' ? Number(input.authorId) : input.authorId)
          : undefined;
        
        await ctx.db
          .update(posts)
          .set({
            title: input.title ?? existing.title,
            slug,
            content: input.content,
            excerpt: input.excerpt,
            coverImage: input.coverImage,
            published: input.published,
            authorId,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId));

        // Convert categoryIds to numbers if needed
        const categoryIds = input.categoryIds?.map((id: string | number) => typeof id === 'string' ? Number(id) : id);
        await setPostCategories(ctx, postId, categoryIds);

        // Update tags if provided
        if (input.tagIds) {
          const tagIdNums = input.tagIds.map((id: string | number) => typeof id === 'string' ? Number(id) : id);
          await ctx.db.delete(postsToTags).where(eq(postsToTags.postId, postId));
          if (tagIdNums.length > 0) {
            await ctx.db.insert(postsToTags).values(
              tagIdNums.map((tagId: number) => ({ postId, tagId })),
            );
          }
        }

        const post = await fetchPost(ctx, eq(posts.id, postId));

        if (!post) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load updated post" });
        }

        return post;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to update post", cause: error });
      }
    }),
  delete: validatedProcedure(postIdSchema)
    .use(loggerMiddleware({ logInput: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert string IDs to numbers if needed
        const postId = typeof input === 'string' ? Number(input) : input;
        
        const [deleted] = await ctx.db
          .delete(posts)
          .where(eq(posts.id, postId))
          .returning({ id: posts.id });

        if (!deleted) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }

        return { id: deleted.id };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to delete post", cause: error });
      }
    }),
  assignCategories: validatedProcedure(assignCategoriesSchema).mutation(async ({ ctx, input }) => {
    // Convert string IDs to numbers if needed
    const postId = typeof input.postId === 'string' ? Number(input.postId) : input.postId;
    
    const post = await ctx.db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { id: true },
    });

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    // Convert categoryIds to numbers if needed
    const categoryIds = input.categoryIds.map((id: string | number) => typeof id === 'string' ? Number(id) : id);
    await setPostCategories(ctx, postId, categoryIds);
    const updated = await fetchPost(ctx, eq(posts.id, postId));

    if (!updated) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load updated post" });
    }

    return updated;
  }),
  filterByCategory: validatedProcedure(filterPostsByCategorySchema).query(async ({ ctx, input }) => {
    // Single query: join categories → junction → posts, filtering by category slug
    const matchedPostIds = await ctx.db
      .select({ postId: postsToCategories.postId })
      .from(postsToCategories)
      .innerJoin(categories, eq(categories.id, postsToCategories.categoryId))
      .where(eq(categories.slug, input.categorySlug));

    if (!matchedPostIds.length) {
      // Check if category exists to distinguish "no posts" from "bad category"
      const categoryExists = await ctx.db.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
        columns: { id: true },
      });
      if (!categoryExists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }
      return [] as PostResponse[];
    }

    const postIds = matchedPostIds.map((r) => r.postId);
    const rows = (await ctx.db.query.posts.findMany({
      where: inArray(posts.id, postIds),
      orderBy: desc(posts.createdAt),
      with: {
        categories: {
          with: {
            category: true,
          },
        },
      },
    })) as PostWithCategoryLinks[];

    return rows.map((post) => mapPost(post));
  }),

  // Paginated list of published posts
  listPaginated: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(12),
      cursor: z.number().int().positive().optional(),
      categorySlug: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 12;
      const conditions: SQL<unknown>[] = [
        eq(posts.published, true),
        isNull(posts.deletedAt),
      ];

      if (input?.cursor) {
        conditions.push(sql`${posts.id} < ${input.cursor}`);
      }

      // Filter by category if provided
      let postIdsInCategory: number[] | null = null;
      if (input?.categorySlug) {
        const cat = await ctx.db.query.categories.findFirst({
          where: eq(categories.slug, input.categorySlug),
          columns: { id: true },
        });
        if (cat) {
          const links = await ctx.db
            .select({ postId: postsToCategories.postId })
            .from(postsToCategories)
            .where(eq(postsToCategories.categoryId, cat.id));
          postIdsInCategory = links.map((l) => l.postId);
          if (postIdsInCategory.length === 0) {
            return { items: [], nextCursor: undefined };
          }
          conditions.push(inArray(posts.id, postIdsInCategory));
        }
      }

      const rows = (await ctx.db.query.posts.findMany({
        where: and(...conditions),
        orderBy: desc(posts.createdAt),
        limit: limit + 1,
        with: {
          categories: { with: { category: true } },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      let nextCursor: number | undefined;
      if (rows.length > limit) {
        const last = rows.pop()!;
        nextCursor = last.id;
      }

      return {
        items: rows.map(mapPost),
        nextCursor,
      };
    }),

  // Full text search across posts
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(200),
      limit: z.number().int().min(1).max(50).default(12),
      cursor: z.number().int().positive().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query}%`;

      const conditions: SQL<unknown>[] = [
        eq(posts.published, true),
        isNull(posts.deletedAt),
        or(
          ilike(posts.title, searchTerm),
          ilike(posts.content, searchTerm),
          ilike(posts.excerpt, searchTerm),
        )!,
      ];

      if (input.cursor) {
        conditions.push(sql`${posts.id} < ${input.cursor}`);
      }

      const rows = (await ctx.db.query.posts.findMany({
        where: and(...conditions),
        orderBy: desc(posts.createdAt),
        limit: limit + 1,
        with: {
          categories: { with: { category: true } },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      let nextCursor: number | undefined;
      if (rows.length > limit) {
        const last = rows.pop()!;
        nextCursor = last.id;
      }

      return {
        items: rows.map(mapPost),
        nextCursor,
      };
    }),

  // Trending posts (by like count in recent period)
  trending: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(20).default(7),
      days: z.number().int().min(1).max(90).default(30),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 7;
      const days = input?.days ?? 30;

      const since = new Date();
      since.setDate(since.getDate() - days);

      // Get posts ranked by recent like count
      const trending = await ctx.db
        .select({
          postId: likes.postId,
          likeCount: sql<number>`count(*)::int`,
        })
        .from(likes)
        .where(sql`${likes.createdAt} >= ${since}`)
        .groupBy(likes.postId)
        .orderBy(sql`count(*) desc`)
        .limit(limit);

      if (!trending.length) {
        // Fallback: return most recent published posts
        const rows = (await ctx.db.query.posts.findMany({
          where: and(eq(posts.published, true), isNull(posts.deletedAt)),
          orderBy: desc(posts.createdAt),
          limit,
          with: {
            categories: { with: { category: true } },
            author: true,
          },
        })) as PostWithCategoryLinks[];

        return rows.map((post) => ({
          ...mapPost(post),
          likeCount: 0,
        }));
      }

      const postIds = trending.map((t) => t.postId);
      const likeCounts = new Map(trending.map((t) => [t.postId, t.likeCount]));

      const rows = (await ctx.db.query.posts.findMany({
        where: and(inArray(posts.id, postIds), eq(posts.published, true), isNull(posts.deletedAt)),
        with: {
          categories: { with: { category: true } },
          author: true,
        },
      })) as PostWithCategoryLinks[];

      // Sort by like count descending
      return rows
        .map((post) => ({
          ...mapPost(post),
          likeCount: likeCounts.get(post.id) ?? 0,
        }))
        .sort((a, b) => b.likeCount - a.likeCount);
    }),
});
