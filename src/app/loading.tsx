"use client";

import { motion } from "motion/react";
import { Skeleton } from "./components/skeleton-pulse";
import { BentoSkeletonGrid } from "./components/bento-skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Hero Skeleton */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" rounded="rounded-lg" />
          <Skeleton className="h-12 w-1/2 mx-auto" rounded="rounded-lg" />
          <Skeleton className="h-5 w-2/3 mx-auto mt-4" rounded="rounded-md" />
          <Skeleton className="h-12 w-full max-w-lg mx-auto mt-8" rounded="rounded-2xl" />
        </div>
      </section>

      {/* Featured Bento Card Skeleton */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-5 h-5" rounded="rounded" />
            <Skeleton className="h-3.5 w-20" rounded="rounded-md" />
          </div>
          {/* Single wide bento skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative rounded-2xl border border-border overflow-hidden min-h-[240px]">
              <Skeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />
              <div className="absolute top-4 left-4">
                <Skeleton className="h-6 w-16" rounded="rounded-full" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 space-y-2.5">
                <Skeleton className="h-7 w-2/3" rounded="rounded-md" />
                <Skeleton className="h-4 w-1/2" rounded="rounded-md" />
                <div className="flex items-center gap-2.5 pt-1">
                  <Skeleton className="w-9 h-9" rounded="rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" rounded="rounded-md" />
                    <Skeleton className="h-2.5 w-16" rounded="rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Bento Grid Skeleton */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-5 h-5" rounded="rounded" />
            <Skeleton className="h-3.5 w-20" rounded="rounded-md" />
          </div>
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-20 shrink-0" rounded="rounded-full" />
            ))}
          </div>
          <BentoSkeletonGrid count={5} />
        </div>
      </section>
    </div>
  );
}
