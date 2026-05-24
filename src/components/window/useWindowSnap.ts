"use client";

import { useCallback, useState } from "react";
import {
  DOCK_HEIGHT,
  MENU_BAR_HEIGHT,
  WINDOW_DEFAULTS,
} from "@/constants/layout";

export type SnapZone = "left" | "right" | "top" | null;

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UseWindowSnapArgs {
  position: Position;
  size: Size;
  onSnap: (next: { position: Position; size: Size; previous: { position: Position; size: Size } }) => void;
}

/**
 * Edge-snap logic for window dragging. While dragging, exposes the current
 * snap zone ("left" | "right" | "top" | null) so the parent can render the
 * preview overlay. On drag end, calls `onSnap` with the new dimensions and
 * the pre-snap state (so callers can restore on un-snap).
 *
 * Zones are detected when the window's leading edge gets within
 * WINDOW_DEFAULTS.SNAP_THRESHOLD of a screen edge.
 */
export function useWindowSnap({ position, size, onSnap }: UseWindowSnapArgs) {
  const [snapZone, setSnapZone] = useState<SnapZone>(null);

  const updateSnap = useCallback(
    (offsetX: number, offsetY: number) => {
      const currentX = position.x + offsetX;
      const currentY = position.y + offsetY;

      const screenWidth =
        typeof window !== "undefined" ? window.innerWidth : 1200;
      const threshold = WINDOW_DEFAULTS.SNAP_THRESHOLD;

      if (currentX <= threshold) {
        setSnapZone("left");
      } else if (currentX + size.width >= screenWidth - threshold) {
        setSnapZone("right");
      } else if (currentY <= MENU_BAR_HEIGHT + threshold) {
        setSnapZone("top");
      } else {
        setSnapZone(null);
      }
    },
    [position, size],
  );

  const commitSnap = useCallback(
    (offsetX: number, offsetY: number) => {
      if (snapZone) {
        const screenWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const screenHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;
        const usableHeight = screenHeight - MENU_BAR_HEIGHT - DOCK_HEIGHT;

        const snapped =
          snapZone === "left"
            ? { x: 0, y: MENU_BAR_HEIGHT, w: screenWidth / 2, h: usableHeight }
            : snapZone === "right"
              ? {
                  x: screenWidth / 2,
                  y: MENU_BAR_HEIGHT,
                  w: screenWidth / 2,
                  h: usableHeight,
                }
              : { x: 0, y: MENU_BAR_HEIGHT, w: screenWidth, h: usableHeight };

        onSnap({
          position: { x: snapped.x, y: snapped.y },
          size: { width: snapped.w, height: snapped.h },
          previous: { position, size },
        });
        setSnapZone(null);
        return true;
      }
      // No snap: caller will commit the simple drag-end position.
      onSnap({
        position: { x: position.x + offsetX, y: position.y + offsetY },
        size,
        previous: { position, size },
      });
      return false;
    },
    [snapZone, position, size, onSnap],
  );

  return { snapZone, updateSnap, commitSnap };
}
