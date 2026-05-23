"use client";

import { useState, useRef, useCallback, ReactNode, useMemo } from "react";
import { motion, useDragControls, PanInfo, type Variants } from "framer-motion";

// Custom hook to create window animation variants with minimize support
function useWindowVariants(_isMinimizing: boolean, windowPosition: { x: number; y: number }): Variants {
  return useMemo(() => {
    // Calculate dock target position (bottom center of screen)
    const dockTargetX = typeof window !== "undefined" ? window.innerWidth / 2 - windowPosition.x : 0;
    const dockTargetY = typeof window !== "undefined" ? window.innerHeight - 60 - windowPosition.y : 0;

    return {
      hidden: {
        scale: 0.92,
        opacity: 0,
        y: 8,
      },
      visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        },
      },
      minimizing: {
        scale: 0.15,
        opacity: 0,
        x: dockTargetX,
        y: dockTargetY,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
      exit: {
        scale: 0.95,
        opacity: 0,
        y: 4,
        transition: {
          duration: 0.15,
          ease: [0.4, 0, 1, 1] as const,
        },
      },
    };
  }, [windowPosition.x, windowPosition.y]);
}

const mobileWindowVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};
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
  isMinimizing?: boolean;
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
  isMinimizing = false,
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


  // Get animation variants with minimize support
  const windowVariants = useWindowVariants(isMinimizing, position);

  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [snapZone, setSnapZone] = useState<"left" | "right" | "top" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (_: any, info: PanInfo) => {
    setIsDragging(true);
    const currentX = position.x + info.offset.x;
    const currentY = position.y + info.offset.y;

    // Detect snap zones (20px edge threshold)
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const edgeThreshold = 20;

    if (currentX <= edgeThreshold) {
      setSnapZone("left");
    } else if (currentX + size.width >= screenWidth - edgeThreshold) {
      setSnapZone("right");
    } else if (currentY <= 28 + edgeThreshold) { // 28 = menu bar height
      setSnapZone("top");
    } else {
      setSnapZone(null);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);

    // Apply snap if in a snap zone
    if (snapZone) {
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
      const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
      const menuBarHeight = 28;
      const dockHeight = 80;

      if (snapZone === "left") {
        setPreMaximizeState({ position, size });
        setPosition({ x: 0, y: menuBarHeight });
        setSize({ width: screenWidth / 2, height: screenHeight - menuBarHeight - dockHeight });
        setIsMaximized(true);
      } else if (snapZone === "right") {
        setPreMaximizeState({ position, size });
        setPosition({ x: screenWidth / 2, y: menuBarHeight });
        setSize({ width: screenWidth / 2, height: screenHeight - menuBarHeight - dockHeight });
        setIsMaximized(true);
      } else if (snapZone === "top") {
        setPreMaximizeState({ position, size });
        setPosition({ x: 0, y: menuBarHeight });
        setSize({ width: screenWidth, height: screenHeight - menuBarHeight - dockHeight });
        setIsMaximized(true);
      }
      setSnapZone(null);
    } else {
      setPosition({
        x: position.x + info.offset.x,
        y: position.y + info.offset.y,
      });
    }
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
        variants={mobileWindowVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
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
      className={"absolute rounded-xl overflow-hidden flex flex-col border transition-shadow duration-200 " +
        (isActive
          ? "border-white/20"
          : "border-white/10")}
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
        boxShadow: "0 35px 60px -15px rgba(0,0,0,0.6), 0 20px 40px -10px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.15)",
      }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={onFocus}
      variants={windowVariants}
      initial="hidden"
      animate={isMinimizing ? "minimizing" : "visible"}
      exit="exit"
    >
      {/* Title Bar */}
      <motion.div
        className="h-10 flex items-center px-3 gap-2 cursor-default select-none border-b border-black/20"
        animate={{
          background: isActive
            ? "linear-gradient(to bottom, #3d3d3f, #323234)"
            : "#2a2a2c",
        }}
        transition={{ duration: 0.15 }}
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
      </motion.div>

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

      {/* Snap Zone Preview */}
      {isDragging && snapZone && (
        <motion.div
          className="fixed pointer-events-none rounded-lg"
          style={{
            backgroundColor: "rgba(0, 122, 255, 0.2)",
            border: "2px solid rgba(0, 122, 255, 0.5)",
            ...(snapZone === "left" && {
              left: 0,
              top: 28,
              width: "50%",
              height: "calc(100% - 108px)",
            }),
            ...(snapZone === "right" && {
              right: 0,
              top: 28,
              width: "50%",
              height: "calc(100% - 108px)",
            }),
            ...(snapZone === "top" && {
              left: 0,
              top: 28,
              width: "100%",
              height: "calc(100% - 108px)",
            }),
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        />
      )}
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
    ne: "top-0 right-0 w-4 h-4 cursor-nesw-resize",
    nw: "top-0 left-0 w-4 h-4 cursor-nwse-resize",
    se: "bottom-0 right-0 w-4 h-4 cursor-nwse-resize",
    sw: "bottom-0 left-0 w-4 h-4 cursor-nesw-resize",
  };

  const isCorner = ["ne", "nw", "se", "sw"].includes(direction);

  return (
    <div
      className={"absolute transition-opacity " + positions[direction]}
      onMouseDown={(e) => onResize(e, direction)}
    >
      {/* Visual indicator for corner handles */}
      {isCorner && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div
            className={
              "w-2 h-2 rounded-full bg-white/20 backdrop-blur-sm " +
              (direction === "se" ? "absolute bottom-0.5 right-0.5" : "") +
              (direction === "sw" ? "absolute bottom-0.5 left-0.5" : "") +
              (direction === "ne" ? "absolute top-0.5 right-0.5" : "") +
              (direction === "nw" ? "absolute top-0.5 left-0.5" : "")
            }
          />
        </div>
      )}
    </div>
  );
}
