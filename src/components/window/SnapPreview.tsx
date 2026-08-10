"use client";

import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Z_INDEX } from "@/constants/layout";
import { snapRect, type Rect, type SnapZone } from "@/lib/window-geometry";

interface SnapPreviewProps {
  zone: SnapZone;
  workArea: Rect;
}

/**
 * Ghost outline of where a dragged window will land.
 *
 * Rendered into `document.body` rather than inside the window: the window
 * clips its own overflow and carries a transform, which used to clip this
 * preview to the window's own bounds and offset it.
 */
export function SnapPreview({ zone, workArea }: SnapPreviewProps) {
  // Only ever rendered mid-drag, so the document is always available — but
  // stay defensive so the tree can still be rendered on the server.
  if (typeof document === "undefined") return null;

  const target = snapRect(zone, workArea);

  return createPortal(
    <motion.div
      className="fixed pointer-events-none rounded-lg border-2"
      style={{
        left: target.x,
        top: target.y,
        width: target.width,
        height: target.height,
        zIndex: Z_INDEX.dock - 1,
        backgroundColor: "rgba(0, 122, 255, 0.18)",
        borderColor: "rgba(0, 122, 255, 0.55)",
        backdropFilter: "blur(2px)",
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    />,
    document.body,
  );
}
