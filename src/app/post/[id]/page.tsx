"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, Heart, MessageCircle, Bookmark, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { ContentRenderer } from "../../components/content-renderer";
import { CommentsSection } from "../../components/comments-section";
import { api } from "@/lib/trpc";
import CircularLoading from "@/app/components/circular-loading";
import { Footer } from "../../components/footer";


export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const postId = Number(id);

  // Backend queries
  const { data: postData, isLoading } = api.posts.getById.useQuery(postId, {
    enabled: !!postId && !isNaN(postId),
    retry: false,
  });
  const { data: likeStatus } = api.likes.status.useQuery(
    { postId },
    { enabled: !!postId && !isNaN(postId), retry: false }
  );
  const { data: bookmarkStatus } = api.bookmarks.status.useQuery(
    { postId },
    { enabled: !!postId && !isNaN(postId), retry: false }
  );

  const likeMutation = api.likes.toggle.useMutation();
  const bookmarkMutation = api.bookmarks.toggle.useMutation();
  const utils = api.useUtils();

  // Local fallback states in case database/auth is offline
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localSaved, setLocalSaved] = useState(false);

  // Map API post to display shape strictly from database
  const post = useMemo(() => {
    const rawPost = postData;
    if (!rawPost) return null;

    const wordCount = rawPost.content ? rawPost.content.split(/\s+/).length : 0;
    const readMin = Math.max(1, Math.ceil(wordCount / 200));

    return {
      id: String(rawPost.id),
      title: rawPost.title,
      subtitle: rawPost.subtitle || "",
      content: rawPost.content,
      coverImage: rawPost.coverImage || undefined,
      author: {
        name: rawPost.author?.name || "Unknown Writer",
        username: rawPost.author?.username || "unknown",
        avatar: (rawPost.author as any)?.profileImage || (rawPost.author as any)?.avatar || "/avatar.png",
      },
      readingTime: `${readMin} min read`,
      category: (rawPost as any).category || (rawPost as any).categories?.[0]?.name || "General",
      tags: ((rawPost as any).tags || []).map((t: any) => typeof t === "string" ? t : t.name || ""),
      date: (rawPost as any).date || ((rawPost as any).createdAt ? new Date((rawPost as any).createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) : "Mar 10, 2026"),
    };
  }, [postData, id]);

  // Sync server state to local state
  useEffect(() => {
    if (likeStatus) {
      setLocalLiked(likeStatus.liked);
      setLocalLikeCount(likeStatus.count);
    } else if (post) {
      setLocalLiked(false);
      setLocalLikeCount(0);
    }
  }, [likeStatus, post, id]);

  useEffect(() => {
    if (bookmarkStatus) {
      setLocalSaved(bookmarkStatus.saved);
    } else if (post) {
      setLocalSaved(false);
    }
  }, [bookmarkStatus, post, id]);

  // Reading progress bar listener (Step 12.1)
  useEffect(() => {
    const progressBar = document.getElementById("reading-progress");
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = progress + "%";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer Scroll Reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const revealElements = document.querySelectorAll(".reveal:not(.visible)");
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [post]);

  // Toast Notification helper
  const showToast = (message: string) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3500);
    }
  };

  const toggleLike = () => {
    const previousLiked = localLiked;
    const previousCount = localLikeCount;
    setLocalLiked(!previousLiked);
    setLocalLikeCount((c) => (previousLiked ? c - 1 : c + 1));

    likeMutation.mutate(
      { postId },
      {
        onSuccess: (data) => {
          utils.likes.status.invalidate({ postId });
          showToast(data.liked ? "Added to liked articles." : "Removed from liked articles.");
        },
        onError: (err) => {
          setLocalLiked(previousLiked);
          setLocalLikeCount(previousCount);
          if (err.data?.code === "UNAUTHORIZED") {
            showToast("Please log in to like articles.");
            setTimeout(() => router.push("/login"), 1500);
          } else {
            showToast("Failed to update like status.");
          }
        },
      }
    );
  };

  const toggleSave = () => {
    const previousSaved = localSaved;
    setLocalSaved(!previousSaved);

    bookmarkMutation.mutate(
      { postId },
      {
        onSuccess: () => {
          utils.bookmarks.status.invalidate({ postId });
          showToast(!previousSaved ? "Bookmarked successfully." : "Bookmark removed.");
        },
        onError: (err) => {
          setLocalSaved(previousSaved);
          if (err.data?.code === "UNAUTHORIZED") {
            showToast("Please log in to save articles.");
            setTimeout(() => router.push("/login"), 1500);
          } else {
            showToast("Failed to update bookmark.");
          }
        },
      }
    );
  };

  // Extract headings from content for TOC
  const toc = useMemo(() => {
    if (!post?.content) return [];
    const headingRegex = /^#{1,3}\s+(.+)$/gm;
    const headings: string[] = [];
    let match;
    while ((match = headingRegex.exec(post.content)) !== null) {
      headings.push(match[1]);
    }
    return headings;
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <CircularLoading />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-[var(--muted)]">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-body">
      {/* Toast Notification Container (Step 12.2) */}
      <div id="toast" className="toast" aria-live="polite"></div>

      {/* Reading Progress Bar (Step 12.1) */}
      <div
        id="reading-progress"
        aria-hidden="true"
        className="fixed top-0 left-0 h-[2px] bg-[var(--accent)] z-[10001] transition-[width] duration-75"
        style={{ width: "0%" }}
      ></div>

      {/* Cover Image Banner */}
      <div className="relative h-[55vh] md:h-[65vh]">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 z-10">
          <div className="max-w-4xl mx-auto">
            <span
              className="inline-block px-3 py-1 rounded-full mb-4 text-xs font-heading font-semibold uppercase tracking-wider"
              style={{ background: "var(--accent)", color: "#0a0a0a" }}
            >
              {post.category}
            </span>
            <h1
              className="text-white mb-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            >
              {post.title}
            </h1>
            <p className="text-white/80 font-body text-base sm:text-lg max-w-2xl leading-relaxed">
              {post.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Main Content */}
          <article className="flex-1 max-w-3xl reveal">
            {/* Author Section */}
            <div className="flex items-center justify-between pb-10 mb-10 border-b border-[var(--border)]">
              <div className="flex items-center gap-3.5">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-[var(--border)]"
                />
                <div>
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-heading font-bold text-sm text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
                  >
                    {post.author.name}
                  </Link>
                  <div
                    className="flex items-center gap-3 text-[var(--muted)] mt-1"
                    style={{ fontSize: 13 }}
                  >
                    <span>{post.date}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {post.readingTime}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => showToast(`Subscribed to updates from ${post.author.name}`)}
                className="px-5 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-full hover:bg-[var(--accent)] hover:text-[#0a0a0a] transition-all duration-300 font-heading font-medium text-xs cursor-pointer"
              >
                Follow
              </button>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-invert max-w-none prose-amber prose-headings:font-heading"
              style={{ fontSize: 17, lineHeight: 1.85 }}
            >
              <ContentRenderer content={post.content} />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-16 pt-10 border-t border-[var(--border)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-300 font-heading font-medium text-xs cursor-pointer ${
                    localLiked
                      ? "border-red-500/30 bg-red-500/10 text-red-500"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-red-500/30 hover:text-red-500"
                  }`}
                >
                  <Heart size={14} className={localLiked ? "fill-current" : ""} />
                  {localLikeCount}
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("comments");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300 font-heading font-medium text-xs cursor-pointer"
                >
                  <MessageCircle size={14} />
                  Comments
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSave}
                  className={`p-2.5 rounded-full transition-colors duration-300 cursor-pointer ${
                    localSaved
                      ? "text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--accent)]"
                  }`}
                  aria-label="Save Article"
                >
                  <Bookmark size={16} className={localSaved ? "fill-current" : ""} />
                </button>
              </div>
            </div>
            
            {/* Render Comments Section */}
            <CommentsSection postId={postId} />
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 reveal" style={{ transitionDelay: "0.1s" }}>
            <div className="sticky top-32 space-y-10">
              {/* Table of Contents */}
              {toc.length > 0 && (
                <div>
                  <h4
                    className="mb-4 text-[var(--fg)] uppercase tracking-wider font-heading font-bold text-xs"
                  >
                    Table of Contents
                  </h4>
                  <nav className="space-y-1.5">
                    {toc.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const headingId = item.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
                          const el = document.getElementById(headingId);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className="block w-full text-left px-3.5 py-2 text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] rounded-lg transition-colors duration-200 text-xs font-heading font-medium"
                      >
                        {item}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share links */}
              <div>
                <h4
                  className="mb-4 text-[var(--fg)] uppercase tracking-wider font-heading font-bold text-xs"
                >
                  Share Story
                </h4>
                <div className="flex gap-2.5">
                  {[
                    { icon: Twitter, label: "Twitter" },
                    { icon: Facebook, label: "Facebook" },
                    { icon: LinkIcon, label: "Copy Link" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (item.label === "Copy Link") {
                            navigator.clipboard.writeText(window.location.href);
                            showToast("Link copied to clipboard!");
                          } else if (item.label === "Twitter") {
                            const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`;
                            window.open(url, '_blank');
                          } else if (item.label === "Facebook") {
                            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
                            window.open(url, '_blank');
                          }
                        }}
                        className="w-9 h-9 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] rounded-xl text-[var(--muted)] hover:text-[var(--fg)] transition-all duration-300 cursor-pointer flex items-center justify-center"
                        aria-label={`Share via ${item.label}`}
                      >
                        <Icon size={14} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={toggleSave}
                className={`flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl border transition-all duration-300 font-heading font-bold text-xs cursor-pointer ${
                  localSaved
                    ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] bg-[var(--surface)]"
                }`}
              >
                <Bookmark size={14} className={localSaved ? "fill-current" : ""} />
                {localSaved ? "Saved to Bookmarks" : "Bookmark Article"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
