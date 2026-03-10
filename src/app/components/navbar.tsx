"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  PenSquare,
  Bell,
  Home,
  Compass,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Settings,
  BookMarked,
  Heart,
  BellRing,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { api } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Check if user has a token before querying
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    setHasToken(!!localStorage.getItem("authToken"));
  }, [pathname]);

  const { data: user } = api.auth.me.useQuery(undefined, {
    enabled: hasToken,
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setHasToken(false);
    router.push("/");
    // Force refetch to clear cached user
    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/write", label: "Write", icon: PenSquare },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "top-3 mx-4 md:mx-8 rounded-2xl bg-background/80 backdrop-blur-xl border border-border shadow-lg"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className={`max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between ${scrolled ? "h-14" : "h-16"}`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              style={{ fontSize: 20, fontWeight: 700 }}
            >
              PIXO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isActive(link.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl hover:bg-surface transition-colors text-muted-foreground hover:text-foreground overflow-hidden"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "light" ? (
                  <motion.div
                    key="sun"
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={18} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ y: -20, opacity: 0, rotate: 90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-xl hover:bg-surface transition-colors text-muted-foreground hover:text-foreground">
                  <Bell size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <BellRing size={14} />
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:block rounded-full focus:outline-none">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-accent transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center ring-2 ring-transparent hover:ring-accent transition-all">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User size={14} />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <BookMarked size={14} />
                      Saved Posts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <Heart size={14} />
                      Liked Posts
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                <LogIn size={14} />
                Sign In
              </Link>
            )}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-surface transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background pt-20 px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface"
                  }`}
                  style={{ fontSize: 16, fontWeight: 500 }}
                >
                  <link.icon size={20} />
                  {link.label}
                </Link>
              ))}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-surface"
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                Profile
              </Link>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-surface w-full text-left"
                  style={{ fontSize: 16, fontWeight: 500 }}
                >
                  <LogOut size={20} />
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-surface"
                  style={{ fontSize: 16, fontWeight: 500 }}
                >
                  <LogIn size={20} />
                  Sign In
                </Link>
              )}

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-surface"
                style={{ fontSize: 16, fontWeight: 500 }}
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                {theme === "light" ? "Night Mode" : "Light Mode"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
