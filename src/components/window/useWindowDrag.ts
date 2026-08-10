"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePointerDrag } from "@/hooks/usePointerDrag";
import { lockPointer } from "@/lib/pointer-lock";
import {
  clampPositionToArea,
  detachRect,
  detectSnapZone,
  type Position,
  type Rect,
  type Size,
  type SnapZone,
} from "@/lib/window-geometry";
import type { WindowMode } from "./useWindowGeometry";

/** Pointer travel before a press on the title bar counts as a drag. */
const DRAG_THRESHOLD = 3;

interface UseWindowDragArgs {
  liveRect: () => Rect;
  mode: WindowMode;
  /** Size the window returns to when dragged out of a snapped state. */
  floatingSize: Size;
  workArea: Rect;
  viewport: Size;
  onPreview: (rect: Rect) => void;
  /** Dropped without an armed snap zone. */
  onCommit: (rect: Rect) => void;
  /** Dropped on an edge — snap or maximize. */
  onSnap: (zone: SnapZone) => void;
  onSnapZoneChange: (zone: SnapZone | null) => void;
}

interface DragSession {
  /** Geometry the current delta is measured from. */
  start: Rect;
  /** Pointer position matching `start`. */
  origin: Position;
  detached: boolean;
  zone: SnapZone | null;
  latest: Rect;
  release: () => void;
}

/**
 * Title-bar dragging. Position is written straight to the DOM per frame and
 * committed once on release; the drag also arms edge snapping off the pointer
 * position and un-snaps a tiled window by pulling it back to its floating size
 * under the cursor.
 */
export function useWindowDrag({
  liveRect,
  mode,
  floatingSize,
  workArea,
  viewport,
  onPreview,
  onCommit,
  onSnap,
  onSnapZoneChange,
}: UseWindowDragArgs) {
  const sessionRef = useRef<DragSession | null>(null);

  const startDrag = usePointerDrag({
    onMove: (state) => {
      const session = sessionRef.current;
      if (!session) return;

      const pointer: Position = { x: state.currentX, y: state.currentY };

      // A tiled window keeps its snapped geometry until the press is clearly a
      // drag, then springs back to its floating size beneath the cursor.
      if (!session.detached) {
        const travel =
          Math.abs(pointer.x - session.origin.x) +
          Math.abs(pointer.y - session.origin.y);
        if (travel < DRAG_THRESHOLD) return;
        session.detached = true;
        if (mode !== "floating") {
          session.start = detachRect(
            session.start,
            floatingSize,
            pointer,
            workArea,
          );
          session.origin = pointer;
        }
      }

      const size: Size = {
        width: session.start.width,
        height: session.start.height,
      };
      const position = clampPositionToArea(
        {
          x: session.start.x + (pointer.x - session.origin.x),
          y: session.start.y + (pointer.y - session.origin.y),
        },
        size,
        workArea,
      );

      session.latest = { ...position, ...size };
      onPreview(session.latest);

      const zone = detectSnapZone(pointer, viewport);
      if (zone !== session.zone) {
        session.zone = zone;
        onSnapZoneChange(zone);
      }
    },
    onEnd: () => {
      const session = sessionRef.current;
      if (!session) return;
      sessionRef.current = null;
      session.release();
      onSnapZoneChange(null);

      if (!session.detached) return;
      if (session.zone) onSnap(session.zone);
      else onCommit(session.latest);
    },
  });

  return useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      const start = liveRect();
      sessionRef.current = {
        start,
        origin: { x: event.clientX, y: event.clientY },
        detached: false,
        zone: null,
        latest: start,
        release: lockPointer(),
      };
      startDrag(event);
    },
    [liveRect, startDrag],
  );
}
