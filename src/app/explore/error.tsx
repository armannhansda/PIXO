"use client";

import { ErrorFallback } from "../components/error-fallback";

export default function ExploreError() {
  return (
    <ErrorFallback
      title="Explore unavailable"
      description="We couldn't load the explore page right now. Please try again in a moment."
    />
  );
}
