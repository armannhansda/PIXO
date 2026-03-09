"use client";

import { ErrorFallback } from "../components/error-fallback";

export default function WriteError() {
  return (
    <ErrorFallback
      title="Editor couldn't load"
      description="The post editor ran into a problem. Your draft should be safe — try refreshing."
    />
  );
}
