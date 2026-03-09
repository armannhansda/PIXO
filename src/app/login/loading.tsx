"use client";

import { Skeleton } from "../components/skeleton-pulse";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex font-['Inter',sans-serif] bg-background">
      {/* Left panel */}
      <div className="hidden lg:block lg:w-1/2">
        <Skeleton className="w-full h-full" rounded="rounded-none" />
      </div>

      {/* Right panel - form skeleton */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Skeleton className="w-10 h-10" rounded="rounded-xl" />
            <Skeleton className="h-7 w-28" rounded="rounded-md" />
          </div>

          {/* Title */}
          <Skeleton className="h-8 w-48" rounded="rounded-lg" />
          <Skeleton className="h-4 w-72" rounded="rounded-md" />

          {/* Google button */}
          <Skeleton className="h-12 w-full mt-4" rounded="rounded-xl" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <Skeleton className="h-3 w-6" rounded="rounded-md" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3.5 w-10 mb-1.5" rounded="rounded-md" />
              <Skeleton className="h-12 w-full" rounded="rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-3.5 w-16 mb-1.5" rounded="rounded-md" />
              <Skeleton className="h-12 w-full" rounded="rounded-xl" />
            </div>
          </div>

          {/* Submit button */}
          <Skeleton className="h-12 w-full" rounded="rounded-xl" />

          {/* Footer text */}
          <Skeleton className="h-4 w-56 mx-auto" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
}
