"use client";

import type { MouseEvent as ReactMouseEvent } from "react";

export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResize: (e: ReactMouseEvent, direction: ResizeDirection) => void;
}

/**
 * Edge or corner grab strip on a window. Edges are thin lines (1px h or w);
 * corners are 16x16 squares with a hover-revealed dot indicator.
 */
export function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const isCorner =
    direction === "ne" ||
    direction === "nw" ||
    direction === "se" ||
    direction === "sw";

  return (
    <div
      className={"absolute transition-opacity " + POSITION_CLASSES[direction]}
      onMouseDown={(e) => onResize(e, direction)}
    >
      {isCorner && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div
            className={
              "w-2 h-2 rounded-full bg-white/20 backdrop-blur-sm " +
              CORNER_DOT_POSITION[direction]
            }
          />
        </div>
      )}
    </div>
  );
}

const POSITION_CLASSES: Record<ResizeDirection, string> = {
  n: "top-0 left-2 right-2 h-1 cursor-ns-resize",
  s: "bottom-0 left-2 right-2 h-1 cursor-ns-resize",
  e: "right-0 top-2 bottom-2 w-1 cursor-ew-resize",
  w: "left-0 top-2 bottom-2 w-1 cursor-ew-resize",
  ne: "top-0 right-0 w-4 h-4 cursor-nesw-resize",
  nw: "top-0 left-0 w-4 h-4 cursor-nwse-resize",
  se: "bottom-0 right-0 w-4 h-4 cursor-nwse-resize",
  sw: "bottom-0 left-0 w-4 h-4 cursor-nesw-resize",
};

const CORNER_DOT_POSITION: Record<ResizeDirection, string> = {
  n: "",
  s: "",
  e: "",
  w: "",
  se: "absolute bottom-0.5 right-0.5",
  sw: "absolute bottom-0.5 left-0.5",
  ne: "absolute top-0.5 right-0.5",
  nw: "absolute top-0.5 left-0.5",
};
