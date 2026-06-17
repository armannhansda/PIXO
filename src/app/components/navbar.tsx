"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, Moon, Sun, Search, Pencil, Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/trpc";
import { mapPostToUI } from "@/lib/utils/map-post";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const { data: postsData } = api.posts.list.useQuery();
  const blogPosts = useMemo(() => postsData ? postsData.map(mapPostToUI) : [], [postsData]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "Categories", path: "/#categories" },
    { label: "Newsletter", path: "/#newsletter" },
  ];

  const { theme, toggleTheme } = useTheme();
  const goTo = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  useEffect(() => {
    // Distraction-Free Reading (Hide on scroll down)
    const mainNav = document.getElementById("mainNav");
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        mainNav?.classList.add("scrolled");
      } else {
        mainNav?.classList.remove("scrolled");
      }

      // Hide navbar when scrolling down past 200px, show when scrolling up
      if (currentScrollY > 200 && currentScrollY > lastScrollY) {
        mainNav?.style.setProperty("transform", "translateY(-100%)");
      } else {
        mainNav?.style.setProperty("transform", "translateY(0)");
      }
      
      lastScrollY = currentScrollY;
    };
    
    // Add smooth transition for the transform
    if (mainNav) {
      mainNav.style.transition = "transform 0.3s ease-in-out, background-color 0.3s ease, border-color 0.3s ease";
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { data: me } = api.auth.me.useQuery(undefined, {
    retry: false,
  });
  const writeHref = me ? "/write" : "/login?callbackUrl=%2Fwrite";
  const accountHref = me ? "/profile" : "/login?callbackUrl=%2Fprofile";

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

  // Global Search logic
  const closeSearchOverlay = () => {
    const searchOverlay = document.getElementById("searchOverlay");
    if (searchOverlay) searchOverlay.classList.add("hidden");
    setSearchQuery("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const searchOverlay = document.getElementById("searchOverlay");
      const searchInput = document.getElementById("searchInput") as HTMLInputElement;

      if (e.key === "Escape") closeSearchOverlay();
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

  const handleSearchToggle = () => {
    const searchOverlay = document.getElementById("searchOverlay");
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    if (searchOverlay) {
      searchOverlay.classList.remove("hidden");
      setTimeout(() => {
        searchInput?.focus();
      }, 100);
    }
  };

  return (
    <>
      {/* Navigation Bar (Step 3.1 & 3.2) */}
      <nav
        className="nav-glass fixed top-0 left-0 w-full z-[1000]"
        id="mainNav"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="w-full px-4 md:px-6 2xl:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-2xl font-bold tracking-tight"
            style={{ color: "var(--accent)" }}
          >
            PIXO<span style={{ color: "var(--fg)" }}>.</span>
          </Link>

          {/* Desktop Links */}
          <div 
            className="hidden md:flex items-center gap-2"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((item) => {
              const isActive = pathname === item.path || (item.path.includes("#") && pathname === "/");
              
              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  className="relative px-4 py-2 rounded-full transition-colors text-sm font-heading font-semibold z-10"
                >
                  <span className={`relative z-10 transition-colors ${hoveredPath === item.path || (!hoveredPath && isActive) ? 'text-[#0a0a0a]' : 'text-[var(--muted)] hover:text-[var(--fg)]'}`}>
                    {item.label}
                  </span>
                  {hoveredPath === item.path && (
                    <motion.div
                      layoutId="navbar-hover-pill"
                      className="absolute inset-0 bg-[var(--accent)] rounded-full -z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button
              id="searchToggle"
              onClick={handleSearchToggle}
              className="text-[var(--fg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => goTo(writeHref)}
              className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--border)] text-[var(--fg)] bg-[var(--surface)]/30 hover:bg-[var(--surface)] hover:border-[var(--fg)] transition-all duration-300 font-heading font-semibold text-sm backdrop-blur-md"
            >
              Write <Pencil size={14} className="opacity-80" />
            </button>

            {me ? (
              <Link
                href={accountHref}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                aria-label="Go to profile"
              >
                {me.profileImage ? (
                  <img
                    src={me.profileImage}
                    alt={me.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </Link>
            ) : (
              <button
                onClick={() => goTo("/login")}
                className="text-sm font-heading font-bold text-[var(--fg)] hover:text-[var(--accent)] transition-colors pl-2 border-l border-[var(--border)]"
              >
                Log In
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobileToggle"
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-[var(--fg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-[var(--fg)]" />
          </button>
        </div>
      </nav>

      {/* Mobile Hamburger Menu Overlay (Step 3.4) */}
      <div
        id="mobileMenu"
        className={`mobile-menu fixed inset-0 z-[1001] bg-[rgba(10,10,10,0.98)] flex flex-col items-center justify-center gap-8 md:hidden ${
          mobileOpen ? "open" : ""
        }`}
      >
        <button
          id="mobileClose"
          onClick={() => setMobileOpen(false)}
          className="absolute top-6 right-6 text-[var(--fg)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
        
        <button
          onClick={() => goTo("/#hero")}
          className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
        >
          Home
        </button>
        <button
          onClick={() => goTo("/explore")}
          className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
        >
          Explore
        </button>
        <button
          onClick={() => goTo("/#categories")}
          className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
        >
          Categories
        </button>
        <button
          onClick={() => goTo("/#newsletter")}
          className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
        >
          Newsletter
        </button>
        <button
          onClick={() => goTo(writeHref)}
          className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors flex items-center gap-2"
        >
          Write <Pencil size={16} />
        </button>

        {me ? (
          <>
            <button
              onClick={() => goTo("/dashboard")}
              className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => goTo("/profile")}
              className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
            >
              Profile ({me.name})
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="mobile-link text-2xl font-heading text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={() => goTo("/login")}
            className="mobile-link text-2xl font-heading hover:text-[var(--accent)] transition-colors"
          >
            Log In
          </button>
        )}
      </div>

      {/* Global Search Overlay */}
      <div
        id="searchOverlay"
        className="fixed inset-0 z-[1001] bg-[rgba(10,10,10,0.92)] backdrop-blur-xl flex items-start justify-center pt-32 px-6 hidden"
        role="dialog"
        aria-label="Search"
      >
        <div className="w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
            <input
              id="searchInput"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, authors..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-4 pl-14 pr-14 text-lg text-[var(--fg)] font-body focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              id="searchClose"
              onClick={closeSearchOverlay}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--surface)] transition-colors"
              aria-label="Close search"
            >
              <X size={16} className="text-[var(--fg)]" />
            </button>
          </div>
          <div
            id="searchResults"
            className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1"
          >
            {searchQuery.trim() && searchResults.length === 0 && (
              <p
                className="text-sm text-center py-4 text-[var(--muted)]"
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
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-semibold uppercase tracking-wider bg-[var(--accent-glow)] text-[var(--accent)]"
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
    </>
  );
}
