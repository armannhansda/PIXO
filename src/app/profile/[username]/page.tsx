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
    <div className="min-h-screen bg-bg text-fg font-body pt-16 pb-20">
      {/* Cover Image Banner */}
      <div className="relative h-48 md:h-64 border-b border-[var(--border)] overflow-hidden">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--surface)]" />
        )}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile Layout ── */}
        <div className="md:hidden -mt-12 relative z-10">
          <div className="flex items-end justify-between">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--bg)] shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[var(--accent)] border-4 border-[var(--bg)] shadow-xl flex items-center justify-center">
                <span className="text-[#0a0a0a] text-3xl font-bold">
                  {author.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isPending}
              className={`px-4 py-2 rounded-full border transition-all duration-300 text-xs font-heading font-semibold shadow-md cursor-pointer ${
                isFollowing
                  ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                  : "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)]"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-heading font-bold text-[var(--fg)]">{author.name}</h1>
            {author.username && (
              <p className="text-[var(--muted)] text-sm">@{author.username}</p>
            )}
            {author.bio && (
              <p className="text-[var(--muted)] text-sm mt-3 leading-relaxed">
                {author.bio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-[var(--muted)] text-xs">
              {author.location && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-map-pin text-[10px]"></i>
                  {author.location}
                </span>
              )}
              {author.joinDate && (
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-calendar text-[10px]"></i>
                  Joined {author.joinDate}
                </span>
              )}
            </div>
            <div className="flex gap-5 mt-4">
              {[
                { label: "Posts", value: author.posts },
                { label: "Followers", value: author.followers },
                { label: "Following", value: author.following },
              ].map((stat) => (
                <div key={stat.label} className="text-sm text-[var(--fg)]">
                  <span className="font-bold">{stat.value}</span>{" "}
                  <span className="text-[var(--muted)]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop Layout ── */}
        <div className="hidden md:flex items-start gap-6 -mt-16 relative z-10">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-[var(--bg)] shadow-xl shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[var(--accent)] border-4 border-[var(--bg)] shadow-xl flex items-center justify-center shrink-0">
              <span className="text-[#0a0a0a] text-4xl font-bold">
                {author.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}

          <div className="pt-20 flex-1 min-w-0">
            <div>
              <h1 className="text-3xl font-heading font-bold text-[var(--fg)]">{author.name}</h1>
              {author.username && (
                <p className="text-[var(--muted)] text-sm">@{author.username}</p>
              )}
              {author.bio && (
                <p className="text-[var(--muted)] text-sm mt-3 max-w-xl leading-relaxed">
                  {author.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-[var(--muted)] text-xs">
                {author.location && (
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-map-pin text-[11px]"></i>
                    {author.location}
                  </span>
                )}
                {author.joinDate && (
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-calendar text-[11px]"></i>
                    Joined {author.joinDate}
                  </span>
                )}
              </div>
              <div className="flex gap-6 mt-4">
                {[
                  { label: "Posts", value: author.posts },
                  { label: "Followers", value: author.followers },
                  { label: "Following", value: author.following },
                ].map((stat) => (
                  <div key={stat.label} className="text-sm text-[var(--fg)]">
                    <span className="font-bold text-base">{stat.value}</span>{" "}
                    <span className="text-[var(--muted)]">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-20 shrink-0">
            <button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isPending}
              className={`px-5 py-2.5 rounded-full border transition-all duration-300 text-xs font-heading font-semibold shadow-md cursor-pointer ${
                isFollowing
                  ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                  : "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)]"
              }`}
            >
              {isFollowing ? (
                <>
                  <i className="fa-solid fa-user-check mr-1.5 text-xs"></i>
                  Following
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus mr-1.5 text-xs"></i>
                  Follow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-[var(--border)]">
          <div className="flex gap-2">
            {publicTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-3 transition-colors text-sm font-heading font-medium cursor-pointer ${
                  activeTab === tab
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="public-profile-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "Posts" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
