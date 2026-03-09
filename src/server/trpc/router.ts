import { createTRPCRouter } from "./trpc";
import { postsRouter } from "./routers/posts";
import { categoriesRouter } from "./routers/categories";
import { authRouter } from "./routers/auth";
import { usersRouter } from "./routers/users";
import { likesRouter } from "./routers/likes";
import { bookmarksRouter } from "./routers/bookmarks";
import { commentsRouter } from "./routers/comments";
import { followersRouter } from "./routers/followers";
import { notificationsRouter } from "./routers/notifications";
import { tagsRouter } from "./routers/tags";

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  categories: categoriesRouter,
  auth: authRouter,
  users: usersRouter,
  likes: likesRouter,
  bookmarks: bookmarksRouter,
  comments: commentsRouter,
  followers: followersRouter,
  notifications: notificationsRouter,
  tags: tagsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;