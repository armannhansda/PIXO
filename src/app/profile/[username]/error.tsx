"use client";

import { ErrorFallback } from "../../components/error-fallback";

export default function PublicProfileError() {
  return (
    <ErrorFallback
      title="Profile couldn't load"
      description="We ran into a problem loading this profile. It might be a temporary issue — try again."
    />
  );
}
