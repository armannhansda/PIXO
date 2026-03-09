"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { BlogPost } from "./mock-data.ts";

type BentoVariant = "hero" | "wide" | "tall" | "standard";

interface BentoCardProps {
  post: BlogPost;
  variant?: BentoVariant;
  index?: number;
}

const variantClasses: Record<BentoVariant, string> = {
  hero: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2 md:row-span-1",
  tall: "md:col-span-1 md:row-span-2",
  standard: "md:col-span-1 md:row-span-1",
};

export function BentoCard({
  post,
  variant = "standard",
  index = 0,
}: BentoCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  const isLargeText = variant === "hero" || variant === "wide";
  const isOverlay = variant === "hero" || variant === "tall";

  return (
    <motion.div
      className={`${variantClasses[variant]} group relative`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/post/${post.id}`} className="block h-full">
        <div
          className={`relative h-full rounded-2xl border border-border overflow-hidden transition-shadow duration-300 hover:shadow-xl
            ${isOverlay ? "min-h-[360px] md:min-h-[420px]" : ""}
            ${variant === "wide" ? "min-h-[240px]" : ""}
            ${variant === "standard" ? "min-h-[280px]" : ""}
          `}
        >
          {/* Background Image */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 ${
              isOverlay
                ? "bg-gradient-to-t from-black/80 via-black/30 to-black/5"
                : "bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            }`}
          />

          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span
              className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full border border-white/10"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}
            >
              {post.category}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                  saved
                    ? "bg-accent/80 text-white"
                    : "bg-white/15 text-white/80 hover:bg-white/25 hover:text-white border border-white/10"
                }`}
              >
                <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <div className="p-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            {/* Reading time pill */}
            <div className="flex items-center gap-1.5 mb-3">
              <Clock size={12} className="text-white/60" />
              <span className="text-white/60" style={{ fontSize: 12 }}>
                {post.readingTime}
              </span>
            </div>

            <h3
              className="text-white mb-1.5 line-clamp-2 group-hover:translate-x-1 transition-transform duration-300"
              style={{
                fontSize: isLargeText ? 24 : variant === "tall" ? 20 : 17,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {post.title}
            </h3>

            {(isLargeText || variant === "tall") && (
              <p
                className={`text-white/70 mb-3 ${variant === "hero" ? "line-clamp-3" : "line-clamp-2"}`}
                style={{ fontSize: 14, lineHeight: 1.6 }}
              >
                {post.preview}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className={`rounded-full object-cover border border-white/20 ${
                    isLargeText ? "w-9 h-9" : "w-7 h-7"
                  }`}
                />
                <div>
                  <p
                    className="text-white"
                    style={{ fontSize: isLargeText ? 14 : 12, fontWeight: 600 }}
                  >
                    {post.author.name}
                  </p>
                  <p className="text-white/50" style={{ fontSize: 11 }}>
                    {post.date}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full backdrop-blur-md transition-all ${
                  liked
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                style={{ fontSize: 12 }}
              >
                <Heart size={13} fill={liked ? "currentColor" : "none"} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ---------- Bento Grid Container ---------- */

interface BentoGridProps {
  posts: BlogPost[];
  /** Repeating layout pattern for bento tiles */
  pattern?: BentoVariant[];
}

/**
 * Default bento pattern repeats every 6 items:
 * Row 1:  [wide]  [tall↓]
 * Row 2:  [std] [std]  [tall↓ cont.]
 * Row 3:  [hero ↔↕]   [std]
 *
 * Visually interesting & responsive.
 */
const DEFAULT_PATTERN: BentoVariant[] = [
  "wide", // 0
  "standard", // 1
  "standard", // 2
  "standard", // 3
  "wide", // 4
  "standard", // 5
];

export function BentoGrid({
  posts,
  pattern = DEFAULT_PATTERN,
}: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(220px,auto)] [grid-auto-flow:dense]">
      {posts.map((post, i) => {
        const variant = pattern[i % pattern.length];
        return (
          <BentoCard key={post.id} post={post} variant={variant} index={i} />
        );
      })}
    </div>
  );
}

/** Hero-first pattern for the explore page */
export const EXPLORE_PATTERN: BentoVariant[] = [
  "hero", // 0
  "standard", // 1
  "standard", // 2
  "wide", // 3
  "standard", // 4
  "standard", // 5
  "standard", // 6
  "tall", // 7
  "wide", // 8
];
