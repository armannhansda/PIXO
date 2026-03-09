"use client";

import { useState, useMemo, useEffect } from "react";
import { MapPin, Calendar, Pencil } from "lucide-react";
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

const profileTabs = ["Posts", "Saved", "Likes"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const router = useRouter();

  // Check auth token — use null to distinguish "not checked yet" from "no token"
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  useEffect(() => {
    setHasToken(!!localStorage.getItem("authToken"));
  }, []);

  const { data: me, isLoading: meLoading } = api.auth.me.useQuery(undefined, {
    enabled: hasToken === true,
    retry: false,
  });

  const userId = me?.id;

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
    { enabled: !!userId },
  );

  const { data: savedPostsData, isLoading: savedLoading } =
    api.bookmarks.list.useQuery(undefined, {
      enabled: hasToken === true,
    });

  const { data: likedPostsData, isLoading: likedLoading } =
    api.likes.listByUser.useQuery(undefined, {
      enabled: hasToken === true,
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
    [userPostsData],
  );
  const savedPosts = useMemo(
    () =>
      (savedPostsData?.items ?? savedPostsData ?? []).map((b: any) =>
        mapPostToUI(b.post ?? b),
      ),
    [savedPostsData],
  );
  const likedPosts = useMemo(
    () =>
      (likedPostsData?.items ?? likedPostsData ?? []).map((p: any) =>
        mapPostToUI(p),
      ),
    [likedPostsData],
  );

  // If not logged in and not loading, redirect (only after token check completes)
  useEffect(() => {
    if (hasToken === false) {
      router.push("/login");
    }
  }, [hasToken, router]);

  if (hasToken === null || meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!me) {
    return null; // Will redirect to login
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
          {/* Row: avatar + edit button */}
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
              onClick={() => setEditOpen(true)}
              className="px-4 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors text-foreground text-sm font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Pencil size={13} />
              Edit Profile
            </button>
          </div>

          {/* User Info */}
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
          {/* Profile Image */}
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

          {/* User Info */}
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

          {/* Edit Profile Button */}
          <div className="shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="px-5 py-2.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-foreground text-sm font-medium flex items-center gap-2 shadow-sm"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1">
            {profileTabs.map((tab) => (
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
                    layoutId="profile-tab"
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
                    <BlogCard
                      post={post}
                      showEditButton
                      onDelete={handleDeletePost}
                    />
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-12 text-sm">
                  No posts yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "Saved" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {savedLoading ? (
                <p className="text-muted-foreground col-span-full text-center py-12 text-sm">
                  Loading saved posts...
                </p>
              ) : savedPosts.length > 0 ? (
                savedPosts.map((post, i) => (
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
                  No saved posts yet.
                </p>
              )}
            </div>
          )}

          {activeTab === "Likes" && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {likedLoading ? (
                <p className="text-muted-foreground col-span-full text-center py-12 text-sm">
                  Loading liked posts...
                </p>
              ) : likedPosts.length > 0 ? (
                likedPosts.map((post, i) => (
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
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
    </div>
  );
}
