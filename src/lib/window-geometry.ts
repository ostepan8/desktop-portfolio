/**
 * Pure window geometry math — every "where and how big should this window be"
 * decision lives here so it can be reasoned about (and unit tested) without a
 * DOM. Nothing in this module reads React state or mutates its arguments.
 *
 * Coordinates are viewport pixels. The *work area* is the desktop region a
 * window may occupy: the viewport minus the menu bar and the dock.
 */

import { DOCK_HEIGHT, MENU_BAR_HEIGHT, WINDOW_DEFAULTS } from "@/constants/layout";

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface Position {
  readonly x: number;
  readonly y: number;
}

export interface Rect extends Position, Size {}

export type SnapZone = "left" | "right" | "maximized";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** Viewport assumed during SSR, before the real one is measurable. */
export const DEFAULT_VIEWPORT: Size = { width: 1440, height: 900 };

function clamp(value: number, min: number, max: number): number {
  // A degenerate range (min > max) means the content cannot fit — pin to min
  // rather than returning a nonsensical value.
  if (min > max) return min;
  return Math.min(Math.max(value, min), max);
}

/** Read the live viewport. Falls back to {@link DEFAULT_VIEWPORT} on the server. */
export function getViewportSize(): Size {
  if (typeof window === "undefined") return DEFAULT_VIEWPORT;
  return { width: window.innerWidth, height: window.innerHeight };
}

/** The region a window may occupy: viewport minus menu bar and dock. */
export function getWorkArea(viewport: Size): Rect {
  return {
    x: 0,
    y: MENU_BAR_HEIGHT,
    width: Math.max(1, viewport.width),
    height: Math.max(1, viewport.height - MENU_BAR_HEIGHT - DOCK_HEIGHT),
  };
}

/** Shrink a rect by `inset` on every side, keeping it centred and non-empty. */
export function insetRect(rect: Rect, inset: number): Rect {
  const width = Math.max(1, rect.width - inset * 2);
  const height = Math.max(1, rect.height - inset * 2);
  return {
    x: rect.x + (rect.width - width) / 2,
    y: rect.y + (rect.height - height) / 2,
    width,
    height,
  };
}

export function rectsEqual(a: Rect, b: Rect): boolean {
  return (
    a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  );
}

/** Smallest rect containing both inputs. */
export function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

/**
 * Largest size that fits inside `area` while preserving `preferred`'s aspect
 * ratio. Never grows past `preferred`, and never drops below `min` unless the
 * area itself is smaller than the minimum.
 */
export function fitSize(preferred: Size, min: Size, area: Size): Size {
  const safeWidth = Math.max(1, preferred.width);
  const safeHeight = Math.max(1, preferred.height);
  const scale = Math.min(1, area.width / safeWidth, area.height / safeHeight);

  return {
    width: Math.round(
      clamp(safeWidth * scale, Math.min(min.width, area.width), area.width),
    ),
    height: Math.round(
      clamp(safeHeight * scale, Math.min(min.height, area.height), area.height),
    ),
  };
}

/** Clamp a size into `area`, respecting the minimum where the area allows. */
export function clampSize(size: Size, min: Size, area: Size): Size {
  return {
    width: Math.round(
      clamp(size.width, Math.min(min.width, area.width), area.width),
    ),
    height: Math.round(
      clamp(size.height, Math.min(min.height, area.height), area.height),
    ),
  };
}

/**
 * Centre a window in `area`, biased slightly above the vertical midpoint —
 * dead-centre reads as low once the dock is accounted for.
 */
export function centerIn(size: Size, area: Rect): Position {
  return {
    x: Math.round(area.x + (area.width - size.width) / 2),
    y: Math.round(area.y + (area.height - size.height) * 0.42),
  };
}

/**
 * Keep a window reachable: its title bar can never hide under the menu bar or
 * behind the dock, and at least `grip` pixels stay on screen horizontally.
 * Windows may still hang off an edge — that is deliberate, macOS allows it.
 */
export function clampPositionToArea(
  position: Position,
  size: Size,
  area: Rect,
  grip: number = WINDOW_DEFAULTS.EDGE_GRIP,
): Position {
  const visible = Math.min(size.width, grip);
  const minX = area.x + visible - size.width;
  const maxX = area.x + area.width - visible;
  const minY = area.y;
  const maxY =
    area.y + area.height - Math.min(size.height, WINDOW_DEFAULTS.TITLE_BAR_HEIGHT);

  return {
    x: Math.round(clamp(position.x, minX, maxX)),
    y: Math.round(clamp(position.y, minY, maxY)),
  };
}

/** Pull a window fully inside `area` (used when the viewport changes). */
export function containPosition(rect: Rect, area: Rect): Position {
  return {
    x: Math.round(
      clamp(rect.x, area.x, Math.max(area.x, area.x + area.width - rect.width)),
    ),
    y: Math.round(
      clamp(
        rect.y,
        area.y,
        Math.max(area.y, area.y + area.height - rect.height),
      ),
    ),
  };
}

/**
 * Re-fit an existing window to a changed work area: shrink it if it no longer
 * fits, then slide it back on screen. Returns `rect` unchanged when it is
 * already valid, so callers can skip redundant state updates.
 */
export function fitRectToArea(rect: Rect, min: Size, area: Rect): Rect {
  const size = clampSize(rect, min, area);
  const position = containPosition({ ...rect, ...size }, area);
  const next = { ...position, ...size };
  return rectsEqual(rect, next) ? rect : next;
}

/**
 * Deterministic placement for the nth window opened. Windows are sized to fit
 * the work area, then cascaded diagonally through the centre so that stacked
 * windows never land on top of each other — and never in a random spot.
 */
export function placeNewWindow(
  index: number,
  preferred: Size,
  min: Size,
  viewport: Size,
): Rect {
  const area = getWorkArea(viewport);
  const spawnArea = insetRect(area, WINDOW_DEFAULTS.SPAWN_MARGIN);
  const size = fitSize(preferred, min, spawnArea);
  const center = centerIn(size, spawnArea);

  const step = WINDOW_DEFAULTS.CASCADE_STEP;
  const slack = Math.min(
    spawnArea.width - size.width,
    spawnArea.height - size.height,
  );
  const slots = clamp(
    Math.floor(slack / step) + 1,
    1,
    WINDOW_DEFAULTS.CASCADE_SLOTS,
  );
  const slot = ((index % slots) + slots) % slots;

  // Centre the cascade band on the centred position so the run of windows
  // stays balanced instead of drifting toward the bottom-right.
  const spread = ((slots - 1) * step) / 2;
  const offset = slot * step - spread;
  const position = containPosition(
    { x: center.x + offset, y: center.y + offset, ...size },
    spawnArea,
  );

  return { ...position, ...size };
}

/** Geometry for a snapped or maximized window. Halves tile without a seam. */
export function snapRect(zone: SnapZone, area: Rect): Rect {
  if (zone === "maximized") return area;

  const leftWidth = Math.round(area.width / 2);
  return zone === "left"
    ? { x: area.x, y: area.y, width: leftWidth, height: area.height }
    : {
        x: area.x + leftWidth,
        y: area.y,
        width: area.width - leftWidth,
        height: area.height,
      };
}

/**
 * Which snap zone the *pointer* is arming, if any. Deliberately conservative,
 * because a snap that fires when the user only wanted to *place* a window
 * near an edge reads as the window "not going where I put it":
 *
 *   - maximize arms only when the pointer is pushed into the menu bar — no
 *     legitimate placement wants the pointer there, since the title bar can
 *     never sit above the work area anyway;
 *   - left/right tiling arms only with the pointer hard against the screen
 *     edge (within {@link WINDOW_DEFAULTS.SNAP_THRESHOLD} px).
 */
export function detectSnapZone(
  pointer: Position,
  viewport: Size,
  threshold: number = WINDOW_DEFAULTS.SNAP_THRESHOLD,
): SnapZone | null {
  if (pointer.y <= MENU_BAR_HEIGHT) return "maximized";
  if (pointer.x <= threshold) return "left";
  if (pointer.x >= viewport.width - threshold) return "right";
  return null;
}

/**
 * Apply a resize drag to a window. Edges are clamped against the work area and
 * against the minimum size, so a handle pins at its limit instead of freezing
 * or jumping. `area` is widened to include `start` first — a window the user
 * has dragged partly off screen must not teleport when it is resized.
 */
export function resizeRect(
  start: Rect,
  direction: ResizeDirection,
  delta: Position,
  min: Size,
  area: Rect,
): Rect {
  const bounds = unionRect(area, start);
  const boundsRight = bounds.x + bounds.width;
  const boundsBottom = bounds.y + bounds.height;
  const minWidth = Math.min(min.width, bounds.width);
  const minHeight = Math.min(min.height, bounds.height);

  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (direction.includes("e")) {
    right = clamp(right + delta.x, left + minWidth, boundsRight);
  }
  if (direction.includes("w")) {
    left = clamp(left + delta.x, bounds.x, right - minWidth);
  }
  if (direction.includes("s")) {
    bottom = clamp(bottom + delta.y, top + minHeight, boundsBottom);
  }
  if (direction.includes("n")) {
    top = clamp(top + delta.y, bounds.y, bottom - minHeight);
  }

  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.round(right - left),
    height: Math.round(bottom - top),
  };
}

/**
 * Where a window should sit when the user drags it out of a snapped state: it
 * returns to its floating size, hung under the pointer at the same relative
 * spot on the title bar it was grabbed at.
 */
export function detachRect(
  snapped: Rect,
  floating: Size,
  pointer: Position,
  area: Rect,
): Rect {
  const grabRatio =
    snapped.width > 0 ? (pointer.x - snapped.x) / snapped.width : 0.5;
  const position = clampPositionToArea(
    {
      x: pointer.x - floating.width * grabRatio,
      y: pointer.y - WINDOW_DEFAULTS.TITLE_BAR_HEIGHT / 2,
    },
    floating,
    area,
  );
  return { ...position, ...floating };
}
