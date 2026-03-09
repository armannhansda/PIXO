"use client";

import { motion } from "motion/react";
import { Skeleton } from "./skeleton-pulse";

type BentoVariant = "hero" | "wide" | "tall" | "standard";

const variantClasses: Record<BentoVariant, string> = {
  hero: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2 md:row-span-1",
  tall: "md:col-span-1 md:row-span-2",
  standard: "md:col-span-1 md:row-span-1",
};

const variantMinH: Record<BentoVariant, string> = {
  hero: "min-h-[360px] md:min-h-[420px]",
  wide: "min-h-[240px]",
  tall: "min-h-[360px] md:min-h-[420px]",
  standard: "min-h-[280px]",
};

function BentoSkeletonCard({ variant = "standard", index = 0 }: { variant: BentoVariant; index: number }) {
  const isLarge = variant === "hero" || variant === "wide";
  return (
    <motion.div
      className={`${variantClasses[variant]}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <div
        className={`relative rounded-2xl border border-border overflow-hidden ${variantMinH[variant]} h-full`}
      >
        {/* Background shimmer */}
        <Skeleton className="absolute inset-0 w-full h-full" rounded="rounded-none" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Skeleton className="h-6 w-16" rounded="rounded-full" />
          <Skeleton className="w-7 h-7" rounded="rounded-full" />
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3 h-3" rounded="rounded-full" />
            <Skeleton className="h-3 w-16" rounded="rounded-md" />
          </div>
          <Skeleton
            className={`${isLarge ? "h-7 w-4/5" : "h-5 w-3/4"}`}
            rounded="rounded-md"
          />
          {(isLarge || variant === "tall") && (
            <Skeleton className="h-4 w-3/5" rounded="rounded-md" />
          )}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <Skeleton className={`${isLarge ? "w-9 h-9" : "w-7 h-7"}`} rounded="rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" rounded="rounded-md" />
                <Skeleton className="h-2.5 w-14" rounded="rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-14" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface BentoSkeletonGridProps {
  pattern?: BentoVariant[];
  count?: number;
}

const DEFAULT_PATTERN: BentoVariant[] = ["wide", "tall", "standard", "standard", "standard", "wide"];
const EXPLORE_PATTERN: BentoVariant[] = ["hero", "standard", "standard", "tall", "wide", "standard"];

export function BentoSkeletonGrid({ pattern = DEFAULT_PATTERN, count = 6 }: BentoSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
      {Array.from({ length: count }).map((_, i) => (
        <BentoSkeletonCard key={i} variant={pattern[i % pattern.length]} index={i} />
      ))}
    </div>
  );
}

export { EXPLORE_PATTERN as EXPLORE_SKELETON_PATTERN };
