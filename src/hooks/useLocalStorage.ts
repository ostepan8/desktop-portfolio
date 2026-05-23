"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist a value to localStorage. SSR-safe: initial state always renders the
 * `defaultValue` so server and client agree, then we hydrate from storage in
 * an effect.
 *
 * Returns `[value, setValue, isHydrated]`. `isHydrated` flips true after the
 * first read attempt completes — use it to gate "loading" UI if you need to
 * avoid rendering stale defaults.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): readonly [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Corrupt JSON or storage disabled — fall back to defaultValue.
    } finally {
      setIsHydrated(true);
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Quota exceeded or storage disabled — keep in-memory state only.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, isHydrated] as const;
}
