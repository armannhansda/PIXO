"use client";

import { ErrorFallback } from "./components/error-fallback";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-fg">
        <ErrorFallback
          error={error}
          reset={reset}
          title="A critical error occurred"
          description="Something went deeply wrong. Please refresh the page or try again later."
          showHomeLink={true}
        />
      </body>
    </html>
  );
}
