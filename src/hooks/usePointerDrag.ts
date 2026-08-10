"use client";

import { useCallback, useEffect, useRef } from "react";

export interface DragState {
  /** Pointer position when drag started, in client coordinates. */
  startX: number;
  startY: number;
  /** Current pointer position. */
  currentX: number;
  currentY: number;
  /** Delta from start (currentX - startX). */
  deltaX: number;
  deltaY: number;
}

export interface PointerDragOptions {
  onStart?: (state: DragState, event: PointerEvent | React.PointerEvent) => void;
  onMove: (state: DragState, event: PointerEvent) => void;
  onEnd?: (state: DragState, event: PointerEvent) => void;
}

/**
 * Pointer-event drag primitive. Replaces hand-rolled
 * `mousedown → window.addEventListener("mousemove") + ("mouseup")` blocks
 * for window resize, slider control, selection rectangle, etc.
 *
 * Returns an `onPointerDown` handler — wire it onto the draggable element.
 * Listeners are auto-cleaned on pointerup or pointercancel.
 */
export function usePointerDrag(options: PointerDragOptions) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  return useCallback((event: React.PointerEvent) => {
    const startX = event.clientX;
    const startY = event.clientY;
    let lastState: DragState = {
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      deltaX: 0,
      deltaY: 0,
    };

    optionsRef.current.onStart?.(lastState, event);

    // Capture the pointer so the gesture keeps tracking when the cursor
    // crosses an iframe (which would otherwise swallow the events and freeze
    // the drag) or leaves the browser window entirely. Captured events are
    // retargeted to this element and still bubble to the window listeners
    // below; capture auto-releases on pointerup.
    const captureTarget = event.currentTarget;
    if (captureTarget instanceof Element) {
      try {
        captureTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer already gone (e.g. pen lifted mid-press) — fall back to
        // plain window listeners.
      }
    }

    const handleMove = (e: PointerEvent) => {
      lastState = {
        startX,
        startY,
        currentX: e.clientX,
        currentY: e.clientY,
        deltaX: e.clientX - startX,
        deltaY: e.clientY - startY,
      };
      optionsRef.current.onMove(lastState, e);
    };

    const handleEnd = (e: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
      optionsRef.current.onEnd?.(lastState, e);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
  }, []);
}
