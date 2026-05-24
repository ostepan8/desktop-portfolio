"use client";

import { useCallback, useRef, useState, type RefObject } from "react";

export interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface BoundedItem {
  id: string;
  /** Bounds in container-local coordinates. */
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface UseSelectionRectArgs {
  containerRef: RefObject<HTMLElement | null>;
  /** Selectable items. Re-evaluated on every move; keep the list short. */
  items: BoundedItem[];
  onSelect: (ids: Set<string>) => void;
  /** Optional gate — return false to skip a particular pointerdown
   *  (e.g. right-click, or click on a non-empty area). */
  shouldStart?: (e: React.MouseEvent) => boolean;
}

/**
 * Click-and-drag selection rectangle for icon grids. Encapsulates the
 * mousedown/move/up dance with hit-testing against `items`. The result is
 * the live selection set plus the rectangle to render.
 */
export function useSelectionRect({
  containerRef,
  items,
  onSelect,
  shouldStart,
}: UseSelectionRectArgs) {
  const [rect, setRect] = useState<SelectionRect | null>(null);
  const isSelecting = useRef(false);

  const intersectAndCommit = useCallback(
    (startX: number, startY: number, x: number, y: number) => {
      const left = Math.min(startX, x);
      const right = Math.max(startX, x);
      const top = Math.min(startY, y);
      const bottom = Math.max(startY, y);

      const selected = new Set<string>();
      for (const item of items) {
        if (
          item.left < right &&
          item.right > left &&
          item.top < bottom &&
          item.bottom > top
        ) {
          selected.add(item.id);
        }
      }
      onSelect(selected);
    },
    [items, onSelect],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (shouldStart && !shouldStart(e)) return;
      if (e.target !== e.currentTarget) return;

      const container = containerRef.current;
      if (!container) return;
      const bounds = container.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      isSelecting.current = true;
      setRect({ startX: x, startY: y, currentX: x, currentY: y });
      if (!e.shiftKey) onSelect(new Set());
    },
    [containerRef, onSelect, shouldStart],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const container = containerRef.current;
      if (!isSelecting.current || !rect || !container) return;
      const bounds = container.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      setRect((prev) =>
        prev ? { ...prev, currentX: x, currentY: y } : null,
      );
      intersectAndCommit(rect.startX, rect.startY, x, y);
    },
    [rect, containerRef, intersectAndCommit],
  );

  const onMouseUp = useCallback(() => {
    isSelecting.current = false;
    setRect(null);
  }, []);

  return { rect, onMouseDown, onMouseMove, onMouseUp };
}
