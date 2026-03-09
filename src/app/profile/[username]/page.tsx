"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Calendar, UserPlus, UserCheck, Lock } from "lucide-react";
import { motion } from "motion/react";
import { BlogCard } from "../../components/blog-card";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";

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

  const { data: me } = api.auth.me.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  });

  // Fetch the public profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.users.getPublicProfile.useQuery(
    { username },
    { enabled: !!username },
  );

  // Fetch published posts by this user
  const { data: postsData, isLoading: postsLoading } =
    api.posts.listPublishedByAuthor.useQuery(
      { authorId: profile?.id! },
      { enabled: !!profile?.id },
    );

  // Follow status
  const { data: followStatus, refetch: refetchFollowStatus } =
    api.followers.status.useQuery(
      { targetUserId: profile?.id! },
      { enabled: !!profile?.id },
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
    [postsData],
  );

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold">User not found</p>
        <p className="text-muted-foreground text-sm">
          The profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
        >
          Go Home
        </button>
      </div>
    );
  }

  // If profile is set to private
  if (profile.isPublic === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Lock size={48} className="text-muted-foreground" />
        <p className="text-xl font-semibold">This profile is private</p>
        <p className="text-muted-foreground text-sm">
          {profile.name} has chosen to keep their profile private.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors text-sm font-medium"
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
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* ── Mobile Layout ── */}
        <div className="md:hidden -mt-12 relative z-10">
          <div className="flex items-end justify-between">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent border-4 border-background shadow-lg flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {author.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isPending}
              className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium flex items-center gap-1.5 shadow-sm ${
                isFollowing
                  ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
                  : "border-border bg-accent text-white hover:bg-accent/90"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={13} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={13} />
                  Follow
                </>
              )}
            </button>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold">{author.name}</h1>
            {author.username && (
              <p className="text-muted-foreground text-sm">
                @{author.username}
              </p>
            )}
            {author.bio && (
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {author.bio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-muted-foreground text-xs">
              {author.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {author.location}
                </span>
              )}
              {author.joinDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Joined {author.joinDate}
                </span>
              )}
            </div>
            <div className="flex gap-5 mt-3">
              {[
                { label: "Posts", value: author.posts },
                { label: "Followers", value: author.followers },
                { label: "Following", value: author.following },
              ].map((stat) => (
                <div key={stat.label} className="text-sm">
                  <span className="font-bold">{stat.value}</span>{" "}
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop Layout ── */}
        <div className="hidden md:flex items-start gap-5 mt-4">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-accent border-4 border-background shadow-lg flex items-center justify-center shrink-0">
              <span className="text-white text-4xl font-bold">
                {author.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}

          <div className="pt-4 flex-1 min-w-0">
            <div>
              <h1 className="text-2xl font-bold">{author.name}</h1>
              {author.username && (
                <p className="text-muted-foreground text-sm">
                  @{author.username}
                </p>
              )}
              {author.bio && (
                <p className="text-muted-foreground text-sm mt-2 max-w-lg leading-relaxed">
                  {author.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-muted-foreground text-xs">
                {author.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} />
                    {author.location}
                  </span>
                )}
                {author.joinDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    Joined {author.joinDate}
                  </span>
                )}
              </div>
              <div className="flex gap-6 mt-3">
                {[
                  { label: "Posts", value: author.posts },
                  { label: "Followers", value: author.followers },
                  { label: "Following", value: author.following },
                ].map((stat) => (
                  <div key={stat.label} className="text-sm">
                    <span className="font-bold text-base">{stat.value}</span>{" "}
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleFollowToggle}
              disabled={toggleFollow.isPending}
              className={`px-5 py-2.5 rounded-full border transition-colors text-sm font-medium flex items-center gap-2 shadow-sm ${
                isFollowing
                  ? "border-accent bg-accent/10 text-accent hover:bg-accent/20"
                  : "border-border bg-accent text-white hover:bg-accent/90"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={14} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Follow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1">
            {publicTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 transition-colors text-sm font-medium ${
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="public-profile-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === "Posts" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {postsLoading ? (
                <p className="text-muted-foreground col-span-full text-center py-12 text-sm">
                  Loading posts...
                </p>
              ) : userPosts.length > 0 ? (
                userPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-12 text-sm">
                  No posts yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
