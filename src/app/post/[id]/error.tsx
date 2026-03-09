"use client";

import { ErrorFallback } from "../../components/error-fallback";

export default function BlogPostError() {
  return (
    <ErrorFallback
      title="Post not found"
      description="This post may have been removed or the link might be incorrect. Head back and try another."
    />
  );
}
