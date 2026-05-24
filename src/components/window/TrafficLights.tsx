"use client";

import type { ReactNode } from "react";

type TrafficColor = "close" | "minimize" | "maximize";

interface TrafficLightsProps {
  isActive: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

/**
 * The three macOS window controls (close / minimize / maximize) in the
 * upper-left of the title bar. The buttons render gray when the window is
 * inactive — matching native macOS behavior where only the focused window
 * shows colored traffic lights.
 *
 * Icons render on hover via the `group-hover/traffic` modifier — make sure
 * the parent has `group/traffic`.
 */
export function TrafficLights({
  isActive,
  onClose,
  onMinimize,
  onMaximize,
}: TrafficLightsProps) {
  return (
    <div className="flex items-center gap-[7px] group/traffic">
      <TrafficLight color="close" isActive={isActive} onClick={onClose} />
      <TrafficLight color="minimize" isActive={isActive} onClick={onMinimize} />
      <TrafficLight color="maximize" isActive={isActive} onClick={onMaximize} />
    </div>
  );
}

const COLOR_TOKENS: Record<TrafficColor, { bg: string; border: string }> = {
  // Border tones are slightly darker than the fill to mimic the macOS bevel.
  close: { bg: "var(--traffic-close)", border: "#e0443e" },
  minimize: { bg: "var(--traffic-minimize)", border: "#dea123" },
  maximize: { bg: "var(--traffic-maximize)", border: "#1aab29" },
};

const GLYPHS: Record<TrafficColor, ReactNode> = {
  close: (
    <svg
      className="w-[6px] h-[6px]"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
    </svg>
  ),
  minimize: (
    <svg
      className="w-[8px] h-[8px]"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M2 6h8" />
    </svg>
  ),
  maximize: (
    <svg
      className="w-[6px] h-[6px]"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M1 1h4v4H1zM7 7h4v4H7z" />
    </svg>
  ),
};

function TrafficLight({
  color,
  isActive,
  onClick,
}: {
  color: TrafficColor;
  isActive: boolean;
  onClick?: () => void;
}) {
  const { bg, border } = COLOR_TOKENS[color];

  return (
    <button
      className="w-3 h-3 rounded-full flex items-center justify-center transition-all relative"
      style={{
        backgroundColor: isActive ? bg : "#4a4a4a",
        boxShadow: isActive
          ? `inset 0 0 0 0.5px ${border}, inset 0 -1px 1px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 0 0 0.5px #3a3a3a",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span className="opacity-0 group-hover/traffic:opacity-100 text-black/80 transition-opacity">
        {GLYPHS[color]}
      </span>
    </button>
  );
}
