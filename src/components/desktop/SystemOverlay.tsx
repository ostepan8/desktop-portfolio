"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Z_INDEX } from "@/constants/layout";

export type SystemPowerState = "on" | "sleeping" | "off";

interface SystemOverlayProps {
  state: Exclude<SystemPowerState, "on">;
  /** Sleeping: any click or key wakes. Off: the power button turns back on. */
  onWake: () => void;
}

/**
 * Full-screen black overlay for Apple-menu Sleep and Shut Down. Sleep wakes on
 * any click or keypress; Shut Down shows a power button that boots the machine.
 */
export function SystemOverlay({ state, onWake }: SystemOverlayProps) {
  // While asleep, any keypress wakes the machine (clicks are handled below).
  useEffect(() => {
    if (state !== "sleeping") return;
    const handler = () => onWake();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state, onWake]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center select-none"
      style={{ zIndex: Z_INDEX.systemOverlay }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={state === "sleeping" ? onWake : undefined}
    >
      {state === "sleeping" ? (
        <motion.p
          className="text-white/25 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          Click anywhere or press a key to wake
        </motion.p>
      ) : (
        <button
          onClick={onWake}
          aria-label="Power on"
          className="group flex flex-col items-center gap-4 focus:outline-none"
        >
          <span className="w-16 h-16 rounded-full border-2 border-white/25 flex items-center justify-center text-white/40 text-3xl transition-all group-hover:border-white/60 group-hover:text-white/80 group-active:scale-95">
            ⏻
          </span>
          <span className="text-white/20 text-xs group-hover:text-white/50 transition-colors">
            Press to start
          </span>
        </button>
      )}
    </motion.div>
  );
}
