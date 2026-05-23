"use client";

import { motion } from "framer-motion";

type ToggleSize = "sm" | "md";
type ToggleColor = "green" | "blue";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: ToggleSize;
  color?: ToggleColor;
  ariaLabel?: string;
}

/**
 * macOS-style switch. Replaces the three separate Toggle/ToggleSwitch/etc.
 * implementations in NotificationCenter, Settings, and elsewhere.
 *
 * Sizes:
 *   sm — 40×24 (NotificationCenter Do Not Disturb)
 *   md — 48×28 (Settings sound output)
 */
export function Toggle({
  checked,
  onChange,
  size = "sm",
  color = "green",
  ariaLabel,
}: ToggleProps) {
  const { trackW, trackH, knob, travel } = SIZE_MAP[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative rounded-full transition-colors ${checked ? COLOR_ON[color] : "bg-white/20"}`}
      style={{ width: trackW, height: trackH }}
    >
      <motion.div
        className="absolute top-1 bg-white rounded-full shadow"
        style={{ width: knob, height: knob }}
        animate={{ left: checked ? travel : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

const SIZE_MAP: Record<ToggleSize, { trackW: number; trackH: number; knob: number; travel: number }> = {
  sm: { trackW: 40, trackH: 24, knob: 16, travel: 20 },
  md: { trackW: 48, trackH: 28, knob: 20, travel: 24 },
};

const COLOR_ON: Record<ToggleColor, string> = {
  green: "bg-[#30d158]",
  blue: "bg-[#0a84ff]",
};
