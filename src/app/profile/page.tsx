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
import { Heart, FileText, LogOut } from "lucide-react";

const profileTabs = ["Posts", "Saved", "Likes"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const router = useRouter();

  const { data: me, isLoading: meLoading, error: meError } = api.auth.me.useQuery(undefined, {
    retry: false,
  });

  const logoutMutation = api.auth.logout.useMutation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        localStorage.removeItem("authToken");
        router.push("/");
        router.refresh();
      },
    });
  };

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
                  onClick={() => setEditOpen(true)}
                  className="px-5 py-2 rounded-full border border-[var(--border)] bg-transparent hover:bg-[var(--surface)] transition-all duration-300 text-[var(--fg)] text-xs md:text-sm font-heading font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-pen text-xs"></i>
                  Edit
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full border border-transparent hover:bg-red-500/10 transition-all duration-300 text-[var(--muted)] hover:text-red-500 text-xs md:text-sm font-heading font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  title="Log Out"
                >
                  <LogOut size={14} />
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
                ...(dashboardData ? [
                  { label: "Views", value: dashboardData.stats.totalViews },
                  { label: "Likes", value: dashboardData.stats.totalLikes },
                  { label: "Comments", value: dashboardData.stats.totalComments },
                ] : [])
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
            {profileTabs.map((tab) => (
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
                    layoutId="profile-tab"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)] rounded-t-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === "Posts" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {postsLoading ? (
                <div className="col-span-full py-16 flex justify-center"><CircularLoading /></div>
              ) : userPosts.length > 0 ? (
                userPosts.map((post, i) => (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <BlogCard
                      post={post}
                      showEditButton
                      onDelete={handleDeletePost}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)]/30">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                    <FileText size={24} className="text-[var(--muted)]" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[var(--fg)] mb-2">No posts yet</h3>
                  <p className="text-[var(--muted)] text-sm max-w-sm">
                    You haven't published any articles. Start sharing your thoughts with the world!
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Saved" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {savedLoading ? (
                <div className="col-span-full py-16 flex justify-center"><CircularLoading /></div>
              ) : savedPosts.length > 0 ? (
                savedPosts.map((post, i) => (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)]/30">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                    <i className="fa-regular fa-bookmark text-[var(--muted)] text-xl"></i>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[var(--fg)] mb-2">No bookmarks</h3>
                  <p className="text-[var(--muted)] text-sm max-w-sm">
                    Save articles you want to read later. They'll appear here.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "Likes" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {likedLoading ? (
                <div className="col-span-full py-16 flex justify-center"><CircularLoading /></div>
              ) : likedPosts.length > 0 ? (
                likedPosts.map((post, i) => (
                  <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface)]/30">
                  <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
                    <Heart size={24} className="text-[var(--muted)]" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[var(--fg)] mb-2">No liked posts</h3>
                  <p className="text-[var(--muted)] text-sm max-w-sm">
                    Posts you like will show up here.
                  </p>
                </div>
              )}
            </motion.div>
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
