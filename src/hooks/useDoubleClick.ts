"use client";

import { useCallback, useRef } from "react";

const DEFAULT_THRESHOLD_MS = 300;

/**
 * Detect a manual double-click on elements where the native `onDoubleClick`
 * event doesn't fit (e.g. desktop icons that also support single-click selection
 * with click-drag semantics). Most callers should prefer native `onDoubleClick`.
 *
 * Returns a click handler — invoke it on every single click. It fires
 * `onDoubleClick` when two clicks land within `thresholdMs` of each other.
 */
export function useDoubleClick<T = unknown>(
  onDoubleClick: (target: T) => void,
  thresholdMs: number = DEFAULT_THRESHOLD_MS,
) {
  const lastClickRef = useRef<{ target: T; at: number } | null>(null);

  return useCallback(
    (target: T) => {
      const now = Date.now();
      const previous = lastClickRef.current;

      if (previous && previous.target === target && now - previous.at < thresholdMs) {
        lastClickRef.current = null;
        onDoubleClick(target);
        return;
      }

      lastClickRef.current = { target, at: now };
    },
    [onDoubleClick, thresholdMs],
  );
}
