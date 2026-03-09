import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Clock, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { BlogPost } from "./mock-data.ts";
import Image from "next/image.js";
import { optimizeImage } from "@/lib/cloudinary.js";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  showEditButton?: boolean;
  onDelete?: (postId: string) => void;
}

export function BlogCard({
  post,
  featured = false,
  showEditButton = false,
  onDelete,
}: BlogCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setSaved(!saved);
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href={`/post/${post.id}`} className="block group">
          <div className="grid md:grid-cols-2 gap-6 bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
              <Image
                src={optimizeImage(post.coverImage)}
                alt={post.title}
                width={800}
                height={450}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span
                className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full mb-4 w-fit"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {post.category}
              </span>
              <h2
                className="mb-2 group-hover:text-accent transition-colors"
                style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}
              >
                {post.title}
              </h2>
              <p
                className="text-muted-foreground mb-6"
                style={{ fontSize: 16, lineHeight: 1.6 }}
              >
                {post.preview}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.author.username || post.author.id ? (
                    <Link
                      href={`/profile/${post.author.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      {post.author.avatar ? (
                        <Image
                          src={optimizeImage(post.author.avatar, 80)}
                          alt={post.author.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>
                          {post.author.name}
                        </p>
                        <div
                          className="flex items-center gap-2 text-muted-foreground"
                          style={{ fontSize: 12 }}
                        >
                          <span>{post.date}</span>
                          <span>·</span>
                          <Clock size={12} />
                          <span>{post.readingTime}</span>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>
                          {post.author.name}
                        </p>
                        <div
                          className="flex items-center gap-2 text-muted-foreground"
                          style={{ fontSize: 12 }}
                        >
                          <span>{post.date}</span>
                          <span>·</span>
                          <Clock size={12} />
                          <span>{post.readingTime}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                  >
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-full transition-colors ${saved ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
                  >
                    <Bookmark
                      size={18}
                      fill={saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/post/${post.id}`} className="block group">
        <div className="relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {showEditButton && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/write/edit/${post.id}`);
                }}
                className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background transition-colors text-muted-foreground hover:text-foreground shadow-sm"
                title="Edit post"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.(post.id);
                }}
                className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-red-500 shadow-sm"
                title="Delete post"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <div className="aspect-[16/10] overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-5">
            <span
              className="inline-block px-2.5 py-0.5 bg-accent/10 text-accent rounded-full mb-3"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {post.category}
            </span>
            <h3
              className="mb-2 group-hover:text-accent transition-colors"
              style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}
            >
              {post.title}
            </h3>
            <p
              className="text-muted-foreground mb-4 line-clamp-2"
              style={{ fontSize: 14, lineHeight: 1.6 }}
            >
              {post.preview}
            </p>
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2"
                {...(post.author.username || post.author.id
                  ? {
                      role: "link",
                      onClick: (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(
                          `/profile/${post.author.username || post.author.id}`,
                        );
                      },
                      style: { cursor: "pointer" },
                    }
                  : {})}
              >
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <span
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontSize: 13, fontWeight: 500 }}
                >
                  {post.author.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1 text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  <Clock size={12} />
                  <span>{post.readingTime}</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                  style={{ fontSize: 12 }}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
