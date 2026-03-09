"use client";

import { Skeleton, SkeletonCard } from "../components/skeleton-pulse";
import { motion } from "motion/react";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Banner */}
      <Skeleton className="w-full h-48 md:h-64" rounded="rounded-none" />

      {/* Profile info */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <Skeleton className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-lg" rounded="rounded-2xl" />

          <div className="flex-1 pt-2 sm:pt-8 w-full">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-44" rounded="rounded-lg" />
                <Skeleton className="h-4 w-80 max-w-full" rounded="rounded-md" />
                <Skeleton className="h-4 w-60" rounded="rounded-md" />
              </div>
              <div className="hidden sm:flex gap-2">
                <Skeleton className="w-10 h-10" rounded="rounded-xl" />
                <Skeleton className="w-10 h-10" rounded="rounded-xl" />
                <Skeleton className="h-10 w-20" rounded="rounded-xl" />
              </div>
            </div>

            {/* Location & date */}
            <div className="flex items-center gap-4 mt-3">
              <Skeleton className="h-3.5 w-32" rounded="rounded-md" />
              <Skeleton className="h-3.5 w-28" rounded="rounded-md" />
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Skeleton className="h-5 w-10" rounded="rounded-md" />
                  <Skeleton className="h-3.5 w-14" rounded="rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-border">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-16 mx-1" rounded="rounded-md" />
            ))}
          </div>
        </div>

        {/* Tab content - grid */}
        <div className="py-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
