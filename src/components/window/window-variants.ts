import type { Variants } from "framer-motion";

/**
 * Desktop-window animation variants.
 *
 * These are transform-only (scale/opacity/translate) and deliberately static —
 * position and size are driven by `style`, never by Motion. An earlier version
 * rebuilt this object from the live window position, which re-triggered the
 * open spring on every frame of a drag or resize.
 *
 * The minimize target is passed per-window through Motion's `custom` prop, so
 * the object identity here stays stable for the life of the app.
 */
export interface MinimizeTarget {
  /** Translation from the window's own origin to the dock, in pixels. */
  x: number;
  y: number;
}

export const windowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 32,
      mass: 0.7,
    },
  },
  minimizing: (target: MinimizeTarget) => ({
    opacity: 0,
    scale: 0.12,
    x: target.x,
    y: target.y,
    transition: { duration: 0.36, ease: [0.4, 0, 0.2, 1] as const },
  }),
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.14, ease: [0.4, 0, 1, 1] as const },
  },
};

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
