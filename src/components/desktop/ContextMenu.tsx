"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useKeyDown";
import { panelPopVariants } from "@/constants/motion";
import { Z_INDEX } from "@/constants/layout";

export interface ContextMenuItem {
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [position, setPosition] = useState({ x, y });

  // Get non-divider items for keyboard navigation
  const actionableItems = items.filter((item) => !item.divider && !item.disabled);

  useClickOutside(menuRef, onClose);
  useEscapeKey(onClose);

  // Arrow navigation + Enter to invoke focused item.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < actionableItems.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : actionableItems.length - 1,
        );
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const item = actionableItems[focusedIndex];
        if (item?.action) {
          item.action();
          onClose();
        }
      }
    },
    [actionableItems, focusedIndex, onClose],
  );

  // Scroll dismisses the menu (matches macOS behavior).
  useEffect(() => {
    const handleScroll = () => onClose();
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose, handleKeyDown]);

  // Adjust position to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  // Track which actionable item index corresponds to each visible item
  let actionableIndex = -1;

  return (
    <motion.div
      variants={panelPopVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <GlassPanel
        ref={menuRef}
        variant="menu"
        className="fixed min-w-[220px] py-1.5 rounded-xl overflow-hidden"
        style={{ left: position.x, top: position.y, zIndex: Z_INDEX.contextMenu }}
      >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="h-px bg-white/10 my-1.5 mx-3"
            />
          );
        }

        if (!item.disabled) {
          actionableIndex++;
        }
        const isKeyboardFocused =
          !item.disabled && actionableIndex === focusedIndex;

        return (
          <button
            key={item.label}
            className={
              "w-full px-3 py-[5px] mx-1.5 flex items-center gap-3 text-left text-[13px] rounded-md transition-colors " +
              "focus:outline-none " +
              (item.disabled
                ? "text-white/30 cursor-default"
                : item.danger
                ? "text-red-400 hover:bg-red-500/20 active:bg-red-500/30"
                : isKeyboardFocused
                ? "bg-[var(--macos-accent-deep)] text-white"
                : "text-white/90 hover:bg-white/10 active:bg-white/15")
            }
            style={{ width: "calc(100% - 12px)" }}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            onMouseEnter={() => setFocusedIndex(-1)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="w-4 text-center text-[15px] opacity-80">
                {item.icon}
              </span>
            )}
            <span className="flex-1 font-normal">{item.label}</span>
            {item.shortcut && (
              <span className="text-white/40 text-[12px] font-medium tracking-wide">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
      </GlassPanel>
    </motion.div>
  );
}

// Hook to manage context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const showContextMenu = (
    e: React.MouseEvent,
    items: ContextMenuItem[]
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, items });
  };

  const hideContextMenu = () => {
    setContextMenu(null);
  };

  return { contextMenu, showContextMenu, hideContextMenu };
}
