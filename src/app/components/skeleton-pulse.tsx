"use client";

import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = "", rounded = "rounded-xl" }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-surface ${rounded} ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/5" : i % 2 === 0 ? "w-full" : "w-4/5"}`}
          rounded="rounded-md"
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <Skeleton className="w-full aspect-[16/10]" rounded="rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" rounded="rounded-full" />
        <Skeleton className="h-5 w-4/5" rounded="rounded-md" />
        <SkeletonText lines={2} />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="w-8 h-8" rounded="rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-24" rounded="rounded-md" />
            <Skeleton className="h-2.5 w-16" rounded="rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
