import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  users,
  posts,
  categories,
  postsToCategories,
  tags,
  postsToTags,
  likes,
  bookmarks,
  comments,
  followers,
  notifications,
} from './schema';

// ─── Select types (returned from queries) ────────────────
export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type Category = InferSelectModel<typeof categories>;
export type PostToCategory = InferSelectModel<typeof postsToCategories>;
export type Tag = InferSelectModel<typeof tags>;
export type PostToTag = InferSelectModel<typeof postsToTags>;
export type Like = InferSelectModel<typeof likes>;
export type Bookmark = InferSelectModel<typeof bookmarks>;
export type Comment = InferSelectModel<typeof comments>;
export type Follower = InferSelectModel<typeof followers>;
export type Notification = InferSelectModel<typeof notifications>;

// ─── Insert types (used when inserting data) ─────────────
export type NewUser = InferInsertModel<typeof users>;
export type NewPost = InferInsertModel<typeof posts>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewPostToCategory = InferInsertModel<typeof postsToCategories>;
export type NewTag = InferInsertModel<typeof tags>;
export type NewPostToTag = InferInsertModel<typeof postsToTags>;
export type NewLike = InferInsertModel<typeof likes>;
export type NewBookmark = InferInsertModel<typeof bookmarks>;
export type NewComment = InferInsertModel<typeof comments>;
export type NewFollower = InferInsertModel<typeof followers>;
export type NewNotification = InferInsertModel<typeof notifications>;

// ─── Post with relations ─────────────────────────────────
export type PostWithRelations = Post & {
  author: User;
  categories: (PostToCategory & {
    category: Category;
  })[];
  tags?: (PostToTag & {
    tag: Tag;
  })[];
  _count?: {
    likes: number;
    comments: number;
  };
};

// ─── Category with posts ─────────────────────────────────
export type CategoryWithPosts = Category & {
  posts: (PostToCategory & {
    post: Post & {
      author: User;
    };
  })[];
};

// ─── Comment with relations ──────────────────────────────
export type CommentWithRelations = Comment & {
  author: Omit<User, 'password'>;
  replies?: CommentWithRelations[];
};

// ─── User profile with stats ─────────────────────────────
export type UserProfile = Omit<User, 'password'> & {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};