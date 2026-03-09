import { z } from "zod";

export const categoryIdSchema = z
  .string()
  .uuid({ message: "Category ID must be a valid UUID" })
  .or(z.number().int().positive({ message: "Category ID must be a positive integer" }));

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" })
    .trim(),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters long" })
    .max(50, { message: "Slug must be at most 50 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen" 
    })
    .optional(),
  description: z
    .string()
    .max(200, { message: "Description must be at most 200 characters long" })
    .optional()
    .nullable(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({
    id: categoryIdSchema,
  })
  .refine(data => Object.keys(data).length > 1, {
    message: "At least one field must be provided for update",
    path: ["_errors"],
  });

export const getCategoryBySlugSchema = z.object({
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters long" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { 
      message: "Slug must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen" 
    }),
});
