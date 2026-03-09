import { z } from "zod";

export const postIdSchema = z
  .string()
  .uuid({ message: "Post ID must be a valid UUID" })
  .or(z.number().int().positive({ message: "Post ID must be a positive integer" }));

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" })
    .trim(),
  subtitle: z
    .string()
    .max(255, { message: "Subtitle must be at most 255 characters long" })
    .trim()
    .optional()
    .nullable(),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters long" })
    .max(100, { message: "Slug must be at most 100 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen" 
    }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters long" })
    .trim(),
  excerpt: z
    .string()
    .min(1, { message: "Excerpt is required" })
    .max(200, { message: "Excerpt must be at most 200 characters long" })
    .trim(),
  coverImage: z
    .string()
    .transform((val) => (val === '' || !val ? undefined : val))
    .optional()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
      { message: "Cover image must be a valid URL" }
    ),
  published: z.boolean().default(false),
  authorId: z
    .number()
    .int()
    .positive({ message: "Author ID must be a positive integer" }),
  categoryIds: z
    .array(
      z.number().int().positive({ message: "Category ID must be a positive integer" })
    )
    .optional(),
  tagIds: z
    .array(
      z.number().int().positive({ message: "Tag ID must be a positive integer" })
    )
    .optional(),
});

export const updatePostSchema = createPostSchema
  .partial()
  .extend({
    id: postIdSchema,
  })
  .refine(data => Object.keys(data).length > 1, {
    message: "At least one field must be provided for update",
    path: ["_errors"],
  });

export const assignCategoriesSchema = z.object({
  postId: postIdSchema,
  categoryIds: z
    .array(
      z.string().uuid({ message: "Category ID must be a valid UUID" })
        .or(z.number().int().positive({ message: "Category ID must be a positive integer" }))
    )
    .min(1, { message: "At least one category ID must be provided" }),
});

export const filterPostsByCategorySchema = z.object({
  categorySlug: z
    .string()
    .min(2, { message: "Category slug must be at least 2 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen"
    }),
});
