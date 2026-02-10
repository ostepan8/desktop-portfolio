"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";

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
}

const GRID_SIZE = 90; // Size of each grid cell
const DEFAULT_HEIGHT = 800; // Default height for SSR

function calculateInitialPositions(icons: DesktopIconData[], height: number = DEFAULT_HEIGHT) {
  const positions: Record<string, { col: number; row: number }> = {};
  const maxRows = Math.max(1, Math.floor(height / GRID_SIZE) - 2);
  icons.forEach((icon, index) => {
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    positions[icon.id] = { col, row };
  });
  return positions;
}

export function DesktopIcons({ icons, onIconOpen }: DesktopIconsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [iconPositions, setIconPositions] = useState<Record<string, { col: number; row: number }>>(() =>
    calculateInitialPositions(icons)
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<Record<string, number>>({});

  // Recalculate positions on mount with actual window height
  useEffect(() => {
    setIconPositions(calculateInitialPositions(icons, window.innerHeight));
  }, [icons]);

  const handleClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const now = Date.now();
    const lastClick = lastClickTime.current[id] || 0;
    
    // Double-click detection (300ms threshold)
    if (now - lastClick < 300) {
      // Double click - open the icon
      onIconOpen?.(id);
      icons.find(i => i.id === id)?.onOpen?.();
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
  }, [icons, onIconOpen]);

  const handleDesktopClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const relX = rect.right - x - GRID_SIZE / 2;
    const relY = y - rect.top;
    
    const col = Math.max(0, Math.floor(relX / GRID_SIZE));
    const row = Math.max(0, Math.floor(relY / GRID_SIZE));
    
    setIconPositions((prev) => ({
      ...prev,
      [id]: { col, row },
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pt-8 pr-4 pb-20"
      onClick={handleDesktopClick}
    >
      {icons.map((icon) => {
        const pos = iconPositions[icon.id] || { col: 0, row: 0 };
        return (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            isSelected={selectedIds.has(icon.id)}
            position={pos}
            onClick={(e) => handleClick(icon.id, e)}
            onDragEnd={(x, y) => handleDragEnd(icon.id, x, y)}
          />
        );
      })}
    </div>
  );
}

interface DesktopIconProps {
  icon: DesktopIconData;
  isSelected: boolean;
  position: { col: number; row: number };
  onClick: (e: React.MouseEvent) => void;
  onDragEnd: (x: number, y: number) => void;
}

function DesktopIcon({ icon, isSelected, position, onClick, onDragEnd }: DesktopIconProps) {
  // Position from right side
  const x = -(position.col * GRID_SIZE) - GRID_SIZE / 2;
  const y = position.row * GRID_SIZE + GRID_SIZE / 2;

  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1 cursor-default select-none"
      style={{
        right: -x,
        top: y,
        width: GRID_SIZE,
      }}
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onDragEnd(info.point.x, info.point.y);
      }}
      onClick={onClick}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {/* Icon */}
      <div
        className={"w-16 h-16 flex items-center justify-center rounded-lg transition-colors " +
          (isSelected ? "bg-white/20" : "hover:bg-white/10")}
      >
        <span className="text-5xl drop-shadow-lg">{icon.icon}</span>
      </div>

      {/* Label */}
      <div
        className={"px-1 py-0.5 rounded text-center max-w-[80px] " +
          (isSelected ? "bg-[#0058d1] text-white" : "text-white drop-shadow-lg")}
      >
        <span className="text-xs font-medium line-clamp-2 break-all">
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
