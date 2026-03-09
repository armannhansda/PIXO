"use client";

import { ErrorFallback } from "../components/error-fallback";

export default function LoginError() {
  return (
    <ErrorFallback
      title="Login unavailable"
      description="We're having trouble loading the login page. Please try again shortly."
      showBackLink={false}
    />
  );
}
