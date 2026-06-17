"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BlogCard } from "../../components/blog-card";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import CircularLoading from "@/app/components/circular-loading";
import { motion } from "motion/react";
import { Footer } from "../../components/footer";

const publicTabs = ["Posts"];

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Posts");

  const username = params.username;

  // Check if the current viewer is logged in
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    setHasToken(!!localStorage.getItem("authToken"));
  }, []);

  // Fetch the public profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.users.getPublicProfile.useQuery(
    { username },
    { enabled: !!username, retry: false }
  );

  // Fetch published posts by this user
  const { data: postsData, isLoading: postsLoading } =
    api.posts.listPublishedByAuthor.useQuery(
      { authorId: profile?.id! },
      { enabled: !!profile?.id, retry: false }
    );

  // Follow status
  const { data: followStatus, refetch: refetchFollowStatus } =
    api.followers.status.useQuery(
      { targetUserId: profile?.id! },
      { enabled: !!profile?.id, retry: false }
    );

  const toggleFollow = api.followers.toggle.useMutation({
    onSuccess: () => refetchFollowStatus(),
  });

  const handleFollowToggle = () => {
    if (!hasToken) {
      router.push("/login");
      return;
    }
    if (profile?.id) {
      toggleFollow.mutate({ targetUserId: profile.id });
    }
  };

  const userPosts = useMemo(
    () => (postsData ?? []).map(mapPostToUI),
    [postsData]
  );

  // Scroll Reveal Animations
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
  }, [userPosts, profileLoading]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <CircularLoading />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-xl font-heading font-bold text-[var(--fg)]">User not found</p>
        <p className="text-[var(--muted)] text-sm">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-[var(--accent)] text-[#0a0a0a] border border-[var(--accent)] hover:bg-transparent hover:text-[var(--accent)] rounded-full transition-all duration-300 text-sm font-heading font-bold cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  // If profile is private
  if (profile.isPublic === false) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-center px-6">
        <i className="fa-solid fa-lock text-4xl mb-2" style={{ color: "var(--muted)" }}></i>
        <p className="text-xl font-heading font-bold text-[var(--fg)]">This profile is private</p>
        <p className="text-[var(--muted)] text-sm">
          {profile.name} has chosen to keep their profile private.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-[var(--accent)] text-[#0a0a0a] border border-[var(--accent)] hover:bg-transparent hover:text-[var(--accent)] rounded-full transition-all duration-300 text-sm font-heading font-bold cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  const author = {
    name: profile.name,
    username: profile.username || "",
    avatar: profile.profileImage || "",
    bio: profile.bio || "",
    location: profile.location || "",
    joinDate: profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
    posts: profile._count.posts,
    followers: profile._count.followers,
    following: profile._count.following,
  };
  const bannerImage = profile.coverImage || null;
  const isFollowing = followStatus?.following ?? false;

  return (
    <div className="min-h-screen bg-bg text-fg font-body pb-20">
      {/* Cover Image Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {bannerImage ? (
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src={bannerImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--surface)] to-[var(--bg)]" />
        )}
        {/* Gradient overlays to blend into the background */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
      </div>

      <div className="w-full px-4 md:px-6 2xl:px-8">
        {/* ── Unified Profile Layout ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 -mt-16 md:-mt-24 bg-[var(--surface)]/40 backdrop-blur-2xl border border-[var(--border)] rounded-3xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row gap-8 items-start md:items-center"
        >
          {/* Avatar */}
          <div className="relative shrink-0 -mt-16 md:-mt-20 group">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-[var(--surface)] shadow-md transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[var(--accent)] border-4 border-[var(--surface)] shadow-md flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <span className="text-[#0a0a0a] text-4xl md:text-5xl font-black">
                  {author.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-[var(--fg)]">{author.name}</h1>
                {author.username && (
                  <p className="text-[var(--accent)] text-sm font-medium mt-1">@{author.username}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleFollowToggle}
                  disabled={toggleFollow.isPending}
                  className={`px-5 py-2 rounded-full border transition-all duration-300 text-xs md:text-sm font-heading font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isFollowing
                      ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                      : "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)]"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <i className="fa-solid fa-user-check text-xs"></i>
                      Following
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus text-xs"></i>
                      Follow
                    </>
                  )}
                </button>
              </div>
            </div>

            {author.bio && (
              <p className="text-[var(--muted)] text-sm md:text-base mt-4 max-w-3xl leading-relaxed">
                {author.bio}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-[var(--muted)] text-xs md:text-sm font-medium">
              {author.location && (
                <span className="flex items-center gap-1.5 md:gap-2">
                  <i className="fa-solid fa-map-pin text-[10px] md:text-xs"></i>
                  {author.location}
                </span>
              )}
              {author.joinDate && (
                <span className="flex items-center gap-1.5 md:gap-2">
                  <i className="fa-solid fa-calendar text-[10px] md:text-xs"></i>
                  Joined {author.joinDate}
                </span>
              )}
            </div>
            
            {/* Minimal Inline Metrics */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6 pt-6 border-t border-[var(--border)]/50 w-full">
              {[
                { label: "Posts", value: author.posts },
                { label: "Followers", value: author.followers },
                { label: "Following", value: author.following },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-heading font-bold text-[var(--fg)]">{stat.value.toLocaleString()}</span>
                  <span className="text-[10px] md:text-xs text-[var(--muted)] uppercase tracking-wider font-semibold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 mb-8 flex justify-center md:justify-start border-b border-[var(--border)]"
        >
          <div className="flex gap-8 px-2">
            {publicTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 transition-colors text-sm font-heading font-bold cursor-pointer ${
                  activeTab === tab
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="public-profile-tab"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)] rounded-t-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "Posts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {postsLoading ? (
                <div className="col-span-full py-12 flex justify-center"><CircularLoading /></div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post, i) => (
                  <div key={post.id} className="reveal">
                    <BlogCard post={post} />
                  </div>
                ))
              ) : (
                <p className="text-[var(--muted)] col-span-full text-center py-12 text-sm">
                  No posts published yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
