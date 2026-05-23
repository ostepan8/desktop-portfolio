/**
 * macOS layout tokens. Single source of truth for menu bar height, dock height,
 * desktop icon grid, and z-index ordering. Anything that used to be a hardcoded
 * `28`, `80`, `z-[150]` etc. should reference these.
 */

export const MENU_BAR_HEIGHT = 28;
export const DOCK_HEIGHT = 80;
export const GRID_SIZE = 90;

export const WINDOW_DEFAULTS = {
  MIN_WIDTH: 400,
  MIN_HEIGHT: 300,
  SNAP_THRESHOLD: 20,
  TITLE_BAR_HEIGHT: 28,
} as const;

/**
 * Z-index stacking. Higher = closer to user.
 *
 * Layers (bottom to top):
 *   desktop background      → 0
 *   desktop icons           → 10
 *   windows                 → 20-39 (managed per-window)
 *   dock                    → 40
 *   menu bar                → 50
 *   notification center     → 100
 *   spotlight               → 150
 *   context menu            → 200
 *   modal dialog            → 300
 *   skip-link / a11y        → 9999
 */
export const Z_INDEX = {
  desktopBackground: 0,
  desktopIcons: 10,
  windowBase: 20,
  dock: 40,
  menuBar: 50,
  notificationCenter: 100,
  spotlight: 150,
  contextMenu: 200,
  modal: 300,
  skipLink: 9999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
