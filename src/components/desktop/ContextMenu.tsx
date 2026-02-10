"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

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

      if (adjustedX !== x || adjustedY !== y) {
        menuRef.current.style.left = `${adjustedX}px`;
        menuRef.current.style.top = `${adjustedY}px`;
      }
    }
  }, [x, y]);

  return (
    <motion.div
      ref={menuRef}
      className="fixed z-[200] min-w-[200px] py-1 rounded-lg overflow-hidden shadow-2xl shadow-black/50"
      style={{
        left: x,
        top: y,
        backgroundColor: "rgba(40, 40, 45, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {items.map((item, index) =>
        item.divider ? (
          <div
            key={`divider-${index}`}
            className="h-px bg-white/10 my-1 mx-2"
          />
        ) : (
          <button
            key={item.label}
            className={
              "w-full px-3 py-1.5 flex items-center gap-2 text-left text-[13px] transition-colors " +
              (item.disabled
                ? "text-white/30 cursor-default"
                : item.danger
                ? "text-red-400 hover:bg-red-500/30 cursor-default"
                : "text-white/90 hover:bg-[#0058d1] cursor-default")
            }
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span className="w-4 text-center">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-white/40 text-xs">{item.shortcut}</span>
            )}
          </button>
        )
      )}
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
