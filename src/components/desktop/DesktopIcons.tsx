"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { FolderIcon, FileIcon, DriveIcon } from "@/components/icons";

export interface DesktopIconData {
  id: string;
  label: string;
  icon: string;
  type: "folder" | "file" | "app" | "drive";
  onOpen?: () => void;
}

interface DesktopIconsProps {
  icons: DesktopIconData[];
  gridCols?: number;
  gridRows?: number;
  onIconOpen?: (id: string) => void;
  onIconContextMenu?: (e: React.MouseEvent, icon: DesktopIconData) => void;
  onDesktopContextMenu?: (e: React.MouseEvent) => void;
}

const GRID_SIZE = 90; // Size of each grid cell
const DEFAULT_HEIGHT = 800; // Default height for SSR

interface IconPosition {
  x: number; // Position from right edge
  y: number; // Position from top
}

function calculateInitialPositions(icons: DesktopIconData[], height: number = DEFAULT_HEIGHT): Record<string, IconPosition> {
  const positions: Record<string, IconPosition> = {};
  const maxRows = Math.max(1, Math.floor((height - 100) / GRID_SIZE));
  icons.forEach((icon, index) => {
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    // Position from right edge and top
    positions[icon.id] = {
      x: col * GRID_SIZE + 20,
      y: row * GRID_SIZE + 40,
    };
  });
  return positions;
}

export function DesktopIcons({ icons, onIconOpen, onIconContextMenu, onDesktopContextMenu }: DesktopIconsProps) {
  const isMobile = useIsMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>(() =>
    calculateInitialPositions(icons)
  );

  // Selection rectangle state
  const [selectionRect, setSelectionRect] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const isSelecting = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<Record<string, number>>({});

  // Recalculate positions on mount with actual window height
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIconPositions(calculateInitialPositions(icons, window.innerHeight));
    }
  }, [icons]);

  const handleClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const now = Date.now();
    const lastClick = lastClickTime.current[id] || 0;

    // Double-click detection (300ms threshold) - on mobile, single tap opens
    if (isMobile || now - lastClick < 300) {
      // Double click or mobile tap - open the icon
      // Only call onIconOpen (not both) to prevent double window opening
      onIconOpen?.(id);
      lastClickTime.current[id] = 0;
      return;
    }

    lastClickTime.current[id] = now;

    // Single click - select
    if (e.shiftKey || e.metaKey) {
      // Multi-select
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      // Single select
      setSelectedIds(new Set([id]));
    }
  }, [onIconOpen, isMobile]);

  const handleDesktopClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDragEnd = useCallback((id: string, clientX: number, clientY: number) => {
    if (!containerRef.current || isMobile) return; // Disable drag on mobile

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate position from right edge and top
    const rightOffset = Math.max(20, rect.right - clientX - GRID_SIZE / 2);
    const topOffset = Math.max(40, clientY - rect.top - GRID_SIZE / 2);

    setIconPositions((prev) => ({
      ...prev,
      [id]: { x: rightOffset, y: topOffset },
    }));
  }, [isMobile]);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onDesktopContextMenu?.(e);
  }, [onDesktopContextMenu]);

  // Selection rectangle handlers
  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    // Only start selection on left click directly on the container
    if (e.button !== 0 || e.target !== e.currentTarget) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    isSelecting.current = true;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });

    // Clear selection unless shift is held
    if (!e.shiftKey) {
      setSelectedIds(new Set());
    }
  }, []);

  const handleSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting.current || !selectionRect || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionRect(prev => prev ? { ...prev, currentX: x, currentY: y } : null);

    // Calculate selection bounds
    const left = Math.min(selectionRect.startX, x);
    const right = Math.max(selectionRect.startX, x);
    const top = Math.min(selectionRect.startY, y);
    const bottom = Math.max(selectionRect.startY, y);

    // Find icons that intersect with the selection rectangle
    const newSelected = new Set<string>();
    icons.forEach((icon) => {
      const pos = iconPositions[icon.id];
      if (!pos) return;

      // Calculate icon bounds (positioned from right side)
      // Icon is at: right: pos.x, top: pos.y
      const iconLeft = rect.width - pos.x - GRID_SIZE;
      const iconRight = iconLeft + GRID_SIZE;
      const iconTop = pos.y;
      const iconBottom = iconTop + GRID_SIZE;

      // Check intersection
      if (
        iconLeft < right &&
        iconRight > left &&
        iconTop < bottom &&
        iconBottom > top
      ) {
        newSelected.add(icon.id);
      }
    });

    setSelectedIds(newSelected);
  }, [selectionRect, icons, iconPositions]);

  const handleSelectionEnd = useCallback(() => {
    isSelecting.current = false;
    setSelectionRect(null);
  }, []);

  // Add global mouse up listener for selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting.current) {
        handleSelectionEnd();
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [handleSelectionEnd]);

  // Keyboard navigation for desktop icons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const iconList = icons.map(i => i.id);
      const currentIndex = focusedId ? iconList.indexOf(focusedId) : -1;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < iconList.length - 1 ? currentIndex + 1 : 0;
        const nextId = iconList[nextIndex];
        setFocusedId(nextId);
        if (!e.shiftKey) {
          setSelectedIds(new Set([nextId]));
        } else {
          setSelectedIds(prev => new Set([...prev, nextId]));
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : iconList.length - 1;
        const prevId = iconList[prevIndex];
        setFocusedId(prevId);
        if (!e.shiftKey) {
          setSelectedIds(new Set([prevId]));
        } else {
          setSelectedIds(prev => new Set([...prev, prevId]));
        }
      } else if (e.key === "Enter" && focusedId) {
        e.preventDefault();
        onIconOpen?.(focusedId);
      } else if (e.key === "Escape") {
        setSelectedIds(new Set());
        setFocusedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedId, icons, onIconOpen]);

  // Mobile: Horizontal scrollable grid at top
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pt-8 pb-20"
        onClick={handleDesktopClick}
      >
        <div className="px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {icons.map((icon) => (
              <MobileDesktopIcon
                key={icon.id}
                icon={icon}
                onClick={(e) => handleClick(icon.id, e)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Full draggable grid
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pt-8 pr-4 pb-20"
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      onMouseDown={handleSelectionStart}
      onMouseMove={handleSelectionMove}
      onMouseUp={handleSelectionEnd}
    >
      {icons.map((icon) => {
        const pos = iconPositions[icon.id] || { x: 20, y: 40 };
        return (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            isSelected={selectedIds.has(icon.id)}
            isFocused={focusedId === icon.id}
            position={pos}
            onClick={(e) => handleClick(icon.id, e)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Select the icon if not already selected
              if (!selectedIds.has(icon.id)) {
                setSelectedIds(new Set([icon.id]));
              }
              onIconContextMenu?.(e, icon);
            }}
            onDragEnd={(x, y) => handleDragEnd(icon.id, x, y)}
          />
        );
      })}

      {/* Selection Rectangle */}
      {selectionRect && (
        <div
          className="absolute pointer-events-none border border-white/40 bg-white/10 rounded-sm"
          style={{
            left: Math.min(selectionRect.startX, selectionRect.currentX),
            top: Math.min(selectionRect.startY, selectionRect.currentY),
            width: Math.abs(selectionRect.currentX - selectionRect.startX),
            height: Math.abs(selectionRect.currentY - selectionRect.startY),
          }}
        />
      )}
    </div>
  );
}

interface MobileDesktopIconProps {
  icon: DesktopIconData;
  onClick: (e: React.MouseEvent) => void;
}

function MobileDesktopIcon({ icon, onClick }: MobileDesktopIconProps) {
  const IconComponent = icon.type === "drive" ? DriveIcon : icon.type === "folder" ? FolderIcon : FileIcon;

  return (
    <motion.div
      className="flex flex-col items-center gap-1 flex-shrink-0"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className="w-14 h-14 flex items-center justify-center">
        <IconComponent size={56} />
      </div>
      <span className="text-[10px] text-white/80 font-medium text-center w-16 truncate">
        {icon.label}
      </span>
    </motion.div>
  );
}

interface DesktopIconProps {
  icon: DesktopIconData;
  isSelected: boolean;
  isFocused: boolean;
  position: IconPosition;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragEnd: (x: number, y: number) => void;
}

function DesktopIcon({ icon, isSelected, isFocused, position, onClick, onContextMenu, onDragEnd }: DesktopIconProps) {
  const IconComponent = icon.type === "drive" ? DriveIcon : icon.type === "folder" ? FolderIcon : FileIcon;
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1.5 cursor-default select-none group"
      style={{
        right: position.x - dragOffset.x,
        top: position.y + dragOffset.y,
        width: GRID_SIZE,
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDrag={(_, info) => {
        setDragOffset({ x: info.offset.x, y: info.offset.y });
      }}
      onDragEnd={(_, info) => {
        setDragOffset({ x: 0, y: 0 });
        onDragEnd(info.point.x, info.point.y);
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {/* Icon */}
      <div
        className={"w-[72px] h-[72px] flex items-center justify-center rounded-xl transition-all duration-150 " +
          (isSelected
            ? "bg-white/25 ring-2 ring-white/30"
            : isFocused
            ? "bg-white/15 ring-2 ring-blue-400/50"
            : "group-hover:bg-white/10")}
      >
        <IconComponent size={64} />
      </div>

      {/* Label */}
      <div
        className={"px-1.5 py-[3px] rounded-md text-center max-w-[84px] transition-colors " +
          (isSelected
            ? "bg-[#0058d1]"
            : "bg-transparent")}
      >
        <span
          className={
            "text-[11px] font-medium leading-tight line-clamp-2 break-words " +
            (isSelected
              ? "text-white"
              : "text-white")
          }
          style={{
            textShadow: isSelected
              ? "none"
              : "0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)",
          }}
        >
          {icon.label}
        </span>
      </div>
    </motion.div>
  );
}

// Default desktop icons
export const DEFAULT_DESKTOP_ICONS: DesktopIconData[] = [
  { id: "macintosh-hd", label: "Macintosh HD", icon: "💻", type: "drive" },
  { id: "documents", label: "Documents", icon: "📁", type: "folder" },
  { id: "projects", label: "Projects", icon: "📂", type: "folder" },
  { id: "readme", label: "README.txt", icon: "📄", type: "file" },
];
