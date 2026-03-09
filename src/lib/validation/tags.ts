import { z } from "zod";

export const tagIdSchema = z.number().int().positive({ message: "Tag ID must be a positive integer" });

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(50, { message: "Tag name must be at most 50 characters" })
    .trim(),
});

export const searchTagsSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().min(1).max(50).default(10),
});
