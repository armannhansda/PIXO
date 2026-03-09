"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-['Inter',sans-serif]">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center"
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FileQuestion size={36} className="text-accent" />
        </motion.div>

        <motion.span
          className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          404
        </motion.span>

        <h1 className="mb-3" style={{ fontSize: 28, fontWeight: 700 }}>
          Page not found
        </h1>

        <p
          className="text-muted-foreground mb-8 max-w-sm mx-auto"
          style={{ fontSize: 15, lineHeight: 1.6 }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            href="/explore"
            className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-xl hover:bg-surface transition-colors"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            Explore Posts
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 mx-auto mt-5 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontSize: 13 }}
        >
          <ArrowLeft size={14} />
          Go back
        </button>
      </motion.div>
    </div>
  );
}
