"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_VIEWPORT,
  getViewportSize,
  getWorkArea,
  type Rect,
  type Size,
} from "@/lib/window-geometry";

/**
 * Single shared viewport store. Every window subscribes to the same snapshot,
 * so a browser resize costs one listener and one rAF for the whole desktop
 * instead of one per component. The snapshot object is only replaced when the
 * dimensions actually change, which keeps `useMemo` deps downstream stable.
 */
let snapshot: Size = DEFAULT_VIEWPORT;
let frame = 0;
const listeners = new Set<() => void>();

function readViewport(): void {
  const next = getViewportSize();
  if (next.width === snapshot.width && next.height === snapshot.height) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function handleResize(): void {
  // Coalesce resize bursts into a single measurement per frame.
  if (frame !== 0) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    readViewport();
  });
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    snapshot = getViewportSize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("orientationchange", handleResize);
    if (frame !== 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

const getSnapshot = (): Size => snapshot;
const getServerSnapshot = (): Size => DEFAULT_VIEWPORT;

/** Current viewport size, kept in sync with browser resizes. */
export function useViewport(): Size {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Current desktop work area — viewport minus the menu bar and the dock. */
export function useWorkArea(): Rect {
  const viewport = useViewport();
  return useMemo(() => getWorkArea(viewport), [viewport]);
}
