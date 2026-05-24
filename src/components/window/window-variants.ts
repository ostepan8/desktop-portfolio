import type { Variants } from "framer-motion";

/**
 * Build the desktop-window animation variants. The "minimizing" variant
 * needs the live window position so it can compute a translation that lands
 * at the dock (bottom-center of the screen).
 *
 * Returned as a plain function (not a hook) — callers should still memoize
 * around `windowPosition.x|y` to avoid re-creating variants every render.
 */
export function buildWindowVariants(windowPosition: { x: number; y: number }): Variants {
  const screenWidth =
    typeof window !== "undefined" ? window.innerWidth : 1200;
  const screenHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const dockTargetX = screenWidth / 2 - windowPosition.x;
  const dockTargetY = screenHeight - 60 - windowPosition.y;

  return {
    hidden: { scale: 0.92, opacity: 0, y: 8 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
    minimizing: {
      scale: 0.15,
      opacity: 0,
      x: dockTargetX,
      y: dockTargetY,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 4,
      transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
    },
  };
}

/** Mobile windows open as full-screen sheets that slide up from the bottom. */
export const mobileWindowVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as const },
  },
};
