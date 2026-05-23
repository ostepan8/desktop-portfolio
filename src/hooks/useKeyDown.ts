"use client";

import { useEffect } from "react";

type KeyMatcher = string | string[] | ((event: KeyboardEvent) => boolean);

/**
 * Subscribe to a keydown. `key` can be a single key name, an array of keys,
 * or a predicate for complex matches like Cmd+K.
 *
 * Pass `enabled=false` to detach (e.g. when the consuming UI is closed).
 */
export function useKeyDown(
  key: KeyMatcher,
  onMatch: (event: KeyboardEvent) => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const matches = (event: KeyboardEvent): boolean => {
      if (typeof key === "function") return key(event);
      if (Array.isArray(key)) return key.includes(event.key);
      return event.key === key;
    };

    const handler = (event: KeyboardEvent) => {
      if (matches(event)) onMatch(event);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, onMatch, enabled]);
}

/** Convenience: fire callback when Escape is pressed. */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true): void {
  useKeyDown("Escape", onEscape, enabled);
}
