"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BlogCard } from "../components/blog-card";
import CircularLoading from "../components/circular-loading";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import { Footer } from "../components/footer";
import { Search, Compass } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: postsData, isLoading: postsLoading } = api.posts.list.useQuery();
  const { data: categoriesData } = api.categories.list.useQuery();

  const allCategories = useMemo(() => {
    const names = (categoriesData ?? []).map((c: any) => c.name);
    return [{ id: "all", label: "All Posts" }, ...names.map((name: string) => ({ id: name.toLowerCase(), label: name }))];
  }, [categoriesData]);

  const blogPosts = useMemo(() => {
    if (postsData) return postsData.map(mapPostToUI);
    return [];
  }, [postsData]);

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCat = activeCategory === "all" || post.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = !search || 
        post.title.toLowerCase().includes(search.toLowerCase()) || 
        post.preview.toLowerCase().includes(search.toLowerCase()) || 
        post.author.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogPosts, activeCategory, search]);

  return (
    <div className="min-h-screen pt-28 bg-bg text-fg font-body flex flex-col justify-between">
      <div className="w-full px-4 md:px-6 2xl:px-8 pb-20 flex-1">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-black mb-4 text-[var(--fg)] tracking-tight">
            Explore
          </h1>
          <p className="font-body text-base md:text-lg text-[var(--muted)] max-w-xl mx-auto">
            Discover fresh ideas, deep dives, and perspectives from our global community of writers.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-2xl mx-auto mb-10"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, topics, authors..."
            className="w-full pl-14 pr-5 py-4 bg-[var(--surface)]/40 backdrop-blur-xl border border-[var(--border)] rounded-full text-[var(--fg)] font-body focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm placeholder:text-[var(--muted)]/50 text-lg"
          />
        </motion.div>

        {/* Categories Filter Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-nowrap items-center gap-x-8 border-b border-[var(--border)] w-full overflow-x-auto pb-2 mb-12 hide-scrollbar"
        >
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative pb-3 transition-colors text-sm font-heading font-bold cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {cat.label}
                {isActive && (
                  <motion.div
                    layoutId="explore-category-tab"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)] rounded-t-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Posts Grid */}
        {postsLoading ? (
          <div className="flex justify-center py-20">
            <CircularLoading />
          </div>
        ) : filtered.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Compass className="w-16 h-16 text-[var(--accent)] mb-6 opacity-50" />
            <h3 className="font-heading text-xl font-bold text-[var(--fg)] mb-2">No articles found</h3>
            <p className="text-[var(--muted)] font-body">
              Try adjusting your search query or category filter to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
