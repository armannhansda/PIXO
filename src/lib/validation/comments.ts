import { z } from "zod";

export const commentIdSchema = z.number().int().positive({ message: "Comment ID must be a positive integer" });

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(5000, { message: "Comment must be at most 5000 characters" })
    .trim(),
  postId: z.number().int().positive({ message: "Post ID must be a positive integer" }),
  parentId: z.number().int().positive({ message: "Parent ID must be a positive integer" }).optional(),
});

export const updateCommentSchema = z.object({
  id: commentIdSchema,
  content: z
    .string()
    .min(1, { message: "Comment cannot be empty" })
    .max(5000, { message: "Comment must be at most 5000 characters" })
    .trim(),
});

export const listCommentsByPostSchema = z.object({
  postId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.number().int().positive().optional(),
});
