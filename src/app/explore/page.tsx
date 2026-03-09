"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { BentoGrid, EXPLORE_PATTERN } from "../components/bento-grid";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: postsData, isLoading: postsLoading } =
    api.posts.list.useQuery();
  const { data: categoriesData } = api.categories.list.useQuery();

  const allCategories = useMemo(() => {
    const names = (categoriesData ?? []).map((c: any) => c.name);
    return ["All", ...names];
  }, [categoriesData]);

  const blogPosts = useMemo(
    () => (postsData ?? []).map(mapPostToUI),
    [postsData],
  );

  const filtered = blogPosts.filter((post) => {
    const matchCat =
      activeCategory === "All" || post.category === activeCategory;
    const matchSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.author.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Inter',sans-serif]">
      <div className="max-w-6xl mx-auto">
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2" style={{ fontSize: 36, fontWeight: 700 }}>
            Explore
          </h1>
          <p className="text-muted-foreground mb-8" style={{ fontSize: 16 }}>
            Browse articles across all topics and discover new ideas.
          </p>
        </motion.div> */}

        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            style={{ fontSize: 15 }}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground hover:bg-border"
              }`}
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        {postsLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <p style={{ fontSize: 16 }}>Loading articles...</p>
          </div>
        ) : filtered.length > 0 ? (
          <BentoGrid posts={filtered} pattern={EXPLORE_PATTERN} />
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <TrendingUp size={40} className="mx-auto mb-4 opacity-40" />
            <p style={{ fontSize: 16 }}>
              No articles found. Try a different search or category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
