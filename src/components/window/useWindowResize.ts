"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePointerDrag } from "@/hooks/usePointerDrag";
import { lockPointer, RESIZE_CURSORS } from "@/lib/pointer-lock";
import {
  resizeRect,
  type Rect,
  type ResizeDirection,
  type Size,
} from "@/lib/window-geometry";

interface UseWindowResizeArgs {
  /** Reads the window's live geometry at the moment the handle is grabbed. */
  liveRect: () => Rect;
  min: Size;
  workArea: Rect;
  /** Paint a frame without a React render. */
  onPreview: (rect: Rect) => void;
  /** Commit the final geometry on release. */
  onCommit: (rect: Rect) => void;
}

interface ResizeSession {
  start: Rect;
  direction: ResizeDirection;
  release: () => void;
}

/**
 * Wires the eight edge/corner handles to a pointer drag.
 *
 * Every frame is written straight to the DOM, so resizing a window never
 * re-renders its contents — the previous mousemove-to-setState loop re-rendered
 * (and re-ran the open animation) on every single pointer move.
 */
export function useWindowResize({
  liveRect,
  min,
  workArea,
  onPreview,
  onCommit,
}: UseWindowResizeArgs) {
  const sessionRef = useRef<ResizeSession | null>(null);
  const latestRef = useRef<Rect | null>(null);

  const endSession = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    session.release();
    sessionRef.current = null;
    if (latestRef.current) onCommit(latestRef.current);
    latestRef.current = null;
  }, [onCommit]);

  const startDrag = usePointerDrag({
    onMove: (state) => {
      const session = sessionRef.current;
      if (!session) return;
      const next = resizeRect(
        session.start,
        session.direction,
        { x: state.deltaX, y: state.deltaY },
        min,
        workArea,
      );
      latestRef.current = next;
      onPreview(next);
    },
    onEnd: endSession,
  });

  return useCallback(
    (event: ReactPointerEvent, direction: ResizeDirection) => {
      // Only the primary button resizes, and the gesture must not also start a
      // title-bar drag or a focus-stealing selection.
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      sessionRef.current = {
        start: liveRect(),
        direction,
        release: lockPointer(RESIZE_CURSORS[direction]),
      };
      latestRef.current = null;
      startDrag(event);
    },
    [liveRect, startDrag],
  );
}
