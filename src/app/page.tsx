"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import CircularLoading from "./components/circular-loading";
import { Footer } from "./components/footer";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Connect to tRPC backend and fallback to mock data
  const { data: postsData, isLoading: postsLoading } = api.posts.list.useQuery();
  const { data: categoriesData } = api.categories.list.useQuery();

  const blogPosts = useMemo(() => {
    if (postsData) {
      return postsData.map(mapPostToUI);
    }
    return [];
  }, [postsData]);

  const categoriesList = useMemo(() => {
    if (categoriesData && categoriesData.length > 0) {
      const names = categoriesData.map((c: any) => c.name);
      return [
        { id: "all", label: "All Posts" },
        ...names.map((name) => ({ id: name.toLowerCase(), label: name })),
      ];
    }
    return [
      { id: "all", label: "All Posts" },
      { id: "design", label: "Design" },
      { id: "lifestyle", label: "Lifestyle" },
      { id: "engineering", label: "Engineering" },
      { id: "architecture", label: "Architecture" },
    ];
  }, [categoriesData]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") {
      return blogPosts;
    } else {
      return blogPosts.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
  }, [activeCategory, blogPosts]);

  // Reading progress bar scroll listener (Step 12.1)
  useEffect(() => {
    const progressBar = document.getElementById("reading-progress");
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = progress + "%";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toast Notification utility (Step 12.2)
  const showToast = (message: string) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 3500);
    }
  };

  const closeSearchOverlay = () => {
    const searchOverlay = document.getElementById("searchOverlay");
    if (searchOverlay) {
      searchOverlay.classList.add("hidden");
    }
    setSearchQuery("");
  };

  // Keyboard shortcut listener for Ctrl+K search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const searchOverlay = document.getElementById("searchOverlay");
      const searchInput = document.getElementById("searchInput") as HTMLInputElement;

      if (e.key === "Escape") {
        closeSearchOverlay();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchOverlay) {
          searchOverlay.classList.remove("hidden");
          setTimeout(() => searchInput?.focus(), 100);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search Results calculations
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return blogPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.preview.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.author.name.toLowerCase().includes(q)
    );
  }, [searchQuery, blogPosts]);

  // Scroll Reveal Animations via Intersection Observer (Step 13)
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
  }, [filteredPosts, postsLoading]);

  // Extract special articles
  const featuredPost = useMemo(() => blogPosts[0], [blogPosts]);
  const editorsPickPost = useMemo(() => blogPosts[2] || blogPosts[0], [blogPosts]);

  if (postsLoading || !categoriesData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pt-28">
        <CircularLoading />
      </div>
    );
  }

  if (!featuredPost || !editorsPickPost) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center pt-28 gap-4">
        <i className="fa-solid fa-database text-4xl text-[var(--muted)]"></i>
        <p className="text-[var(--muted)] text-lg font-body">No articles found in the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg font-body">
      {/* Reading Progress Bar (Step 12.1) */}
      <div
        id="reading-progress"
        aria-hidden="true"
        className="fixed top-0 left-0 h-[2px] bg-[var(--accent)] z-[10001] transition-[width] duration-75"
        style={{ width: "0%" }}
      ></div>

      {/* Toast Notification Container (Step 12.2) */}
      <div id="toast" className="toast" aria-live="polite"></div>

      {/* Search Overlay (Step 11) */}
      <div
        id="searchOverlay"
        className="fixed inset-0 z-[1001] bg-[rgba(10,10,10,0.92)] backdrop-blur-xl flex items-start justify-center pt-32 px-6 hidden"
        role="dialog"
        aria-label="Search"
      >
        <div className="w-full max-w-2xl">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)]"></i>
            <input
              id="searchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, authors..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-14 text-lg text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              id="searchClose"
              onClick={closeSearchOverlay}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface)] transition-colors"
              aria-label="Close search"
            >
              <i className="fa-solid fa-xmark text-xs text-[var(--fg)]"></i>
            </button>
          </div>
          <div
            id="searchResults"
            className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1"
          >
            {searchQuery.trim() && searchResults.length === 0 && (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--muted)" }}
              >
                No results found for "{searchQuery}"
              </p>
            )}
            {searchQuery.trim() &&
              searchResults.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  onClick={closeSearchOverlay}
                  className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]"
                >
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-heading font-bold text-[var(--fg)]">
                      {post.title}
                    </h4>
                    <p className="text-xs text-[var(--muted)]">
                      {post.author.name} • {post.readingTime}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-semibold uppercase tracking-wider"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                    }}
                  >
                    {post.category}
                  </span>
                </Link>
              ))}
          </div>
          <p className="text-center text-[var(--muted)] text-sm mt-6">
            Press ESC to close or Ctrl+K to open
          </p>
        </div>
      </div>

      {/* ═══════════════════════════ HERO SECTION ═══════════════════════════ */}
      <header
        id="hero"
        className="relative min-h-[95vh] flex items-center pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
      >
        {/* Background Glows (Step 4.2) */}
        <div
          className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full glow-pulse pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(232,160,35,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 left-10 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(232,160,35,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Featured Content (Step 4.1) */}
            <div className="reveal">
              <span
                className="px-3 py-1 bg-[var(--accent-glow)] rounded-full text-xs font-heading font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 mb-6"
                style={{ color: "var(--accent)" }}
              >
                <i className="fa-solid fa-star text-[10px]"></i> Featured Post
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-[var(--fg)]">
                {featuredPost.title}
              </h1>
              <p className="font-body text-base sm:text-lg leading-relaxed mb-8 text-[var(--muted)] max-w-xl">
                {featuredPost.preview}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 mb-8">
                <Image
                  src={featuredPost.author.avatar}
                  alt={featuredPost.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border border-[var(--border)]"
                />
                <div>
                  <p className="text-sm font-heading font-bold text-[var(--fg)]">
                    {featuredPost.author.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {featuredPost.date} • {featuredPost.readingTime}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/post/${featuredPost.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)] border border-[var(--accent)] transition-all duration-300 font-bold text-sm"
                >
                  Read Article{" "}
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>

            {/* Right: Hero Image (Step 4.1 & 4.3) */}
            <div
              className="reveal relative flex justify-center lg:justify-end"
              style={{ transitionDelay: "0.15s" }}
            >
              <div className="hero-float relative w-full max-w-md aspect-4/3 rounded-2xl overflow-visible border border-[var(--border)] bg-[var(--card)] p-2">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-xl shadow-2xl"
                  priority
                />

                {/* Floating Stats Card (Step 4.3) */}
                <div
                  className="absolute -bottom-6 -left-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 backdrop-blur-md z-20"
                  style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--accent-glow)" }}
                    >
                      <i
                        className="fa-solid fa-fire-flame-curved"
                        style={{ color: "var(--accent)" }}
                      ></i>
                    </div>
                    <div>
                      <p
                        className="font-heading text-lg font-bold"
                        style={{ color: "var(--fg)" }}
                      >
                        2.4K
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        Active readers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════ TRENDING MARQUEE (Step 5) ═══════════════════════════ */}
      <div>
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-20 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-20 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

        <section className="border-y border-[var(--border)] py-5 overflow-hidden relative bg-[#0a0a0a] z-10">
          <div
            className="marquee-track flex items-center gap-8 whitespace-nowrap"
            style={{ width: "2000px" }}
          >
            {Array(6)
              .fill([
                "Design Systems at Scale",
                "AI & Generative Workflows",
                "Sustainable Urban Coding",
                "Modern Variable Typography",
                "Minimalist Engineering Patterns",
              ])
              .flat()
              .map((item, idx) => (
                <span
                  key={idx}
                  className="flex items-center text-sm font-heading font-medium"
                  style={{ color: "var(--muted)" }}
                >
                  <span
                    className="font-heading text-sm font-semibold mr-2"
                    style={{ color: "var(--accent)" }}
                  >
                    TRENDING
                  </span>
                  <i
                    className="fa-solid fa-circle text-[4px] mx-2"
                    style={{ color: "var(--accent)" }}
                  ></i>
                  {item}
                </span>
              ))}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════ CATEGORIES SECTION (Step 6) ═══════════════════════════ */}
      <section
        id="categories"
        className="py-24 lg:py-32 max-w-7xl mx-auto px-6 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2 text-[var(--fg)]">
              Explore by Category
            </h2>
            <p className="font-body text-sm text-[var(--muted)]">
              Filter posts by your favorite topics
            </p>
          </div>

          {/* Pill Button HTML (Step 6.1) */}
          <div className="flex flex-wrap gap-3" id="categoryContainer">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill px-5 py-2 rounded-full text-sm font-heading border border-[var(--border)] transition-all duration-300 font-medium ${
                  activeCategory === cat.id
                    ? "active bg-[var(--accent)] text-[#0a0a0a]"
                    : ""
                }`}
                style={{
                  color: activeCategory === cat.id ? "#0a0a0a" : "var(--muted)",
                  background:
                    activeCategory === cat.id ? "var(--accent)" : "transparent",
                }}
                onClick={() => setActiveCategory(cat.id)}
                data-cat={cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════ BLOG POSTS GRID (Step 7) ═══════════════════════════ */}
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          id="postsGrid"
        >
          {filteredPosts.map((post, i) => (
            <article
              key={post.id}
              className="post-card reveal rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col"
              style={{
                background: "var(--card)",
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              {/* Image */}
              <div className="overflow-hidden relative h-[200px]">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="card-img w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-semibold uppercase tracking-wider"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                    }}
                  >
                    {post.category}
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {post.readingTime}
                  </span>
                </div>

                <h3
                  className="font-heading text-lg font-bold leading-snug mb-2 line-clamp-2"
                  style={{ color: "var(--fg)" }}
                >
                  {post.title}
                </h3>

                <p
                  className="font-body text-sm leading-relaxed mb-4 line-clamp-2"
                  style={{ color: "var(--muted)" }}
                >
                  {post.preview}
                </p>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
                    />
                    <div>
                      <p className="text-xs font-medium text-[var(--fg)]">
                        {post.author.name}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--muted)" }}
                      >
                        {post.date}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/post/${post.id}`}
                    className="text-[var(--accent)] hover:text-[var(--fg)] transition-colors text-xs font-heading font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    Read <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ EDITOR'S PICK SECTION (Step 8) ═══════════════════════════ */}
      <section className="pb-32 lg:pb-40 max-w-7xl mx-auto px-6 relative z-10">
        <div
          className="reveal rounded-2xl border border-[var(--border)] overflow-hidden"
          style={{ background: "var(--card)" }}
        >
          <div className="grid lg:grid-cols-5">
            {/* Image Side (2 cols) */}
            <div className="lg:col-span-2 overflow-hidden">
              <Image
                src={editorsPickPost.coverImage}
                alt={editorsPickPost.title}
                width={800}
                height={600}
                className="w-full h-64 lg:h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Content Side (3 cols) */}
            <div className="lg:col-span-3 p-8 lg:p-16 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold"
                  style={{ background: "var(--accent)", color: "#0a0a0a" }}
                >
                  <i className="fa-solid fa-star text-[8px]"></i> Editor's Pick
                </span>
              </div>
              <h2
                className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4"
                style={{ color: "var(--fg)" }}
              >
                {editorsPickPost.title}
              </h2>
              <p
                className="font-body text-base leading-relaxed mb-6"
                style={{ color: "var(--muted)" }}
              >
                {editorsPickPost.preview}
              </p>
              {/* Author + Read CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Image
                    src={editorsPickPost.author.avatar}
                    alt={editorsPickPost.author.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-[var(--border)]"
                  />
                  <div>
                    <p className="text-sm font-heading font-bold text-[var(--fg)]">
                      {editorsPickPost.author.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {editorsPickPost.date}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/post/${editorsPickPost.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)] transition-all duration-300 font-bold text-sm cursor-pointer"
                >
                  Read Full Story{" "}
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ NEWSLETTER SECTION (Step 9) ═══════════════════════════ */}
      <section id="newsletter" className="pb-32 lg:pb-40 relative z-10">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="noise-overlay reveal rounded-3xl border border-[var(--border)] p-10 md:p-20 flex flex-col items-center text-center overflow-hidden bg-[#0d0d0d]">
            {/* Spotlight Gradient Background */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(232,160,35,0.06) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 max-w-2xl">
              <i
                className="fa-solid fa-envelope-open-text text-4xl mb-6"
                style={{ color: "var(--accent)" }}
              ></i>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-[var(--fg)]">
                Subscribe to Our Newsletter
              </h2>
              <p className="font-body text-sm md:text-base leading-relaxed mb-8 text-[var(--muted)]">
                Get the latest articles, design trends, and engineering guides
                delivered straight to your inbox. No spam, unsubscribe anytime.
              </p>
              <form
                id="newsletterForm"
                onSubmit={(e) => {
                  e.preventDefault();
                  const emailInput = document.getElementById(
                    "emailInput",
                  ) as HTMLInputElement;
                  const email = emailInput?.value.trim();
                  if (email) {
                    showToast(`Welcome aboard! We'll send updates to ${email}`);
                    if (emailInput) emailInput.value = "";
                  }
                }}
                className="w-full flex flex-col sm:flex-row gap-3 max-w-lg mx-auto animate-none"
              >
                <input
                  id="emailInput"
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 px-5 text-sm text-[var(--fg)] font-body email-input focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)] border border-[var(--accent)] transition-all duration-300 font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  Subscribe Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer component (Step 10) */}
      <Footer />
    </div>
  );
}
