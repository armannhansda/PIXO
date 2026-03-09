import { z } from "zod";

export const toggleLikeSchema = z.object({
  postId: z.number().int().positive({ message: "Post ID must be a positive integer" }),
});

export const likeStatusSchema = z.object({
  postId: z.number().int().positive({ message: "Post ID must be a positive integer" }),
});
