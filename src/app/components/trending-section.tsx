"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Bookmark, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import type { BlogPost } from "./mock-data";

interface TrendingCardProps {
  post: BlogPost;
  rank: number;
  size: "large" | "medium" | "small";
  index: number;
}

function TrendingCard({ post, rank, size, index }: TrendingCardProps) {
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

  const isLarge = size === "large";
  const isSmall = size === "small";

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/post/${post.id}`} className="block h-full">
        <div
          className={`relative h-full rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl ${
            isLarge
              ? "min-h-[400px]"
              : isSmall
                ? "min-h-[240px]"
                : "min-h-[220px]"
          }`}
        >
          {/* Full-bleed Image */}
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

          {/* Rank Number */}
          <div className="absolute top-4 left-4 z-20">
            <div
              className="flex items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/15"
              style={{
                width: isLarge ? 52 : 40,
                height: isLarge ? 52 : 40,
              }}
            >
              <span
                className="text-white"
                style={{
                  fontSize: isLarge ? 24 : 18,
                  fontWeight: 800,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {rank}
              </span>
            </div>
          </div>

          {/* Top-right Actions */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
            <span
              className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full border border-white/10"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}
            >
              {post.category}
            </span>
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

          {/* Hover Arrow */}
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
            <div className="p-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10">
              <ArrowUpRight size={14} className="text-white" />
            </div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
            {/* Reading time */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock size={12} className="text-white/60" />
              <span className="text-white/60" style={{ fontSize: 12 }}>
                {post.readingTime}
              </span>
            </div>

            <h3
              className="text-white mb-1.5 line-clamp-2 group-hover:translate-x-1 transition-transform duration-300"
              style={{
                fontSize: isLarge ? 26 : isSmall ? 16 : 20,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {post.title}
            </h3>

            {!isSmall && (
              <p
                className={`text-white/70 mb-3 ${isLarge ? "line-clamp-3" : "line-clamp-2"}`}
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
                    isLarge ? "w-9 h-9" : "w-7 h-7"
                  }`}
                />
                <div>
                  <p
                    className="text-white"
                    style={{ fontSize: isLarge ? 14 : 12, fontWeight: 600 }}
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

/* ---------- Trending Section Layout ---------- */

interface TrendingSectionProps {
  posts: BlogPost[];
}

export function TrendingSection({ posts }: TrendingSectionProps) {
  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
      {posts.slice(0, 3).map((post, i) => (
        <TrendingCard
          key={post.id}
          post={post}
          rank={i + 1}
          size="medium"
          index={i}
        />
      ))}
    </div>
  );
}
