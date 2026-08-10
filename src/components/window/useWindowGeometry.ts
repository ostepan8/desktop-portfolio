"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { WINDOW_DEFAULTS } from "@/constants/layout";
import {
  fitRectToArea,
  rectsEqual,
  snapRect,
  type Rect,
  type Size,
  type SnapZone,
} from "@/lib/window-geometry";

/** "floating" is a free-standing window; the rest are edge-snapped states. */
export type WindowMode = "floating" | SnapZone;

interface UseWindowGeometryArgs {
  initialRect: Rect;
  min: Size;
  workArea: Rect;
  elementRef: RefObject<HTMLElement | null>;
}

export interface WindowGeometry {
  /** Geometry to render. Not updated mid-gesture — read `liveRect` for that. */
  rect: Rect;
  mode: WindowMode;
  /** True while a maximize / snap / restore transition should be animated. */
  isTransitioning: boolean;
  /** Geometry the window returns to when un-snapped. */
  restoreRect: Rect;
  /** Latest geometry including an in-flight gesture. */
  liveRect: () => Rect;
  /** 60fps path: paint a gesture frame without re-rendering React. */
  previewRect: (next: Rect) => void;
  /** Finish a gesture (or apply a one-off move) and commit to React state. */
  commitRect: (next: Rect, options?: { animate?: boolean }) => void;
  /** Snap, maximize, or restore. Always animated. */
  applyMode: (next: WindowMode) => void;
  /** End a free drag: the window is floating again and this is where it lives. */
  commitFloating: (next: Rect) => void;
  toggleMaximize: () => void;
}

function writeRect(element: HTMLElement | null, rect: Rect): void {
  if (!element) return;
  element.style.left = `${rect.x}px`;
  element.style.top = `${rect.y}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

/**
 * Owns a window's position, size, and snap state.
 *
 * Two rules keep this predictable:
 *
 * 1. Drags and resizes are painted straight to the DOM (`previewRect`) and only
 *    committed to React state on release, so a gesture costs zero re-renders of
 *    the window's contents.
 * 2. **What the user commits is exactly what gets rendered.** The gesture
 *    handlers apply their own constraints while the pointer moves, and the
 *    committed rect is never re-clamped, re-fitted, or otherwise second-guessed
 *    afterwards — a window dropped hanging off the edge of the screen stays
 *    hanging off the edge. Stored geometry is only adjusted when the work area
 *    itself changes (browser resize), and that adjustment happens once, not as
 *    a continuous derivation. A snapped window is the exception: its geometry
 *    is defined by its mode, so it is derived from the work area and tracks
 *    browser resizes for free.
 */
export function useWindowGeometry({
  initialRect,
  min,
  workArea,
  elementRef,
}: UseWindowGeometryArgs): WindowGeometry {
  const [rect, setRect] = useState<Rect>(initialRect);
  const [mode, setMode] = useState<WindowMode>("floating");
  const [isTransitioning, setIsTransitioning] = useState(false);
  /** Geometry a snapped window returns to. Also the size a drag detaches at. */
  const [restoreRect, setRestoreRect] = useState<Rect>(initialRect);
  /** Work area the stored rects were last fitted to. */
  const [fittedArea, setFittedArea] = useState<Rect>(workArea);

  // Browser resized: pull stored geometry back into reach, once. This is the
  // adjust-state-during-render pattern (not an effect), so the corrected rect
  // renders in the same pass and never flashes. `fitRectToArea` returns its
  // input unchanged when the rect is already valid, so the common case is a
  // no-op.
  if (fittedArea !== workArea) {
    setFittedArea(workArea);
    const nextRect = fitRectToArea(rect, min, workArea);
    if (nextRect !== rect) setRect(nextRect);
    const nextRestore = fitRectToArea(restoreRect, min, workArea);
    if (nextRestore !== restoreRect) setRestoreRect(nextRestore);
  }

  const gestureRef = useRef<Rect | null>(null);
  const renderedRef = useRef<Rect>(initialRect);
  const transitionTimer = useRef<number | null>(null);

  const renderedRect = useMemo(
    () => (mode === "floating" ? rect : snapRect(mode, workArea)),
    [rect, mode, workArea],
  );

  // Geometry is written here, after every render, rather than being left to
  // React's style diffing. Two reasons:
  //   * a gesture paints straight to the DOM, so React's idea of the element's
  //     geometry is stale — it would only write back the props it thinks
  //     changed and leave the rest at their mid-gesture values;
  //   * an unrelated re-render (snap preview, focus change) must not repaint
  //     the pre-gesture position underneath the user's cursor.
  // This runs before paint, so the correction is never visible.
  useLayoutEffect(() => {
    renderedRef.current = renderedRect;
    writeRect(elementRef.current, gestureRef.current ?? renderedRect);
  });

  useEffect(
    () => () => {
      if (transitionTimer.current !== null)
        clearTimeout(transitionTimer.current);
    },
    [],
  );

  const liveRect = useCallback(
    () => gestureRef.current ?? renderedRef.current,
    [],
  );

  const previewRect = useCallback(
    (next: Rect) => {
      gestureRef.current = next;
      writeRect(elementRef.current, next);
    },
    [elementRef],
  );

  const commitRect = useCallback(
    (next: Rect, options?: { animate?: boolean }) => {
      gestureRef.current = null;
      if (options?.animate) {
        if (transitionTimer.current !== null)
          clearTimeout(transitionTimer.current);
        setIsTransitioning(true);
        transitionTimer.current = window.setTimeout(() => {
          transitionTimer.current = null;
          setIsTransitioning(false);
        }, WINDOW_DEFAULTS.TRANSITION_MS);
      }
      setRect((prev) => (rectsEqual(prev, next) ? prev : next));
    },
    [],
  );

  const applyMode = useCallback(
    (next: WindowMode) => {
      if (next === "floating") {
        setMode("floating");
        // The remembered geometry may predate a viewport change, so fit it to
        // the *current* work area at the moment it is restored.
        commitRect(fitRectToArea(restoreRect, min, workArea), {
          animate: true,
        });
        return;
      }
      // Remember where to come back to, but only when leaving a floating
      // state — snapping left then right must still restore the original.
      if (mode === "floating") setRestoreRect(liveRect());
      setMode(next);
      commitRect(snapRect(next, workArea), { animate: true });
    },
    [commitRect, liveRect, min, mode, restoreRect, workArea],
  );

  const commitFloating = useCallback(
    (next: Rect) => {
      setRestoreRect(next);
      setMode("floating");
      commitRect(next);
    },
    [commitRect],
  );

  const toggleMaximize = useCallback(() => {
    applyMode(mode === "floating" ? "maximized" : "floating");
  }, [applyMode, mode]);

  return {
    rect: renderedRect,
    mode,
    isTransitioning,
    restoreRect,
    liveRect,
    previewRect,
    commitRect,
    applyMode,
    commitFloating,
    toggleMaximize,
  };
}
