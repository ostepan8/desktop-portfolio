"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useDragControls, PanInfo } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { AppIcon } from "@/components/icons";

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
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
}

export function Window({
  id,
  appId,
  title,
  icon,
  children,
  initialX = 100,
  initialY = 100,
  initialWidth = 600,
  initialHeight = 400,
  minWidth = 300,
  minHeight = 200,
  isActive = true,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
}: WindowProps) {
  // Suppress unused variable warnings - these are part of the interface
  void id;
  void icon;
  const isMobile = useIsMobile();
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({ position, size });

  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setPosition({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
      setIsMaximized(false);
    } else {
      setPreMaximizeState({ position, size });
      setPosition({ x: 0, y: 28 }); // Below menu bar
      setSize({ width: window.innerWidth, height: window.innerHeight - 28 - 80 });
      setIsMaximized(true);
    }
    onMaximize?.();
  };

  const startResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = true;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = size.width;
      const startHeight = size.height;
      const startPosX = position.x;
      const startPosY = position.y;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

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

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [size, position, minWidth, minHeight]
  );

  // Mobile: Fullscreen window
  if (isMobile) {
    return (
      <motion.div
        ref={windowRef}
        className="fixed inset-0 top-7 bottom-16 flex flex-col bg-[#1e1e1e] z-40"
        onTouchStart={onFocus}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mobile Title Bar */}
        <div className="h-12 flex items-center justify-between px-4 bg-[#2a2a2c] border-b border-white/10">
          <button
            onClick={onClose}
            className="text-[#0a84ff] text-sm font-medium active:opacity-50"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {appId && <AppIcon appId={appId} size={20} />}
            <span className="text-white/90 font-medium text-sm truncate max-w-[180px]">
              {title}
            </span>
          </div>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </motion.div>
    );
  }

  // Desktop: Regular draggable window
  return (
    <motion.div
      ref={windowRef}
      className={"absolute rounded-xl overflow-hidden flex flex-col border " +
        (isActive
          ? "border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_12px_24px_-8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset]"
          : "border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]")}
      style={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onMouseDown={onFocus}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Title Bar */}
      <div
        className={"h-10 flex items-center px-3 gap-2 cursor-default select-none border-b border-black/20 " +
          (isActive
            ? "bg-gradient-to-b from-[#3d3d3f] to-[#323234]"
            : "bg-[#2a2a2c]")}
        onPointerDown={(e) => {
          if (!isResizing.current) {
            dragControls.start(e);
          }
        }}
        onDoubleClick={handleMaximize}
      >
        {/* Traffic Lights */}
        <div className="flex items-center gap-[7px] group/traffic">
          <TrafficLight color="close" onClick={onClose} isActive={isActive} />
          <TrafficLight color="minimize" onClick={onMinimize} isActive={isActive} />
          <TrafficLight color="maximize" onClick={handleMaximize} isActive={isActive} />
        </div>

        {/* Title */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {appId && <AppIcon appId={appId} size={16} />}
          <span className={"text-[13px] font-medium " + (isActive ? "text-white/90" : "text-white/40")}>
            {title}
          </span>
        </div>

        {/* Spacer for centering */}
        <div className="w-[54px]" />
      </div>

      {/* Content */}
      <div className={"flex-1 overflow-auto " + (isActive ? "bg-[#1e1e1e]" : "bg-[#252525]")}>
        {children}
      </div>

      {/* Resize Handles */}
      <ResizeHandle direction="n" onResize={startResize} />
      <ResizeHandle direction="s" onResize={startResize} />
      <ResizeHandle direction="e" onResize={startResize} />
      <ResizeHandle direction="w" onResize={startResize} />
      <ResizeHandle direction="ne" onResize={startResize} />
      <ResizeHandle direction="nw" onResize={startResize} />
      <ResizeHandle direction="se" onResize={startResize} />
      <ResizeHandle direction="sw" onResize={startResize} />
    </motion.div>
  );
}

interface TrafficLightProps {
  color: "close" | "minimize" | "maximize";
  onClick?: () => void;
  isActive: boolean;
}

function TrafficLight({ color, onClick, isActive }: TrafficLightProps) {
  const baseColors = {
    close: { bg: "#ff5f57", border: "#e0443e" },
    minimize: { bg: "#febc2e", border: "#dea123" },
    maximize: { bg: "#28c840", border: "#1aab29" },
  };

  const icons = {
    close: (
      <svg className="w-[6px] h-[6px]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
      </svg>
    ),
    minimize: (
      <svg className="w-[8px] h-[8px]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M2 6h8" />
      </svg>
    ),
    maximize: (
      <svg className="w-[6px] h-[6px]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 1h4v4H1zM7 7h4v4H7z" />
      </svg>
    ),
  };

  const { bg, border } = baseColors[color];

  return (
    <button
      className="w-3 h-3 rounded-full flex items-center justify-center transition-all relative"
      style={{
        backgroundColor: isActive ? bg : "#4a4a4a",
        boxShadow: isActive
          ? `inset 0 0 0 0.5px ${border}, inset 0 -1px 1px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 0 0 0.5px #3a3a3a",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <span className="opacity-0 group-hover/traffic:opacity-100 text-black/80 transition-opacity">
        {icons[color]}
      </span>
    </button>
  );
}

interface ResizeHandleProps {
  direction: string;
  onResize: (e: React.MouseEvent, direction: string) => void;
}

function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const positions: Record<string, string> = {
    n: "top-0 left-2 right-2 h-1 cursor-ns-resize",
    s: "bottom-0 left-2 right-2 h-1 cursor-ns-resize",
    e: "right-0 top-2 bottom-2 w-1 cursor-ew-resize",
    w: "left-0 top-2 bottom-2 w-1 cursor-ew-resize",
    ne: "top-0 right-0 w-3 h-3 cursor-nesw-resize",
    nw: "top-0 left-0 w-3 h-3 cursor-nwse-resize",
    se: "bottom-0 right-0 w-3 h-3 cursor-nwse-resize",
    sw: "bottom-0 left-0 w-3 h-3 cursor-nesw-resize",
  };

  return (
    <div
      className={"absolute " + positions[direction]}
      onMouseDown={(e) => onResize(e, direction)}
    />
  );
}
