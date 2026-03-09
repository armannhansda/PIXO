"use client";

import { Skeleton, SkeletonCard } from "../../components/skeleton-pulse";

export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Banner */}
      <Skeleton className="w-full h-48 md:h-64" rounded="rounded-none" />

      {/* Profile info */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Skeleton
            className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-lg"
            rounded="rounded-full"
          />

          <div className="flex-1 pt-2 sm:pt-8 w-full">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-44" rounded="rounded-lg" />
                <Skeleton className="h-4 w-32" rounded="rounded-md" />
                <Skeleton
                  className="h-4 w-80 max-w-full"
                  rounded="rounded-md"
                />
                <Skeleton className="h-4 w-60" rounded="rounded-md" />
              </div>
              <Skeleton className="h-10 w-28" rounded="rounded-full" />
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-20" rounded="rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-8 border-b border-border pb-3">
          <Skeleton className="h-8 w-20" rounded="rounded-md" />
        </div>

        {/* Post cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
