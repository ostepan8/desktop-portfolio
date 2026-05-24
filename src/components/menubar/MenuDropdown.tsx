"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { panelPopVariants } from "@/constants/motion";

export interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

interface MenuBarItemProps {
  children: ReactNode;
  isOpen: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  className?: string;
}

/** A single label in the top-of-screen menu bar (e.g. "File", "Edit"). */
export function MenuBarItem({
  children,
  isOpen,
  onMouseDown,
  onMouseEnter,
  className = "",
}: MenuBarItemProps) {
  return (
    <div
      className={
        "relative px-2 py-0.5 rounded cursor-default transition-colors " +
        (isOpen ? "bg-white/20" : "hover:bg-white/10") +
        " " +
        className
      }
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}

interface MenuDropdownProps {
  items: MenuItem[];
  isOpen: boolean;
}

/** Panel that drops down from a `MenuBarItem`. Uses the shared GlassPanel +
 * panelPopVariants so it matches Spotlight/ContextMenu styling. */
export function MenuDropdown({ items, isOpen }: MenuDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={panelPopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full left-0 mt-0.5"
        >
          <GlassPanel
            variant="menu"
            className="min-w-[220px] py-1.5 rounded-xl overflow-hidden"
          >
            {items.map((item, index) =>
              item.divider ? (
                <div key={index} className="h-px bg-white/10 my-1.5 mx-3" />
              ) : (
                <button
                  key={index}
                  className={
                    "w-full px-3 py-[5px] mx-1.5 flex items-center justify-between text-[13px] rounded-md transition-colors " +
                    "focus:outline-none " +
                    (item.disabled
                      ? "text-white/30 cursor-default"
                      : "text-white/90 hover:bg-[var(--macos-accent-deep)] active:bg-[#004bb5] cursor-default")
                  }
                  style={{ width: "calc(100% - 12px)" }}
                  onClick={() => !item.disabled && item.action?.()}
                  disabled={item.disabled}
                >
                  <span className="font-normal">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-white/40 text-[12px] font-medium tracking-wide ml-4">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ),
            )}
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
