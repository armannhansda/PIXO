"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface ErrorFallbackProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  statusCode?: number;
  title?: string;
  description?: string;
  showHomeLink?: boolean;
  showBackLink?: boolean;
}

export function ErrorFallback({
  error,
  reset,
  statusCode = 500,
  title,
  description,
  showHomeLink = true,
  showBackLink = true,
}: ErrorFallbackProps) {
  let errorTitle = title || "Something went wrong";
  let errorDescription =
    description || "An unexpected error occurred. Please try again.";

  if (statusCode === 404) {
    errorTitle = title || "Page not found";
    errorDescription =
      description ||
      "The page you're looking for doesn't exist or has been moved.";
  } else if (statusCode === 403) {
    errorTitle = title || "Access denied";
    errorDescription =
      description || "You don't have permission to view this page.";
  }

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 font-['Inter',sans-serif]">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Icon */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AlertTriangle size={36} className="text-destructive" />
        </motion.div>

        {/* Status Code */}
        {statusCode && (
          <motion.span
            className="inline-block px-3 py-1 bg-destructive/10 text-destructive rounded-full mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            Error {statusCode}
          </motion.span>
        )}

        {/* Title */}
        <h1 className="mb-3" style={{ fontSize: 28, fontWeight: 700 }}>
          {errorTitle}
        </h1>

        {/* Description */}
        <p
          className="text-muted-foreground mb-8 max-w-sm mx-auto"
          style={{ fontSize: 15, lineHeight: 1.6 }}
        >
          {errorDescription}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          {showHomeLink && (
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-xl hover:bg-surface transition-colors"
              style={{ fontSize: 14, fontWeight: 500 }}
            >
              <Home size={16} />
              Home
            </Link>
          )}
        </div>

        {showBackLink && (
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 mx-auto mt-5 text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            <ArrowLeft size={14} />
            Go back
          </button>
        )}

        {/* Error Details (dev hint) */}
        {error instanceof Error && error.message && (
          <motion.details
            className="mt-8 text-left bg-surface border border-border rounded-xl p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <summary
              className="text-muted-foreground cursor-pointer select-none"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              Error Details
            </summary>
            <pre
              className="mt-3 text-destructive/80 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ fontSize: 12, lineHeight: 1.6 }}
            >
              {error.message}
            </pre>
          </motion.details>
        )}
      </motion.div>
    </div>
  );
}
