"use client";

import { ErrorFallback } from "./components/error-fallback";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Couldn't load the feed"
      description="We had trouble loading the homepage. Check your connection and try again."
      showHomeLink={false}
    />
  );
}
