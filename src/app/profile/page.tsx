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
import { BarChart3, Eye, Heart, MessageSquare, FileText, LogOut } from "lucide-react";

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

      <div className="max-w-7xl mx-auto px-6">
        {/* ── Mobile Layout ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:hidden -mt-20 relative z-10 p-6 rounded-3xl bg-[var(--surface)]/60 backdrop-blur-xl border border-[var(--border)] shadow-xl"
        >
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="relative">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-24 h-24 rounded-full object-cover border-[6px] border-[var(--surface)] shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[var(--accent)] border-[6px] border-[var(--surface)] shadow-lg flex items-center justify-center">
                  <span className="text-[#0a0a0a] text-3xl font-black">
                    {author.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 mb-2">
              <button
                onClick={() => setEditOpen(true)}
                className="px-5 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)] hover:text-[var(--accent)] transition-all duration-300 text-[var(--fg)] text-xs font-heading font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <i className="fa-solid fa-pen text-[10px]"></i>
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-full border border-red-500/30 bg-[var(--surface)] hover:bg-red-500 hover:text-white transition-all duration-300 text-red-500 text-xs font-heading font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <LogOut size={12} />
                Log Out
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-heading font-black tracking-tight text-[var(--fg)]">{author.name}</h1>
            {author.username && (
              <p className="text-[var(--accent)] text-sm font-medium">@{author.username}</p>
            )}
            {author.bio && (
              <p className="text-[var(--muted)] text-sm mt-3 leading-relaxed">
                {author.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-[var(--muted)] text-xs font-medium">
              {author.location && (
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-map-pin text-[10px]"></i>
                  {author.location}
                </span>
              )}
              {author.joinDate && (
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar text-[10px]"></i>
                  Joined {author.joinDate}
                </span>
              )}
            </div>
            
            <div className="h-px w-full bg-[var(--border)] my-5" />
            
            <div className="flex justify-around items-center">
              {[
                { label: "Posts", value: author.posts },
                { label: "Followers", value: author.followers },
                { label: "Following", value: author.following },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-heading font-black text-[var(--fg)]">{stat.value}</div>
                  <div className="text-[11px] text-[var(--muted)] uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Desktop Layout ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-start gap-8 -mt-24 relative z-10 p-8 rounded-3xl bg-[var(--surface)]/60 backdrop-blur-xl border border-[var(--border)] shadow-2xl"
        >
          <div className="relative shrink-0 -mt-16 group">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-36 h-36 rounded-full object-cover border-[8px] border-[var(--surface)] shadow-xl transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-[var(--accent)] border-[8px] border-[var(--surface)] shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <span className="text-[#0a0a0a] text-5xl font-black">
                  {author.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-heading font-black tracking-tight text-[var(--fg)]">{author.name}</h1>
            {author.username && (
              <p className="text-[var(--accent)] text-sm font-medium mt-1">@{author.username}</p>
            )}
            {author.bio && (
              <p className="text-[var(--muted)] text-base mt-4 max-w-2xl leading-relaxed">
                {author.bio}
              </p>
            )}
            
            <div className="flex items-center gap-6 mt-6 text-[var(--muted)] text-sm font-medium">
              {author.location && (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-map-pin text-xs"></i>
                  {author.location}
                </span>
              )}
              {author.joinDate && (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-calendar text-xs"></i>
                  Joined {author.joinDate}
                </span>
              )}
            </div>
            
            <div className="flex gap-10 mt-8 pt-6 border-t border-[var(--border)] w-full">
              {[
                { label: "Posts", value: author.posts },
                { label: "Followers", value: author.followers },
                { label: "Following", value: author.following },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-heading font-black text-[var(--fg)]">{stat.value}</span>
                  <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-3">
            <button
              onClick={() => setEditOpen(true)}
              className="px-6 py-3 rounded-full border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[#0a0a0a] transition-all duration-300 text-[var(--fg)] text-sm font-heading font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-pen text-xs"></i>
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 rounded-full border border-red-500/30 bg-transparent hover:bg-red-500 hover:text-white transition-all duration-300 text-red-500 text-sm font-heading font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </motion.div>

        {/* Dashboard Section */}
        <div className="mt-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-heading font-black tracking-tight text-[var(--fg)] mb-8 flex items-center gap-3"
          >
            <BarChart3 size={24} className="text-[var(--accent)]" /> Dashboard Metrics
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metricCards.map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className={`group relative bg-[var(--surface)]/40 backdrop-blur-md border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-[2rem] p-7 overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${metric.color}`}
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metric.bg} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <metric.icon size={26} className="opacity-80" />
                  </div>
                </div>
                
                <div className="relative z-10 text-[var(--fg)]">
                  <h3 className="text-4xl font-heading font-black tracking-tighter mb-2">{metric.value.toLocaleString()}</h3>
                  <p className="text-[var(--muted)] text-xs font-semibold uppercase tracking-widest">{metric.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 mb-10 flex justify-center md:justify-start"
        >
          <div className="inline-flex gap-2 p-1.5 bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--border)] rounded-full shadow-sm">
            {profileTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-8 py-3 rounded-full transition-colors text-sm font-heading font-bold cursor-pointer z-10 ${
                  activeTab === tab
                    ? "text-[#0a0a0a]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="profile-tab"
                    className="absolute inset-0 bg-[var(--accent)] rounded-full -z-10 shadow-md"
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
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
