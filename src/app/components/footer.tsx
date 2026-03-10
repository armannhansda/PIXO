"use client";

import Link from "next/link";
import { Heart, Github, Twitter, Rss, Mail, PenSquare } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Explore", href: "/explore" },
    { label: "Write", href: "/write" },
    { label: "Trending", href: "/explore" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white">
                <PenSquare size={16} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 700 }}>PIXO</span>
            </Link>
            <p
              className="text-muted-foreground mb-5 max-w-[240px]"
              style={{ fontSize: 14, lineHeight: 1.7 }}
            >
              A modern platform for writers to share ideas, stories, and
              knowledge with the world.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Rss, href: "#", label: "RSS" },
                { icon: Mail, href: "#", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 text-muted-foreground hover:bg-accent hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="mb-4"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      style={{ fontSize: 14 }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            &copy; {new Date().getFullYear()} PIXO. All rights reserved.
          </p>
          <p
            className="flex items-center gap-1 text-muted-foreground"
            style={{ fontSize: 13 }}
          >
            Made with <Heart size={13} className="text-red-500 fill-red-500" />{" "}
            for writers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
