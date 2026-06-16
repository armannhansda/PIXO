"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { BlogCard } from "../components/blog-card";
import { EditProfileModal } from "../components/edit-profile-modal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../components/ui/alert-dialog";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import { useRouter } from "next/navigation";
import CircularLoading from "../components/circular-loading";
import { Footer } from "../components/footer";
import { BarChart3, Eye, Heart, MessageSquare, FileText } from "lucide-react";

const profileTabs = ["Posts", "Saved", "Likes"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const router = useRouter();

  const { data: me, isLoading: meLoading, error: meError } = api.auth.me.useQuery(undefined, {
    retry: false,
  });

  const userId = me?.id;

  const { data: dashboardData, isLoading: dashboardLoading } =
    api.users.getDashboardStats.useQuery(undefined, {
      enabled: !!userId,
    });

  const { data: profile, refetch: refetchProfile } =
    api.users.getProfile.useQuery(userId!, {
      enabled: !!userId,
    });

  const {
    data: userPostsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = api.posts.listByAuthor.useQuery(
    { authorId: userId! },
    { enabled: !!userId }
  );

  const { data: savedPostsData, isLoading: savedLoading } =
    api.bookmarks.list.useQuery(undefined, {
      enabled: !!me,
    });

  const { data: likedPostsData, isLoading: likedLoading } =
    api.likes.listByUser.useQuery(undefined, {
      enabled: !!me,
    });

  const deletePost = api.posts.delete.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const handleDeletePost = (postId: string) => {
    setDeleteTarget(postId);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePost.mutate(Number(deleteTarget));
      setDeleteTarget(null);
    }
  };

  const userPosts = useMemo(
    () => (userPostsData ?? []).map(mapPostToUI),
    [userPostsData]
  );
  const savedPosts = useMemo(
    () => (savedPostsData?.items ?? []).map((b: any) => mapPostToUI(b)),
    [savedPostsData]
  );
  const likedPosts = useMemo(
    () => (likedPostsData?.items ?? []).map((p: any) => mapPostToUI(p)),
    [likedPostsData]
  );

  const metricCards = dashboardData
    ? [
        { title: "Total Views", value: dashboardData.stats.totalViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Total Likes", value: dashboardData.stats.totalLikes, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
        { title: "Total Comments", value: dashboardData.stats.totalComments, icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" },
        { title: "Total Posts", value: dashboardData.stats.totalPosts, icon: FileText, color: "text-[var(--accent)]", bg: "bg-[var(--accent-glow)]" },
      ]
    : [];

  // If not logged in, redirect
  useEffect(() => {
    if (!meLoading && (meError || !me)) {
      router.replace("/login?callbackUrl=%2Fprofile");
    }
  }, [me, meError, meLoading, router]);

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
  }, [activeTab, userPosts, savedPosts, likedPosts]);

  if (meLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <CircularLoading />
      </div>
    );
  }

  if (!me) {
    return null; // Redirecting...
  }

  const author = {
    name: profile?.name || me.name,
    username: profile?.username || "",
    avatar: profile?.profileImage || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    isPublic: profile?.isPublic !== false,
    joinDate: profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
    posts: profile?._count?.posts ?? 0,
    followers: profile?._count?.followers ?? 0,
    following: profile?._count?.following ?? 0,
  };
  const bannerImage = profile?.coverImage || null;

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
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-[var(--fg)] text-xs font-heading font-medium flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <i className="fa-solid fa-pen text-[10px]"></i>
              Edit Profile
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
            <div className="flex items-center gap-4 mt-3.5 text-[var(--muted)] text-xs">
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
              onClick={() => setEditOpen(true)}
              className="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] transition-colors text-[var(--fg)] text-xs font-heading font-medium flex items-center gap-2 shadow-md cursor-pointer"
            >
              <i className="fa-solid fa-pen text-[10px]"></i>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-heading font-bold text-[var(--fg)] mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-[var(--accent)]" /> Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {metricCards.map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 flex items-start justify-between"
              >
                <div>
                  <p className="text-[var(--muted)] text-sm font-heading font-semibold mb-2 uppercase tracking-wider">{metric.title}</p>
                  <h3 className="text-3xl font-bold text-[var(--fg)]">{metric.value.toLocaleString()}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bg} ${metric.color}`}>
                  <metric.icon size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b border-[var(--border)]">
          <div className="flex gap-2">
            {profileTabs.map((tab) => (
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
                    layoutId="profile-tab"
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
                    <BlogCard
                      post={post}
                      showEditButton
                      onDelete={handleDeletePost}
                    />
                  </div>
                ))
              ) : (
                <p className="text-[var(--muted)] col-span-full text-center py-12 text-sm">
                  No posts published yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "Saved" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {savedLoading ? (
                <div className="col-span-full py-12 flex justify-center"><CircularLoading /></div>
              ) : savedPosts.length > 0 ? (
                savedPosts.map((post, i) => (
                  <div key={post.id} className="reveal">
                    <BlogCard post={post} />
                  </div>
                ))
              ) : (
                <p className="text-[var(--muted)] col-span-full text-center py-12 text-sm">
                  No bookmarked posts yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "Likes" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {likedLoading ? (
                <div className="col-span-full py-12 flex justify-center"><CircularLoading /></div>
              ) : likedPosts.length > 0 ? (
                likedPosts.map((post, i) => (
                  <div key={post.id} className="reveal">
                    <BlogCard post={post} />
                  </div>
                ))
              ) : (
                <p className="text-[var(--muted)] col-span-full text-center py-12 text-sm">
                  No liked posts yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-lg">Delete Post</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--muted)] text-sm">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[var(--border)] hover:bg-[var(--surface)] border border-transparent text-[var(--fg)] cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        user={{
          id: me.id,
          name: author.name,
          username: author.username,
          bio: author.bio,
          location: author.location,
          profileImage: author.avatar,
          coverImage: bannerImage,
          isPublic: author.isPublic,
        }}
        onSuccess={() => refetchProfile()}
      />

      <Footer />
    </div>
  );
}
