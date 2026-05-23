"use client";

import type { ReactNode } from "react";

interface SidebarItemProps {
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  /** Optional right-aligned content (badges, counts, color dot). */
  trailing?: ReactNode;
  /** macOS sidebar look uses muted text; pass `subtle` for greyer rows (e.g. Finder tags). */
  variant?: "default" | "subtle";
}

/**
 * Standard sidebar row: icon + label + optional active highlight.
 * Replaces hand-rolled buttons in Finder (favorites, locations, tags) and
 * Settings (tab list) that all encoded the same "active = bg-white/15,
 * hover = bg-white/8" pattern with different padding.
 */
export function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
  trailing,
  variant = "default",
}: SidebarItemProps) {
  const textColor =
    variant === "subtle" ? "text-white/60" : active ? "text-white" : "text-white/80";

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "w-full flex items-center gap-2.5 px-2 py-[5px] text-[13px] rounded-md transition-all " +
        textColor +
        " " +
        (active
          ? "bg-white/15"
          : "hover:bg-white/8 active:bg-white/12")
      }
    >
      {icon && <span className="text-[16px] w-5 text-center opacity-80">{icon}</span>}
      <span className="flex-1 text-left font-normal truncate">{label}</span>
      {trailing}
    </button>
  );
}
