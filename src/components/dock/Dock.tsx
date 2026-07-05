"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, type Variants, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDockMagnification } from "@/hooks/useDockMagnification";
import { AppIcon } from "@/components/icons";
import { ContextMenu, type ContextMenuItem } from "@/components/desktop/ContextMenu";
import { Tooltip } from "@/components/ui/Tooltip";
import { Z_INDEX } from "@/constants/layout";

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
  onQuitApp?: (id: string) => void;
  onShowInFinder?: (id: string) => void;
}

export function Dock({ items, onItemClick, onQuitApp, onShowInFinder }: DockProps) {
  const isMobile = useIsMobile();
  const mouseX = useMotionValue(Infinity);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, item: DockItemData) => {
    e.preventDefault();
    e.stopPropagation();

    const menuItems: ContextMenuItem[] = [
      {
        label: item.isRunning ? "New Window" : "Open",
        action: () => {
          item.onClick?.();
          onItemClick?.(item.id);
        },
      },
      { label: "", divider: true },
      {
        label: "Options",
        disabled: true,
      },
      {
        label: "Show in Finder",
        action: () => onShowInFinder?.(item.id),
      },
      { label: "", divider: true },
    ];

    if (item.isRunning) {
      menuItems.push({
        label: "Quit",
        action: () => onQuitApp?.(item.id),
        danger: true,
      });
    } else {
      menuItems.push({
        label: "Open",
        action: () => {
          item.onClick?.();
          onItemClick?.(item.id);
        },
      });
    }

    setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
  };

  // Mobile: Simple bottom tab bar
  if (isMobile) {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 safe-area-bottom"
        style={{ zIndex: Z_INDEX.dock }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <div className="bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2">
          {/* Scrollable so every app stays reachable; centered when it fits. */}
          <div className="flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 mx-auto">
              {items.map((item) => (
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
        </div>
      </motion.div>
    );
  }

  // Desktop: Full dock with magnification
  return (
    <motion.div
      className="absolute bottom-2 left-1/2 -translate-x-1/2"
      style={{ zIndex: Z_INDEX.dock }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <motion.div
        className="px-2 bg-white/10 glass rounded-2xl border border-white/20 flex items-end gap-0.5 pb-1.5 pt-1.5"
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
            onContextMenu={(e) => handleContextMenu(e, item)}
          />
        ))}
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
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
  onContextMenu?: (e: React.MouseEvent) => void;
}

function DockIcon({ item, mouseX, onClick, onContextMenu }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const width = useDockMagnification(mouseX, ref);

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
      {/* offset must clear the magnified icon (max 72px tall) so the dark
          tooltip panel floats above it instead of peeking out behind it. */}
      <Tooltip visible={isHovered} label={item.label} placement="top" offset={82} />

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="rounded-xl flex items-center justify-center cursor-pointer relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        variants={bounceVariants}
        animate={isBouncing ? "bouncing" : "idle"}
        whileTap={!isBouncing ? { scale: 0.95 } : undefined}
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors duration-150" />
        <div className="w-full h-full flex items-center justify-center relative z-10 p-1.5">
          <AppIcon appId={item.id} size={64} className="select-none w-full h-full" />
        </div>
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
