"use client";

import { Skeleton, SkeletonText } from "../components/skeleton-pulse";

export default function WriteLoading() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 font-['Inter',sans-serif]">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-8 h-8" rounded="rounded-full" />
                <Skeleton className="h-3.5 w-24 hidden sm:block" rounded="rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="h-1 w-full" rounded="rounded-full" />
        </div>

        {/* Step title */}
        <Skeleton className="h-8 w-40 mb-2" rounded="rounded-lg" />
        <Skeleton className="h-4 w-64 mb-8" rounded="rounded-md" />

        {/* Form fields */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-12 mb-2" rounded="rounded-md" />
            <Skeleton className="h-12 w-full" rounded="rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" rounded="rounded-md" />
            <Skeleton className="h-12 w-full" rounded="rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" rounded="rounded-md" />
            <Skeleton className="w-full aspect-[16/9]" rounded="rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" rounded="rounded-md" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-7 w-16" rounded="rounded-full" />
              <Skeleton className="h-7 w-20" rounded="rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" rounded="rounded-xl" />
              <Skeleton className="h-10 w-16" rounded="rounded-xl" />
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <Skeleton className="h-10 w-24" rounded="rounded-xl" />
          <Skeleton className="h-10 w-24" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}
