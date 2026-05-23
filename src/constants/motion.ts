import type { Variants, Transition } from "framer-motion";

/**
 * Framer Motion presets. Replace inline `{ initial, animate, exit }` blocks
 * that recur across menus, tooltips, modals, and sheets with these named
 * presets so animation timing/easing stays consistent.
 */

const SPRING_QUICK: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

const EASE_OUT: Transition = {
  duration: 0.18,
  ease: [0.22, 1, 0.36, 1],
};

/** Pop-down panel for menu-bar dropdowns, Spotlight, and small floating cards. */
export const panelPopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: EASE_OUT },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.12 } },
};

/** Tiny tooltip popovers next to status icons and dock items. */
export const tooltipVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
  exit: { opacity: 0, y: 4, transition: { duration: 0.08 } },
};

/** Modal dialogs (PromptDialog, About This Mac). Backdrop fades, panel scales. */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING_QUICK },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.12 } },
};

/** Side panel that slides in from the right (NotificationCenter). */
export const slideInRightVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: SPRING_QUICK },
  exit: { x: "100%", transition: { duration: 0.18 } },
};

/** Window opening from dock bounce. */
export const windowOpenVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_QUICK },
};
