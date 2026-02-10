"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { AppIcon } from "@/components/icons";

const bounceVariants: Variants = {
  idle: { y: 0 },
  bouncing: {
    y: [0, -20, 0, -12, 0, -6, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      ease: "easeOut",
    },
  },
};

export interface DockItemData {
  id: string;
  icon: string; // kept for backwards compat, but we'll use AppIcon
  label: string;
  isRunning?: boolean;
  onClick?: () => void;
}

interface DockProps {
  items: DockItemData[];
  onItemClick?: (id: string) => void;
}

export function Dock({ items, onItemClick }: DockProps) {
  const isMobile = useIsMobile();
  const mouseX = useMotionValue(Infinity);

  // Mobile: Simple bottom tab bar
  if (isMobile) {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <div className="bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {items.slice(0, 5).map((item) => (
              <MobileDockItem
                key={item.id}
                item={item}
                onClick={() => {
                  item.onClick?.();
                  onItemClick?.(item.id);
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop: Full dock with magnification
  return (
    <motion.div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <motion.div
        className="h-[68px] px-3 bg-white/10 glass rounded-2xl border border-white/20 flex items-end gap-1 pb-2"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            onClick={() => {
              item.onClick?.();
              onItemClick?.(item.id);
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface MobileDockItemProps {
  item: DockItemData;
  onClick?: () => void;
}

function MobileDockItem({ item, onClick }: MobileDockItemProps) {
  return (
    <motion.button
      className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg active:bg-white/10 relative"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
    >
      <AppIcon appId={item.id} size={40} />
      <span className="text-[10px] text-white/60 font-medium">{item.label}</span>
      {item.isRunning && (
        <div className="absolute -bottom-0.5 w-1 h-1 bg-white/60 rounded-full" />
      )}
    </motion.button>
  );
}

interface DockIconProps {
  item: DockItemData;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  onClick?: () => void;
}

function DockIcon({ item, mouseX, onClick }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const handleClick = () => {
    // Start bounce animation if app is not already running
    if (!item.isRunning) {
      setIsBouncing(true);
      // Stop bouncing after animation completes (or when app opens)
      setTimeout(() => setIsBouncing(false), 1500);
    }
    onClick?.();
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="absolute -top-8 px-3 py-1 bg-gray-900/90 text-white text-xs rounded-md whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
        transition={{ duration: 0.15 }}
      >
        {item.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90" />
      </motion.div>

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="rounded-xl flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        variants={bounceVariants}
        animate={isBouncing ? "bouncing" : "idle"}
        whileTap={!isBouncing ? { scale: 0.95 } : undefined}
      >
        <AppIcon appId={item.id} size={48} className="select-none" />
      </motion.div>

      {item.isRunning && (
        <motion.div
          className="absolute -bottom-1 w-1 h-1 bg-white/60 rounded-full"
          layoutId={"running-" + item.id}
        />
      )}
    </div>
  );
}

export function DockSeparator() {
  return <div className="w-px h-10 bg-white/20 mx-1 self-center" />;
}
