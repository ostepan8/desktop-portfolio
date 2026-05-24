"use client";

import { useCallback } from "react";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";
import type { ResizeDirection } from "./ResizeHandle";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface UseWindowResizeArgs {
  position: Position;
  size: Size;
  minWidth: number;
  minHeight: number;
  onChange: (next: { position: Position; size: Size }) => void;
  /** Reference flipped to true while a resize is in flight — used by the
   *  parent to suppress drag handlers on the title bar. */
  isResizingRef: RefObject<boolean>;
}

/**
 * Returns a `startResize` callback that wires a single direction handle (e.g.
 * "ne", "s") to mousemove tracking. Window position adjusts when resizing
 * from the north or west edges so the opposite corner stays put.
 */
export function useWindowResize({
  position,
  size,
  minWidth,
  minHeight,
  onChange,
  isResizingRef,
}: UseWindowResizeArgs) {
  return useCallback(
    (e: ReactMouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = size.width;
      const startHeight = size.height;
      const startPosX = position.x;
      const startPosY = position.y;

      const onMove = (ev: MouseEvent) => {
        const deltaX = ev.clientX - startX;
        const deltaY = ev.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startPosX;
        let newY = startPosY;

        if (direction.includes("e")) {
          newWidth = Math.max(minWidth, startWidth + deltaX);
        }
        if (direction.includes("w")) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth >= minWidth) {
            newWidth = possibleWidth;
            newX = startPosX + deltaX;
          }
        }
        if (direction.includes("s")) {
          newHeight = Math.max(minHeight, startHeight + deltaY);
        }
        if (direction.includes("n")) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight >= minHeight) {
            newHeight = possibleHeight;
            newY = startPosY + deltaY;
          }
        }

        onChange({
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight },
        });
      };

      const onEnd = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
    },
    [position, size, minWidth, minHeight, onChange, isResizingRef],
  );
}
