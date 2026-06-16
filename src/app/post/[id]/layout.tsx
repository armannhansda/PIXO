import type { Metadata, ResolvingMetadata } from "next";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);

  if (isNaN(postId)) {
    return {
      title: "Post Not Found | PIXO",
    };
  }

  const post = await db().query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: true,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found | PIXO",
    };
  }

  // Optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt || post.subtitle || `Read ${post.title} on PIXO.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.subtitle || `Read ${post.title} on PIXO.`,
      url: `https://pixo.app/post/${postId}`,
      type: "article",
      publishedTime: post.createdAt?.toISOString(),
      authors: [post.author?.name || "Anonymous"],
      images: post.coverImage
        ? [post.coverImage, ...previousImages]
        : previousImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.subtitle || `Read ${post.title} on PIXO.`,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default function PostLayout({ children }: Props) {
  return <>{children}</>;
}
