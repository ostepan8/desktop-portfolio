"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { GlassPanel } from "./GlassPanel";

type TooltipPlacement = "top" | "bottom";

interface TooltipProps {
  /** Whether the tooltip should currently be visible. */
  visible: boolean;
  /** Tooltip text or custom content. */
  label: ReactNode;
  /** Which side of the trigger the tooltip sits on. Default top. */
  placement?: TooltipPlacement;
  /** Pixel offset from the trigger. Default 40. */
  offset?: number;
  /** Optional extra classes for positioning relative to the trigger. */
  className?: string;
}

/**
 * Floating label with an arrow notch. Replaces the two near-identical
 * tooltip implementations in `MenuBar` (StatusIcon) and `Dock` (DockIcon)
 * that hand-rolled an absolutely-positioned panel + CSS border arrow.
 *
 * The parent must establish a positioning context (`relative`).
 */
export function Tooltip({
  visible,
  label,
  placement = "top",
  offset = 40,
  className = "",
}: TooltipProps) {
  const isTop = placement === "top";
  return (
    <motion.div
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-none z-10 ${className}`}
      style={isTop ? { bottom: offset } : { top: offset }}
      initial={{ opacity: 0, y: isTop ? 6 : -6, scale: 0.95 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : isTop ? 6 : -6,
        scale: visible ? 1 : 0.95,
      }}
      transition={{ duration: 0.12 }}
    >
      <GlassPanel
        variant="tooltip"
        className="px-3 py-1.5 rounded-lg text-white text-[12px] font-medium whitespace-nowrap"
      >
        {label}
        <TooltipArrow placement={placement} />
      </GlassPanel>
    </motion.div>
  );
}

function TooltipArrow({ placement }: { placement: TooltipPlacement }) {
  const isTop = placement === "top";
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={
        isTop
          ? {
              top: "100%",
              marginTop: -1,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(30, 30, 32, 0.95)",
            }
          : {
              bottom: "100%",
              marginBottom: -1,
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "6px solid rgba(30, 30, 32, 0.95)",
            }
      }
    />
  );
}
