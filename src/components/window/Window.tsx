"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useDragControls, type PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AppIcon } from "@/components/icons";
import { DOCK_HEIGHT, MENU_BAR_HEIGHT } from "@/constants/layout";
import { TrafficLights } from "./TrafficLights";
import { ResizeHandle, type ResizeDirection } from "./ResizeHandle";
import { useWindowResize } from "./useWindowResize";
import { useWindowSnap, type SnapZone } from "./useWindowSnap";
import { buildWindowVariants, mobileWindowVariants } from "./window-variants";

const RESIZE_DIRECTIONS: readonly ResizeDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];

export interface WindowProps {
  id: string;
  appId?: string;
  title: string;
  icon?: string;
  children: ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
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
  initialX = 100,
  initialY = 100,
  initialWidth = 600,
  initialHeight = 400,
  minWidth = 300,
  minHeight = 200,
  isActive = true,
  isMinimizing = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: WindowProps) {
  const isMobile = useIsMobile();
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({ position, size });
  const [isDragging, setIsDragging] = useState(false);

  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Snap-to-edge while dragging. The hook surfaces the active zone so we can
  // render the preview overlay; commit happens on drag end.
  const { snapZone, updateSnap, commitSnap } = useWindowSnap({
    position,
    size,
    onSnap: ({ position: nextPos, size: nextSize, previous }) => {
      const snapped = nextPos.x !== previous.position.x + 0 || nextSize.width !== previous.size.width;
      if (snapped) {
        setPreMaximizeState(previous);
        setIsMaximized(true);
      }
      setPosition(nextPos);
      setSize(nextSize);
    },
  });

  const handleResize = useWindowResize({
    position,
    size,
    minWidth,
    minHeight,
    onChange: ({ position: nextPos, size: nextSize }) => {
      setPosition(nextPos);
      setSize(nextSize);
    },
    isResizingRef,
  });

  const handleDrag = (_: unknown, info: PanInfo) => {
    setIsDragging(true);
    updateSnap(info.offset.x, info.offset.y);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false);
    commitSnap(info.offset.x, info.offset.y);
  };

  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
      setIsMaximized(false);
    } else {
      setPreMaximizeState({ position, size });
      setPosition({ x: 0, y: MENU_BAR_HEIGHT });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - MENU_BAR_HEIGHT - DOCK_HEIGHT,
      });
      setIsMaximized(true);
    }
    onMaximize?.();
  }, [isMaximized, preMaximizeState, position, size, onMaximize]);

  const windowVariants = useMemo(() => buildWindowVariants(position), [position]);

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
    <motion.div
      ref={windowRef}
      className={
        "absolute rounded-xl overflow-hidden flex flex-col border transition-shadow duration-200 " +
        (isActive ? "border-white/20" : "border-white/10")
      }
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        boxShadow: isActive
          ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 12px 24px -8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)"
          : "0 10px 30px -10px rgba(0,0,0,0.3)",
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      whileDrag={{
        scale: 1.01,
        boxShadow:
          "0 35px 60px -15px rgba(0,0,0,0.6), 0 20px 40px -10px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.15)",
      }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={onFocus}
      variants={windowVariants}
      initial="hidden"
      animate={isMinimizing ? "minimizing" : "visible"}
      exit="exit"
    >
      <motion.div
        className="h-10 flex items-center px-3 gap-2 cursor-default select-none border-b border-black/20"
        animate={{
          background: isActive
            ? "linear-gradient(to bottom, #3d3d3f, #323234)"
            : "#2a2a2c",
        }}
        transition={{ duration: 0.15 }}
        onPointerDown={(e) => {
          // Don't start a window drag if the user is resizing — the resize
          // handle sits inside the window bounds, so dragControls.start would
          // hijack the gesture.
          if (!isResizingRef.current) dragControls.start(e);
        }}
        onDoubleClick={handleMaximize}
      >
        <TrafficLights
          isActive={isActive}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={handleMaximize}
        />

        <div className="flex-1 flex items-center justify-center gap-2">
          {appId && <AppIcon appId={appId} size={16} />}
          <span
            className={
              "text-[13px] font-medium " +
              (isActive ? "text-white/90" : "text-white/40")
            }
          >
            {title}
          </span>
        </div>

        {/* Spacer keeps the title visually centered against the traffic lights. */}
        <div className="w-[54px]" />
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
        <ResizeHandle key={direction} direction={direction} onResize={handleResize} />
      ))}

      {isDragging && snapZone && <SnapPreview zone={snapZone} />}
    </motion.div>
  );
}

function SnapPreview({ zone }: { zone: SnapZone }) {
  if (!zone) return null;

  const accent = "rgba(0, 122, 255, 0.2)";
  const border = "2px solid rgba(0, 122, 255, 0.5)";
  const verticalStyle = {
    top: MENU_BAR_HEIGHT,
    height: `calc(100% - ${MENU_BAR_HEIGHT + DOCK_HEIGHT}px)`,
  };

  const style: React.CSSProperties =
    zone === "left"
      ? { left: 0, width: "50%", ...verticalStyle }
      : zone === "right"
        ? { right: 0, width: "50%", ...verticalStyle }
        : { left: 0, width: "100%", ...verticalStyle };

  return (
    <motion.div
      className="fixed pointer-events-none rounded-lg"
      style={{ backgroundColor: accent, border, ...style }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  );
}
