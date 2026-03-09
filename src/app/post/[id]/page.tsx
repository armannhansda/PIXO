"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Heart,
  Bookmark,
  Share2,
  Twitter,
  Facebook,
  Link2,
  ArrowLeft,
  Clock,
  MessageCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { IMAGES } from "../../components/mock-data";
import { ContentRenderer } from "../../components/content-renderer";
import { api } from "@/lib/trpc";

export default function BlogPostPage() {
  const { id } = useParams();
  const postId = Number(id);

  const { data: postData, isLoading } = api.posts.getById.useQuery(postId, {
    enabled: !!postId && !isNaN(postId),
  });
  const { data: likeStatus } = api.likes.status.useQuery(
    { postId },
    { enabled: !!postId && !isNaN(postId) },
  );
  const { data: bookmarkStatus } = api.bookmarks.status.useQuery(
    { postId },
    { enabled: !!postId && !isNaN(postId) },
  );

  const likeMutation = api.likes.toggle.useMutation();
  const bookmarkMutation = api.bookmarks.toggle.useMutation();

  const utils = api.useUtils();

  const [readProgress, setReadProgress] = useState(0);

  const liked = likeStatus?.liked ?? false;
  const likeCount = likeStatus?.count ?? 0;
  const saved = bookmarkStatus?.saved ?? false;

  // Map API post to display shape
  const post = useMemo(() => {
    if (!postData) return null;
    const wordCount = postData.content
      ? postData.content.split(/\s+/).length
      : 0;
    const readMin = Math.max(1, Math.ceil(wordCount / 200));
    return {
      id: String(postData.id),
      title: postData.title,
      subtitle: postData.subtitle || "",
      content: postData.content,
      coverImage: postData.coverImage || IMAGES.tech,
      author: {
        name: postData.author?.name || "Unknown",
        avatar: (postData.author as any)?.profileImage || "",
      },
      readingTime: `${readMin} min read`,
      category: postData.categories?.[0]?.name || "General",
      tags: postData.tags?.map((t: any) => t.name) || [],
      date: postData.createdAt
        ? new Date(postData.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
    };
  }, [postData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLike = () => {
    likeMutation.mutate(
      { postId },
      {
        onSuccess: () => {
          utils.likes.status.invalidate({ postId });
        },
      },
    );
  };

  const toggleSave = () => {
    bookmarkMutation.mutate(
      { postId },
      {
        onSuccess: () => {
          utils.bookmarks.status.invalidate({ postId });
        },
      },
    );
  };

  // Extract headings from content for TOC
  const toc = useMemo(() => {
    if (!postData?.content) return [];
    const headingRegex = /^#{1,3}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;
    while ((match = headingRegex.exec(postData.content)) !== null) {
      headings.push(match[1]);
    }
    return headings;
  }, [postData?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <motion.div
          className="h-full bg-accent"
          style={{ width: `${readProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Cover Image */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              style={{ fontSize: 14 }}
            >
              <ArrowLeft size={16} />
              Back to feed
            </Link>
            <span
              className="inline-block px-3 py-1 bg-accent text-white rounded-full mb-4"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {post.category}
            </span>
            <h1
              className="text-white mb-3"
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {post.title}
            </h1>
            <p className="text-white/80" style={{ fontSize: 18 }}>
              {post.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-12">
          {/* Main Content */}
          <article className="flex-1 max-w-3xl">
            {/* Author Section */}
            <div className="flex items-center justify-between pb-8 mb-8 border-b border-border">
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {post.author.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href="/profile"
                    style={{ fontSize: 15, fontWeight: 600 }}
                    className="hover:text-accent transition-colors"
                  >
                    {post.author.name}
                  </Link>
                  <div
                    className="flex items-center gap-3 text-muted-foreground"
                    style={{ fontSize: 13 }}
                  >
                    <span>{post.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readingTime}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="px-4 py-2 border border-accent text-accent rounded-full hover:bg-accent hover:text-white transition-all"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                Follow
              </button>
            </div>

            {/* Article Content */}
            <div
              className="prose-custom"
              style={{ fontSize: 17, lineHeight: 1.9 }}
            >
              <ContentRenderer content={post.content} />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    liked
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-border text-muted-foreground hover:border-red-200 hover:text-red-500"
                  }`}
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  <MessageCircle size={16} />
                  24
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSave}
                  className={`p-2 rounded-full transition-colors ${
                    saved
                      ? "text-accent"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
                </button>
                <button className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Table of Contents */}
              <div>
                <h4
                  className="mb-3 text-muted-foreground uppercase tracking-wide"
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  Table of Contents
                </h4>
                <nav className="space-y-1">
                  {toc.map((item, i) => (
                    <button
                      key={i}
                      className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                      style={{ fontSize: 13, lineHeight: 1.4 }}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Share */}
              <div>
                <h4
                  className="mb-3 text-muted-foreground uppercase tracking-wide"
                  style={{ fontSize: 11, fontWeight: 700 }}
                >
                  Share
                </h4>
                <div className="flex gap-2">
                  {[Twitter, Facebook, Link2].map((Icon, i) => (
                    <button
                      key={i}
                      className="p-2.5 bg-surface hover:bg-border rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={toggleSave}
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-xl border transition-all ${
                  saved
                    ? "border-accent bg-accent/5 text-accent"
                    : "border-border text-muted-foreground hover:border-accent hover:text-accent"
                }`}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                {saved ? "Saved" : "Save Post"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
