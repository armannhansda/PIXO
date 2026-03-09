"use client";

import { Skeleton, SkeletonText } from "../../components/skeleton-pulse";

export default function BlogPostLoading() {
  return (
    <div className="min-h-screen font-['Inter',sans-serif]">
      {/* Cover image skeleton */}
      <Skeleton className="w-full h-[50vh] md:h-[60vh]" rounded="rounded-none" />

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex gap-12">
          {/* Main content */}
          <article className="flex-1 max-w-3xl">
            {/* Author section */}
            <div className="flex items-center justify-between pb-8 mb-8 border-b border-border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12" rounded="rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" rounded="rounded-md" />
                  <Skeleton className="h-3 w-40" rounded="rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" rounded="rounded-full" />
            </div>

            {/* Article content skeleton */}
            <div className="space-y-6">
              <SkeletonText lines={4} />

              <Skeleton className="h-8 w-3/5 mt-10" rounded="rounded-md" />
              <SkeletonText lines={5} />

              <Skeleton className="h-7 w-2/5 mt-8" rounded="rounded-md" />
              <SkeletonText lines={3} />

              <Skeleton className="h-8 w-1/2 mt-10" rounded="rounded-md" />
              <SkeletonText lines={6} />

              <Skeleton className="h-8 w-2/5 mt-10" rounded="rounded-md" />
              <SkeletonText lines={4} />
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-20" rounded="rounded-full" />
                <Skeleton className="h-9 w-16" rounded="rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9" rounded="rounded-full" />
                <Skeleton className="w-9 h-9" rounded="rounded-full" />
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <Skeleton className="h-3 w-28 mb-3" rounded="rounded-md" />
                <div className="space-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" rounded="rounded-lg" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-3 w-12 mb-3" rounded="rounded-md" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-10 h-10" rounded="rounded-xl" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-11 w-full" rounded="rounded-xl" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
