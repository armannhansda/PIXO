import { z } from "zod";

export const toggleFollowSchema = z.object({
  targetUserId: z.number().int().positive({ message: "User ID must be a positive integer" }),
});

export const followStatusSchema = z.object({
  targetUserId: z.number().int().positive({ message: "User ID must be a positive integer" }),
});

export const listFollowersSchema = z.object({
  userId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.number().int().positive().optional(),
});
