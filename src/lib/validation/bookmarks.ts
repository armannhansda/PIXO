import { z } from "zod";

export const toggleBookmarkSchema = z.object({
  postId: z.number().int().positive({ message: "Post ID must be a positive integer" }),
});

export const bookmarkStatusSchema = z.object({
  postId: z.number().int().positive({ message: "Post ID must be a positive integer" }),
});
