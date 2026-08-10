"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useViewport, useWorkArea } from "@/hooks/useViewport";
import { AppIcon } from "@/components/icons";
import { WINDOW_DEFAULTS } from "@/constants/layout";
import type { Rect, SnapZone } from "@/lib/window-geometry";
import { TrafficLights } from "./TrafficLights";
import { ResizeHandle, RESIZE_DIRECTIONS } from "./ResizeHandle";
import { SnapPreview } from "./SnapPreview";
import { useWindowGeometry } from "./useWindowGeometry";
import { useWindowDrag } from "./useWindowDrag";
import { useWindowResize } from "./useWindowResize";
import {
  mobileWindowVariants,
  windowVariants,
  type MinimizeTarget,
} from "./window-variants";

export interface WindowProps {
  id: string;
  appId?: string;
  title: string;
  icon?: string;
  children: ReactNode;
  /** Placement chosen by the window manager when the window was opened. */
  initialRect: Rect;
  minWidth?: number;
  minHeight?: number;
  isActive?: boolean;
  isMinimizing?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
}

export function Window({
  appId,
  title,
  children,
  initialRect,
  minWidth = WINDOW_DEFAULTS.MIN_WIDTH,
  minHeight = WINDOW_DEFAULTS.MIN_HEIGHT,
  isActive = true,
  isMinimizing = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: WindowProps) {
  const isMobile = useIsMobile();
  const viewport = useViewport();
  const workArea = useWorkArea();
  const windowRef = useRef<HTMLDivElement>(null);
  const [snapZone, setSnapZone] = useState<SnapZone | null>(null);

  const min = useMemo(
    () => ({ width: minWidth, height: minHeight }),
    [minWidth, minHeight],
  );

  const {
    rect,
    mode,
    isTransitioning,
    restoreRect,
    liveRect,
    previewRect,
    applyMode,
    commitFloating,
    toggleMaximize,
  } = useWindowGeometry({ initialRect, min, workArea, elementRef: windowRef });

  const floatingSize = useMemo(
    () => ({ width: restoreRect.width, height: restoreRect.height }),
    [restoreRect.width, restoreRect.height],
  );

  const startDrag = useWindowDrag({
    liveRect,
    mode,
    floatingSize,
    workArea,
    viewport,
    onPreview: previewRect,
    onCommit: commitFloating,
    onSnap: applyMode,
    onSnapZoneChange: setSnapZone,
  });

  const startResize = useWindowResize({
    liveRect,
    min,
    workArea,
    onPreview: previewRect,
    onCommit: commitFloating,
  });

  const handleMaximize = useCallback(() => {
    toggleMaximize();
    onMaximize?.();
  }, [toggleMaximize, onMaximize]);

  // Translation from the window's own origin to the dock, for the genie-ish
  // minimize. Computed at render (cheap) and only read when the variant runs.
  const minimizeTarget = useMemo<MinimizeTarget>(
    () => ({
      x: viewport.width / 2 - (rect.x + rect.width / 2),
      y: viewport.height - 60 - (rect.y + rect.height / 2),
    }),
    [viewport, rect],
  );

  if (isMobile) {
    return (
      <motion.div
        ref={windowRef}
        className="fixed inset-0 top-7 bottom-16 flex flex-col bg-[var(--macos-bg)] z-40"
        onTouchStart={onFocus}
        variants={mobileWindowVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="h-12 flex items-center justify-between px-4 bg-[#2a2a2c] border-b border-white/10">
          <button
            onClick={onClose}
            className="text-[var(--macos-accent-bright)] text-sm font-medium active:opacity-50"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {appId && <AppIcon appId={appId} size={20} />}
            <span className="text-white/90 font-medium text-sm truncate max-w-[180px]">
              {title}
            </span>
          </div>
          <div className="w-12" />
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        ref={windowRef}
        className={
          "absolute rounded-xl overflow-hidden flex flex-col border " +
          // Geometry only animates for maximize/snap/restore. During a drag or
          // resize a transition would make the window lag behind the cursor.
          (isTransitioning
            ? "transition-[left,top,width,height,box-shadow] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)] "
            : "transition-shadow duration-200 ") +
          (isActive ? "border-white/20" : "border-white/10")
        }
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          boxShadow: isActive
            ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 12px 24px -8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)"
            : "0 10px 30px -10px rgba(0,0,0,0.3)",
        }}
        onPointerDown={onFocus}
        variants={windowVariants}
        custom={minimizeTarget}
        initial="hidden"
        animate={isMinimizing ? "minimizing" : "visible"}
        exit="exit"
      >
        <motion.div
          className="h-10 flex items-center px-3 gap-2 cursor-default select-none touch-none border-b border-black/20"
          animate={{
            background: isActive
              ? "linear-gradient(to bottom, #3d3d3f, #323234)"
              : "#2a2a2c",
          }}
          transition={{ duration: 0.15 }}
          onPointerDown={startDrag}
          onDoubleClick={handleMaximize}
        >
          <TrafficLights
            isActive={isActive}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={handleMaximize}
          />

          <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
            {appId && <AppIcon appId={appId} size={16} />}
            <span
              className={
                "text-[13px] font-medium truncate " +
                (isActive ? "text-white/90" : "text-white/40")
              }
            >
              {title}
            </span>
          </div>

          {/* Spacer keeps the title visually centered against the traffic lights. */}
          <div className="w-[54px] shrink-0" />
        </motion.div>

        <div
          className={
            "flex-1 overflow-auto " +
            (isActive ? "bg-[var(--macos-bg)]" : "bg-[var(--macos-bg-2)]")
          }
        >
          {children}
        </div>

        {RESIZE_DIRECTIONS.map((direction) => (
          <ResizeHandle
            key={direction}
            direction={direction}
            onResize={startResize}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {snapZone && (
          <SnapPreview key="snap" zone={snapZone} workArea={workArea} />
        )}
      </AnimatePresence>
    </>
  );
}
