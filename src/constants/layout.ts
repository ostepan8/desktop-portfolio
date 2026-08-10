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
  /**
   * Pointer distance from the left/right screen edge that arms an edge snap.
   * Deliberately small: a drop *near* an edge is usually a placement, not a
   * request to tile — only a pointer pressed hard against the edge snaps.
   */
  SNAP_THRESHOLD: 8,
  /** Height of the window title bar (`h-10`). */
  TITLE_BAR_HEIGHT: 40,
  /** Gap kept between an auto-placed window and the edge of the work area. */
  SPAWN_MARGIN: 28,
  /** Diagonal offset between successive auto-placed windows. */
  CASCADE_STEP: 30,
  /** Maximum number of distinct cascade slots before the sequence repeats. */
  CASCADE_SLOTS: 6,
  /** Window edge that always stays on screen while dragging past an edge. */
  EDGE_GRIP: 96,
  /** Duration of maximize / snap / restore geometry transitions, in ms. */
  TRANSITION_MS: 220,
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
 *   brightness dim overlay  → 380
 *   sleep / shutdown screen → 400
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
  brightnessOverlay: 380,
  systemOverlay: 400,
  skipLink: 9999,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
