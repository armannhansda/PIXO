import { z } from "zod";

export const notificationIdSchema = z.number().int().positive({ message: "Notification ID must be a positive integer" });

export const listNotificationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.number().int().positive().optional(),
  unreadOnly: z.boolean().default(false),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.number().int().positive()).min(1),
});
