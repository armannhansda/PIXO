import { db, sql } from './index';
import { eq, and, sql as drizzleSql } from 'drizzle-orm';
import { users, posts, categories, postsToCategories } from './schema';
import type { NewPost, NewCategory, NewUser } from './types';

/**
 * Database utility functions for common operations
 */

export async function findUserByEmail(email: string) {
  return db().query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function createUser(userData: NewUser) {
  const [user] = await db().insert(users).values(userData).returning();
  return user;
}

export async function findPostBySlug(slug: string) {
  return db().query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      author: true,
      categories: {
        with: {
          category: true,
        },
      },
    },
  });
}

export async function findAllPosts({ published = true } = {}) {
  return db().query.posts.findMany({
    where: published ? eq(posts.published, true) : undefined,
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: {
      author: true,
      categories: {
        with: {
          category: true,
        },
      },
    },
  });
}

export async function createPost(postData: NewPost, categoryIds: number[]) {
  // Begin transaction
  return await db().transaction(async (tx) => {
    const [post] = await tx.insert(posts).values(postData).returning();
    
    if (categoryIds.length > 0) {
      // Add categories
      await tx.insert(postsToCategories).values(
        categoryIds.map(categoryId => ({
          postId: post.id,
          categoryId,
        }))
      );
    }
    
    return post;
  });
}

export async function findAllCategories() {
  return db().query.categories.findMany({
    with: {
      posts: {
        with: {
          post: true,
        },
      },
    },
  });
}

export async function findCategoryBySlug(slug: string) {
  return db().query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: {
      posts: {
        with: {
          post: {
            with: {
              author: true,
            },
          },
        },
      },
    },
  });
}

export async function createCategory(categoryData: NewCategory) {
  const [category] = await db().insert(categories).values(categoryData).returning();
  return category;
}

export async function countPostsByCategory() {
  const result = await db().execute(drizzleSql`
    SELECT c.id, c.name, c.slug, COUNT(pc.post_id) as post_count
    FROM categories c
    LEFT JOIN posts_to_categories pc ON c.id = pc.category_id
    LEFT JOIN posts p ON pc.post_id = p.id AND p.published = true
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
  `);
  
  return result;
}