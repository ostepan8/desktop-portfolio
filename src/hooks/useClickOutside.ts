"use client";

import { useEffect, type RefObject } from "react";

/**
 * Fire `onOutside` when a pointerdown lands outside `ref`. Used by menus,
 * dropdowns, and popovers that should dismiss on outside click.
 *
 * Pass `enabled=false` to skip attaching listeners (e.g. when the menu is
 * closed) — avoids paying the listener cost for offscreen UI.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: (event: MouseEvent) => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (event.target instanceof Node && el.contains(event.target)) return;
      onOutside(event);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside, enabled]);
}
