"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";

type GlassVariant = "menu" | "panel" | "tooltip" | "sheet";

interface GlassPanelProps {
  variant?: GlassVariant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * macOS-style frosted glass surface. Replaces the inline
 * `{ backgroundColor: "rgba(30, 30, 32, 0.X)", backdropFilter: "blur(50px) saturate(180%)", ... }`
 * block that recurs in ControlCenter, MenuDropdown, NotificationCenter,
 * ContextMenu, Spotlight, and Dock tooltips.
 *
 * Variants tune opacity + shadow for context:
 *   menu    — dropdown menus (220px+ wide, deep shadow)
 *   panel   — large side sheets (NotificationCenter, ControlCenter)
 *   tooltip — small floating chips (Dock label, StatusIcon hint)
 *   sheet   — full-width Spotlight-style dialog
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel({ variant = "menu", className = "", style, children }, ref) {
    return (
      <div
        ref={ref}
        className={className}
        style={{ ...VARIANT_STYLES[variant], ...style }}
      >
        {children}
      </div>
    );
  },
);

const BLUR = "blur(50px) saturate(180%)";

const VARIANT_STYLES: Record<GlassVariant, CSSProperties> = {
  menu: {
    backgroundColor: "rgba(30, 30, 32, 0.9)",
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
    boxShadow:
      "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.1), inset 0 0.5px 0 rgba(255, 255, 255, 0.1)",
  },
  panel: {
    backgroundColor: "rgba(30, 30, 32, 0.75)",
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
    boxShadow: "-5px 0 30px rgba(0, 0, 0, 0.3)",
  },
  tooltip: {
    backgroundColor: "rgba(30, 30, 32, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 0.5px rgba(255, 255, 255, 0.1)",
  },
  sheet: {
    backgroundColor: "rgba(30, 30, 32, 0.9)",
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
    boxShadow:
      "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1)",
  },
};
