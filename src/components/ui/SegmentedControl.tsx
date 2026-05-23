"use client";

import type { ReactNode } from "react";

export interface SegmentedItem<T extends string> {
  value: T;
  label?: ReactNode;
  icon?: ReactNode;
  title?: string;
}

interface SegmentedControlProps<T extends string> {
  items: ReadonlyArray<SegmentedItem<T>>;
  value: T;
  onChange: (next: T) => void;
  /** macOS accent shade used for the selected segment. */
  accent?: "blue" | "purple" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

/**
 * Filter / view-mode picker. Replaces:
 *   - Finder icons|list view-mode toggle
 *   - Safari category tabs
 *   - Projects tech filter
 * which all reimplemented the same "row of pill buttons, active = colored
 * background" pattern with slightly different accents.
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  accent = "blue",
  size = "md",
  className = "",
}: SegmentedControlProps<T>) {
  const padding = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div className={`inline-flex bg-white/5 rounded overflow-hidden ${className}`}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            title={item.title}
            onClick={() => onChange(item.value)}
            className={
              `${padding} flex items-center gap-1.5 transition-colors ` +
              (active ? ACCENT_ACTIVE[accent] : "text-white/70 hover:bg-white/5")
            }
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

const ACCENT_ACTIVE: Record<NonNullable<SegmentedControlProps<string>["accent"]>, string> = {
  blue: "bg-[var(--macos-accent-bright)] text-white",
  purple: "bg-[#bf5af2] text-white",
  neutral: "bg-white/10 text-white",
};
