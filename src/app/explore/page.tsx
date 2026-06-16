"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BentoGrid, EXPLORE_PATTERN } from "../components/bento-grid";
import CircularLoading from "../components/circular-loading";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";

import { Footer } from "../components/footer";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: postsData, isLoading: postsLoading } =
    api.posts.list.useQuery();
  const { data: categoriesData } = api.categories.list.useQuery();

  const allCategories = useMemo(() => {
    const names = (categoriesData ?? []).map((c: any) => c.name);
    return [{ id: "all", label: "All Posts" }, ...names.map(name => ({ id: name.toLowerCase(), label: name }))];
  }, [categoriesData]);

  // Connect frontend strictly with tRPC backend
  const blogPosts = useMemo(() => {
    if (postsData) {
      return postsData.map(mapPostToUI);
    }
    return [];
  }, [postsData]);

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchCat =
        activeCategory === "all" ||
        post.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.preview.toLowerCase().includes(search.toLowerCase()) ||
        post.author.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [blogPosts, activeCategory, search]);

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
  }, [filtered, postsLoading]);

  return (
    <div className="min-h-screen pt-28 bg-bg text-fg font-body flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-6 pb-20 w-full flex-1">
        {/* Header */}
        <div className="reveal mb-10">
          <h1 className="font-heading text-4xl font-bold mb-2 text-[var(--fg)]">
            Explore
          </h1>
          <p className="font-body text-sm text-[var(--muted)]">
            Browse articles across all topics and discover new ideas.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xl mb-8 reveal">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, topics, authors..."
            className="w-full pl-14 pr-5 py-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)] transition-all"
            style={{ fontSize: 15 }}
          />
        </div>

        {/* Categories Filter Pills */}
        <div className="flex gap-3 mb-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden reveal">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`cat-pill px-5 py-2 rounded-full text-sm font-heading border border-[var(--border)] transition-all duration-300 font-medium ${
                activeCategory === cat.id ? "active bg-[var(--accent)] text-[#0a0a0a]" : ""
              }`}
              style={{
                color: activeCategory === cat.id ? "#0a0a0a" : "var(--muted)",
                background: activeCategory === cat.id ? "var(--accent)" : "transparent",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        {postsLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <CircularLoading />
          </div>
        ) : filtered.length > 0 ? (
          <div className="reveal">
            <BentoGrid posts={filtered} pattern={EXPLORE_PATTERN} />
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground reveal">
            <i className="fa-solid fa-compass text-4xl mb-4 opacity-40" style={{ color: "var(--accent)" }}></i>
            <p style={{ fontSize: 16, color: "var(--muted)" }}>
              No articles found. Try a different search query or category filter.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
