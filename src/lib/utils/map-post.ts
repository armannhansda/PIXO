import { IMAGES } from "@/app/components/mock-data";
import type { BlogPost } from "@/app/components/mock-data";

/**
 * Transforms a backend post response into the BlogPost shape used by UI components.
 */
export function mapPostToUI(post: any): BlogPost {
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));
  return {
    id: String(post.id),
    title: post.title,
    subtitle: post.subtitle || "",
    preview: post.excerpt || post.content?.slice(0, 160) || "",
    content: post.content,
    coverImage: post.coverImage || IMAGES.tech,
    author: {
      id: String(post.author?.id || ""),
      name: post.author?.name || "Unknown",
      username: post.author?.username || "",
      avatar: post.author?.profileImage || "",
      bio: post.author?.bio || "",
      location: post.author?.location || "",
      joinDate: "",
      posts: 0,
      followers: 0,
      following: 0,
    },
    readingTime: `${readMin} min read`,
    likes: 0,
    liked: false,
    saved: false,
    category: post.categories?.[0]?.name || "General",
    date: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    tags: post.tags?.map((t: any) => t.name) || [],
  };
}
