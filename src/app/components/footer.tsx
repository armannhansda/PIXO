"use client";

import Link from "next/link";
import { Twitter, Github, Instagram } from "lucide-react";

export function Footer() {
  const platformLinks = [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: "Categories", href: "/#categories" },
    { label: "Newsletter", href: "/#newsletter" },
  ];

  const categoryLinks = [
    { label: "Technology", href: "/explore" },
    { label: "Design", href: "/explore" },
    { label: "Lifestyle", href: "/explore" },
    { label: "Engineering", href: "/explore" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
  ];

  return (
    <footer className="border-t border-[var(--border)] pt-16 pb-8 mt-auto w-full bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-heading text-2xl font-bold" style={{ color: "var(--accent)" }}>
              PIXO<span style={{ color: "var(--fg)" }}>.</span>
            </Link>
            <p className="font-body text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
              A modern platform for thinkers, creators, and storytellers.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              <Link
                href="/"
                className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={16} color="var(--muted)" />
              </Link>
              <Link
                href="https://github.com/armannhansda/PIXO"
                className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all duration-300"
                aria-label="GitHub"
              >
                <Github size={16} color="var(--muted)" />
              </Link>
              <Link
                href="/"
                className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} color="var(--muted)" />
              </Link>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4
              className="text-xs uppercase font-heading font-semibold mb-5"
              style={{ color: "var(--fg)", letterSpacing: "0.15em" }}
            >
              Platform
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--accent)] transition-colors duration-200"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h4
              className="text-xs uppercase font-heading font-semibold mb-5"
              style={{ color: "var(--fg)", letterSpacing: "0.15em" }}
            >
              Categories
            </h4>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--accent)] transition-colors duration-200"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4
              className="text-xs uppercase font-heading font-semibold mb-5"
              style={{ color: "var(--fg)", letterSpacing: "0.15em" }}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--accent)] transition-colors duration-200"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} PIXO. Crafted with intention.
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Made for writers who care about their craft.
          </p>
        </div>
      </div>
    </footer>
  );
}
