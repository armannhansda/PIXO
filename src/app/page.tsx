"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CircularLoading from "./components/circular-loading";
import { Footer } from "./components/footer";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import { BlogCard } from "./components/blog-card";
import { motion } from "motion/react";

export default function HomePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

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


      {/* ═══════════════════════════ HERO SECTION ═══════════════════════════ */}
      <header
        id="hero"
        className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 overflow-hidden"
      >
        <div className="w-full px-4 md:px-6 2xl:px-8 relative z-10">
          <div 
            onClick={() => router.push(`/post/${featuredPost.id}`)}
            className="group relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden cursor-pointer bg-[#050505] border border-[var(--border)] shadow-2xl"
          >
            {/* Background Image with Parallax/Scale Effect */}
            <div className="absolute inset-0 z-0">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out"
                sizes="100vw"
              />
              {/* Complex Gradient Overlays for readability & drama */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/50 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-end min-h-[65vh] lg:min-h-[80vh] p-8 md:p-12 lg:p-20">
              <div className="max-w-4xl reveal">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span
                    className="px-4 py-1.5 bg-[var(--accent)]/10 backdrop-blur-md border border-[var(--accent)]/20 rounded-full text-xs font-heading font-bold uppercase tracking-widest inline-flex items-center gap-2"
                    style={{ color: "var(--accent)" }}
                  >
                    <i className="fa-solid fa-bolt text-[10px]"></i> Featured Story
                  </span>
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-heading font-semibold uppercase tracking-widest text-white">
                    {featuredPost.category}
                  </span>
                </div>
                
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-white group-hover:text-[var(--accent)] transition-colors duration-500">
                  {featuredPost.title}
                </h1>
                
                <p className="font-body text-lg sm:text-xl lg:text-2xl leading-relaxed mb-10 text-white/70 max-w-3xl line-clamp-2 md:line-clamp-none">
                  {featuredPost.preview}
                </p>

                {/* Author & Read CTA Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-white/10">
                  <Link 
                    href={`/profile/${featuredPost.author.username || featuredPost.author.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-4 group/author hover:bg-white/10 p-2 pr-6 rounded-full transition-all duration-300 w-fit border border-transparent hover:border-white/10 backdrop-blur-sm"
                  >
                    <Image
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover border-2 border-[var(--accent)]"
                    />
                    <div>
                      <p className="text-base font-heading font-bold text-white group-hover/author:text-[var(--accent)] transition-colors">
                        {featuredPost.author.name}
                      </p>
                      <p className="text-sm text-white/60 flex items-center gap-2 mt-0.5 font-medium">
                        {featuredPost.date} <span className="w-1 h-1 rounded-full bg-white/30"></span> {featuredPost.readingTime}
                      </p>
                    </div>
                  </Link>

                  <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[var(--accent)] text-[#0a0a0a] font-heading font-bold text-base transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(232,160,35,0.4)]">
                    Read Article <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════ TRENDING MARQUEE (Step 5) ═══════════════════════════ */}
      <div className="relative border-y border-[var(--border)] bg-[var(--surface)]/30 backdrop-blur-md overflow-hidden z-10 py-4 flex items-center">
        {/* Gradient fades for the edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-16 md:w-48 z-20 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-16 md:w-48 z-20 bg-gradient-to-l from-bg to-transparent" />

        <motion.div
          className="flex whitespace-nowrap items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        >
          {Array(4)
            .fill([
              "Design Systems at Scale",
              "AI & Generative Workflows",
              "Sustainable Urban Coding",
              "Modern Variable Typography",
              "Minimalist Engineering Patterns",
            ])
            .flat()
            .map((item, idx) => (
              <div
                key={idx}
                className="flex items-center px-6 md:px-10"
              >
                <span className="text-[var(--accent)] font-heading text-[10px] md:text-xs font-black tracking-widest uppercase mr-3 md:mr-4">
                  Trending
                </span>
                <span className="text-[var(--fg)] font-body text-sm md:text-base font-medium">
                  {item}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)] ml-12 md:ml-20" />
              </div>
            ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════ CATEGORIES SECTION (Step 6) ═══════════════════════════ */}
      <section
        id="categories"
        className="py-16 w-full px-4 md:px-6 2xl:px-8 relative z-10"
      >
        <div className="flex flex-col mb-10">
          <h2 className="font-heading text-3xl font-bold mb-6 text-[var(--fg)]">
            Explore by Category
          </h2>
          
          {/* Minimal Horizontal Tabs */}
          <div className="flex flex-nowrap items-center gap-x-8 border-b border-[var(--border)] w-full overflow-hidden pb-2">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative pb-3 transition-colors text-sm font-heading font-bold cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {cat.label}
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="home-category-tab"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)] rounded-t-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════ BLOG POSTS GRID (Step 7) ═══════════════════════════ */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          id="postsGrid"
        >
          {filteredPosts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-full"
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════ EDITOR'S PICK SECTION (Step 8) ═══════════════════════════ */}
      <section className="pb-32 lg:pb-40 w-full px-4 md:px-6 2xl:px-8 relative z-10">
        <div
          onClick={() => router.push(`/post/${editorsPickPost.id}`)}
          className="reveal rounded-2xl border border-[var(--border)] overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
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
                <Link 
                  href={`/profile/${editorsPickPost.author.username || editorsPickPost.author.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
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
                </Link>
                <Link
                  href={`/post/${editorsPickPost.id}`}
                  onClick={(e) => e.stopPropagation()}
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
