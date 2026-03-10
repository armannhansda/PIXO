"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  Bookmark,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import { TrendingSection } from "./components/trending-section";
import type { BlogPost } from "./components/mock-data";
import CircularLoading from "./components/circular-loading";

const trendingTags = [
  "Design Systems",
  "AI & ML",
  "Remote Work",
  "Sustainability",
  "Typography",
  "Architecture",
  "Minimalism",
  "Productivity",
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: postsData, isLoading } = api.posts.list.useQuery();

  const blogPosts = (postsData ?? []).map(mapPostToUI);

  // Data splits for sections
  const featured = blogPosts.slice(0, 3);
  const trending = blogPosts.slice(3, 6);
  const latest = blogPosts.slice(5, 11);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/explore?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative pt-18 pb-10 md:pt-30 md:pb-18 px-3 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full mb-6"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            <Sparkles size={14} />
            Welcome to PIXO
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(36px, 7vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Discover Ideas
            <br />
            <span className="text-accent">That Matter</span>
          </motion.h1>

          {/* <motion.p
            className="text-muted-foreground mt-5 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 18, lineHeight: 1.6 }}
          >
            Explore stories, insights, and perspectives from creators and
            thinkers shaping the future.
          </motion.p> */}

          {/* Search Bar */}
          <motion.div
            className="mt-8 max-w-xl mx-auto "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="relative group rounded-full">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Search articles, topics, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="w-full pl-13 pr-5 py-4 bg-surface border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm"
                style={{ fontSize: 15 }}
              />
              {/* <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  Search
                </button>
              </div> */}
            </div>
          </motion.div>

          {/* Trending Tags */}
          <motion.div
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span
              className="text-muted-foreground mr-1"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Trending:
            </span>
            {trendingTags.map((tag) => (
              <Link
                key={tag}
                href="/explore"
                className="px-3 py-1 bg-surface/80 border border-border text-muted-foreground rounded-full hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
                style={{ fontSize: 12, fontWeight: 500 }}
              >
                {tag}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURED ARTICLES ═══════════════════════ */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10">
                <Sparkles size={18} className="text-accent" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                  Featured Articles
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: 14 }}>
                  Hand-picked stories worth your time
                </p>
              </div>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1.5 text-accent hover:gap-2.5 transition-all"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Featured Grid: 1 hero left + 2 stacked right */}
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Hero featured card */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <FeaturedHeroCard post={featured[0]} />
              </motion.div>

              {/* Two stacked side cards */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-5">
                {featured.slice(1, 3).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  >
                    <FeaturedSideCard post={post} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <CircularLoading />
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No featured articles yet.
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ TRENDING ARTICLES ═══════════════════════ */}
      <section className="px-4 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/10">
                <TrendingUp size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                  Trending Now
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: 14 }}>
                  What the community is reading right now
                </p>
              </div>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1.5 text-accent hover:gap-2.5 transition-all"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              See all trending
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Trending Image Overlay Grid */}
          <TrendingSection posts={trending} />
        </div>
      </section>

      {/* ═══════════════════════ LATEST POSTS ═══════════════════════ */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10">
                <Clock size={18} className="text-emerald-500" />
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                  Latest Posts
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: 14 }}>
                  Fresh perspectives, just published
                </p>
              </div>
            </div>
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-1.5 text-accent hover:gap-2.5 transition-all"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              Browse all
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Latest Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {latest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                <LatestPostCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════ FEATURED HERO CARD ════════════════════════ */

function FeaturedHeroCard({ post }: { post: BlogPost }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved);

  return (
    <Link href={`/post/${post.id}`} className="block h-full group">
      <div className="relative h-full min-h-[360px] md:min-h-[440px] rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />

        {/* Top bar */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 bg-accent/80 text-white rounded-full"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}
            >
              Featured
            </span>
            <span
              className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full border border-white/10"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {post.category}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              setSaved(!saved);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              saved
                ? "bg-accent/80 text-white"
                : "bg-white/15 text-white/80 hover:bg-white/25 border border-white/10"
            }`}
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-white/60" />
            <span className="text-white/60" style={{ fontSize: 13 }}>
              {post.readingTime}
            </span>
          </div>

          <h2
            className="text-white mb-2 group-hover:translate-x-1 transition-transform duration-300"
            style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
          >
            {post.title}
          </h2>
          <p
            className="text-white/70 mb-4 line-clamp-2 max-w-lg"
            style={{ fontSize: 15, lineHeight: 1.6 }}
          >
            {post.preview}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <p
                  className="text-white"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {post.author.name}
                </p>
                <p className="text-white/50" style={{ fontSize: 12 }}>
                  {post.date}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setLiked(!liked);
                setLikeCount((c) => (liked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${
                liked
                  ? "bg-red-500/20 text-red-400"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              style={{ fontSize: 13 }}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════ FEATURED SIDE CARD ════════════════════════ */

function FeaturedSideCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/post/${post.id}`} className="block h-full group">
      <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl">
        <img
          src={post.coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

        {/* Category pill */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="px-3 py-1 bg-white/15 backdrop-blur-md text-white rounded-full border border-white/10"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {post.category}
          </span>
        </div>

        {/* Arrow on hover */}
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <div className="p-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/10">
            <ArrowUpRight size={14} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-white/60" />
            <span className="text-white/60" style={{ fontSize: 12 }}>
              {post.readingTime}
            </span>
          </div>
          <h3
            className="text-white mb-1 line-clamp-2 group-hover:translate-x-1 transition-transform duration-300"
            style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}
          >
            {post.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
            <span
              className="text-white/70"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {post.author.name}
            </span>
            <span className="text-white/40" style={{ fontSize: 11 }}>
              {post.date}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════ LATEST POST CARD ════════════════════════ */

function LatestPostCard({ post }: { post: BlogPost }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <Link href={`/post/${post.id}`} className="block group">
      <div className="rounded-2xl border border-border overflow-hidden bg-card hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Category pill */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 bg-white/15 backdrop-blur-md text-white rounded-full border border-white/10"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-muted-foreground" />
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>
              {post.readingTime}
            </span>
            <span className="text-border mx-1">|</span>
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>
              {post.date}
            </span>
          </div>

          <h3
            className="mb-2 line-clamp-2 group-hover:text-accent transition-colors"
            style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35 }}
          >
            {post.title}
          </h3>

          <p
            className="text-muted-foreground mb-4 line-clamp-2 flex-1"
            style={{ fontSize: 14, lineHeight: 1.6 }}
          >
            {post.preview}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {post.author.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                setLiked(!liked);
                setLikeCount((c) => (liked ? c - 1 : c + 1));
              }}
              className={`flex items-center gap-1 transition-colors ${
                liked
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              }`}
              style={{ fontSize: 13 }}
            >
              <Heart size={14} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
