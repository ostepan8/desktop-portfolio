"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { ResizeDirection } from "@/lib/window-geometry";

export type { ResizeDirection };

export const RESIZE_DIRECTIONS: readonly ResizeDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResize: (event: ReactPointerEvent, direction: ResizeDirection) => void;
}

/**
 * Edge or corner grab strip on a window.
 *
 * Edges are 5px and corners are 14px — the previous 1px strips were nearly
 * impossible to hit, which is what made resizing feel like a fight. Edge
 * strips stop short of the corners so the corner handles always win.
 */
export function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  return (
    <div
      className={"absolute touch-none " + POSITION_CLASSES[direction]}
      onPointerDown={(event) => onResize(event, direction)}
    />
  );
}

const POSITION_CLASSES: Record<ResizeDirection, string> = {
  n: "top-0 left-3.5 right-3.5 h-[5px] cursor-ns-resize",
  s: "bottom-0 left-3.5 right-3.5 h-[5px] cursor-ns-resize",
  e: "right-0 top-3.5 bottom-3.5 w-[5px] cursor-ew-resize",
  w: "left-0 top-3.5 bottom-3.5 w-[5px] cursor-ew-resize",
  ne: "top-0 right-0 w-3.5 h-3.5 cursor-nesw-resize",
  nw: "top-0 left-0 w-3.5 h-3.5 cursor-nwse-resize",
  se: "bottom-0 right-0 w-3.5 h-3.5 cursor-nwse-resize",
  sw: "bottom-0 left-0 w-3.5 h-3.5 cursor-nesw-resize",
};
