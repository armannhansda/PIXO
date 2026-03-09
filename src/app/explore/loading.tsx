"use client";

import { Skeleton } from "../components/skeleton-pulse";
import { BentoSkeletonGrid, EXPLORE_SKELETON_PATTERN } from "../components/bento-skeleton";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 font-['Inter',sans-serif]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-2" rounded="rounded-lg" />
          <Skeleton className="h-4 w-72" rounded="rounded-md" />
        </div>

        {/* Search bar */}
        <Skeleton className="h-12 w-full max-w-xl mb-8" rounded="rounded-2xl" />

        {/* Category pills */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-22 shrink-0" rounded="rounded-full" />
          ))}
        </div>

        {/* Bento grid skeleton */}
        <BentoSkeletonGrid pattern={EXPLORE_SKELETON_PATTERN} count={6} />
      </div>
    </div>
  );
}
