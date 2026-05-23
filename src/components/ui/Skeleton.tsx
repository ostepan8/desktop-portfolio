"use client";

import { motion, type TargetAndTransition } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-white/10";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-lg",
  };

  const animationVariants: Record<string, TargetAndTransition | undefined> = {
    pulse: {
      opacity: [0.4, 0.7, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    wave: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      },
    },
    none: undefined,
  };

  const style: React.CSSProperties = {
    width: width ?? "100%",
    height: height ?? "1em",
  };

  if (animation === "wave") {
    style.background = "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)";
    style.backgroundSize = "200% 100%";
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      animate={animationVariants[animation]}
    />
  );
}

// Pre-built skeleton layouts for common UI patterns
export function TextSkeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={14}
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  );
}

export function IconSkeleton({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="rounded"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 rounded-lg bg-white/5 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <IconSkeleton size={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={16} width="60%" className="mb-1" />
          <Skeleton variant="text" height={12} width="40%" />
        </div>
      </div>
      <TextSkeleton lines={2} />
    </div>
  );
}

export function ListItemSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-2 ${className}`}>
      <IconSkeleton size={32} />
      <div className="flex-1">
        <Skeleton variant="text" height={14} width="50%" />
      </div>
      <Skeleton variant="text" height={12} width={60} />
    </div>
  );
}

export function FinderSkeleton() {
  return (
    <div className="h-full flex bg-[#1e1e1e]">
      {/* Sidebar skeleton */}
      <div className="w-52 bg-[#1e1e1e]/50 border-r border-white/5 p-4">
        <Skeleton variant="text" height={10} width={60} className="mb-3" />
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-1">
              <IconSkeleton size={16} />
              <Skeleton variant="text" height={12} width="60%" />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <IconSkeleton size={64} />
              <Skeleton variant="text" height={12} width={60} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WindowLoadingSkeleton({ title = "Loading..." }: { title?: string }) {
  return (
    <div className="h-full flex flex-col">
      {/* Title area */}
      <div className="h-10 flex items-center justify-center border-b border-white/10 bg-[#2a2a2c]">
        <span className="text-[13px] text-white/40">{title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <motion.div
          className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
