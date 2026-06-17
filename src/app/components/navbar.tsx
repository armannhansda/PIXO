"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Moon, Sun, Search, Pencil, Menu, X } from "lucide-react";
import { api } from "@/lib/trpc";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Search Overlay Trigger (Step 10)
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-2xl font-bold tracking-tight"
            style={{ color: "var(--accent)" }}
          >
            PIXO<span style={{ color: "var(--fg)" }}>.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => router.push("/#hero")} className="hover:text-[var(--accent)] transition-colors">
              Home
            </button>
            <button onClick={() => router.push("/explore")} className="hover:text-[var(--accent)] transition-colors">
              Explore
            </button>
            <button onClick={() => router.push("/#categories")} className="hover:text-[var(--accent)] transition-colors">
              Categories
            </button>
            <button onClick={() => router.push("/#newsletter")} className="hover:text-[var(--accent)] transition-colors">
              Newsletter
            </button>
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
              className="btn-accent px-5 py-2 rounded-full border border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a] hover:bg-transparent hover:text-[var(--accent)] transition-all duration-300 flex items-center gap-2 font-medium"
            >
              Write <Pencil size={14} />
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
    </>
  );
}
