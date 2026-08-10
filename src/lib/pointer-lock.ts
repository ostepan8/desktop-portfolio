/**
 * Holds the cursor and suppresses text selection for the duration of a
 * window drag or resize. Without this the cursor flickers back to an arrow
 * whenever the pointer outruns the handle, and dragging paints a blue text
 * selection across the desktop.
 */
export function lockPointer(cursor?: string): () => void {
  if (typeof document === "undefined") return () => {};

  const { style } = document.body;
  const previousCursor = style.cursor;
  const previousUserSelect = style.userSelect;

  if (cursor) style.cursor = cursor;
  style.userSelect = "none";

  let released = false;
  return () => {
    if (released) return;
    released = true;
    style.cursor = previousCursor;
    style.userSelect = previousUserSelect;
  };
}

/** CSS cursor for each resize handle direction. */
export const RESIZE_CURSORS = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
} as const;
