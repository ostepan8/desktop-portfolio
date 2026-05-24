"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useDoubleClick } from "@/hooks/useDoubleClick";
import { useKeyDown } from "@/hooks/useKeyDown";
import { useSelectionRect, type BoundedItem } from "@/hooks/useSelectionRect";
import { GRID_SIZE } from "@/constants/layout";
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
  onIconOpen?: (id: string) => void;
  onIconContextMenu?: (e: React.MouseEvent, icon: DesktopIconData) => void;
  onDesktopContextMenu?: (e: React.MouseEvent) => void;
}

const DEFAULT_HEIGHT = 800;

interface IconPosition {
  /** Distance from the right edge of the container. */
  x: number;
  /** Distance from the top of the container. */
  y: number;
}

function calculateInitialPositions(
  icons: DesktopIconData[],
  height: number = DEFAULT_HEIGHT,
): Record<string, IconPosition> {
  const positions: Record<string, IconPosition> = {};
  const maxRows = Math.max(1, Math.floor((height - 100) / GRID_SIZE));
  icons.forEach((icon, index) => {
    const col = Math.floor(index / maxRows);
    const row = index % maxRows;
    positions[icon.id] = {
      x: col * GRID_SIZE + 20,
      y: row * GRID_SIZE + 40,
    };
  });
  return positions;
}

export function DesktopIcons({
  icons,
  onIconOpen,
  onIconContextMenu,
  onDesktopContextMenu,
}: DesktopIconsProps) {
  const isMobile = useIsMobile();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>(
    () => calculateInitialPositions(icons),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Recalculate icon positions once we know the real window height (avoids
  // initial SSR layout flash where they'd stack against the default 800px).
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIconPositions(calculateInitialPositions(icons, window.innerHeight));
    }
  }, [icons]);

  // Build BoundedItems for hit-testing against the selection rectangle. Icons
  // are positioned from the right edge, so left = container.width - pos.x - GRID.
  const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
  const boundedItems: BoundedItem[] = useMemo(
    () =>
      icons.map((icon) => {
        const pos = iconPositions[icon.id] ?? { x: 20, y: 40 };
        const left = containerWidth - pos.x - GRID_SIZE;
        return {
          id: icon.id,
          left,
          right: left + GRID_SIZE,
          top: pos.y,
          bottom: pos.y + GRID_SIZE,
        };
      }),
    [icons, iconPositions, containerWidth],
  );

  const selection = useSelectionRect({
    containerRef,
    items: boundedItems,
    onSelect: setSelectedIds,
  });

  // Double-click opens; single click selects. On mobile, a single tap opens
  // directly (no second click to wait for).
  const handleDoubleClick = useCallback(
    (id: string) => onIconOpen?.(id),
    [onIconOpen],
  );
  const triggerDoubleClick = useDoubleClick(handleDoubleClick);

  const handleClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isMobile) {
        onIconOpen?.(id);
        return;
      }
      triggerDoubleClick(id);

      // Multi-select with shift/cmd; otherwise replace selection.
      if (e.shiftKey || e.metaKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        setSelectedIds(new Set([id]));
      }
    },
    [isMobile, onIconOpen, triggerDoubleClick],
  );

  const handleDesktopClick = useCallback(() => setSelectedIds(new Set()), []);

  const handleDragEnd = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container || isMobile) return;
      const rect = container.getBoundingClientRect();
      // Convert client coordinates → right-anchored position.
      const rightOffset = Math.max(20, rect.right - clientX - GRID_SIZE / 2);
      const topOffset = Math.max(40, clientY - rect.top - GRID_SIZE / 2);
      setIconPositions((prev) => ({ ...prev, [id]: { x: rightOffset, y: topOffset } }));
    },
    [isMobile],
  );

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDesktopContextMenu?.(e);
    },
    [onDesktopContextMenu],
  );

  // Arrow-key navigation between icons, Enter to open, Esc to clear.
  useKeyDown(
    ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Enter", "Escape"],
    useCallback(
      (e: KeyboardEvent) => {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }

        const iconList = icons.map((i) => i.id);
        const currentIndex = focusedId ? iconList.indexOf(focusedId) : -1;

        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = currentIndex < iconList.length - 1 ? currentIndex + 1 : 0;
          const nextId = iconList[nextIndex];
          setFocusedId(nextId);
          setSelectedIds((prev) =>
            e.shiftKey ? new Set([...prev, nextId]) : new Set([nextId]),
          );
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : iconList.length - 1;
          const prevId = iconList[prevIndex];
          setFocusedId(prevId);
          setSelectedIds((prev) =>
            e.shiftKey ? new Set([...prev, prevId]) : new Set([prevId]),
          );
        } else if (e.key === "Enter" && focusedId) {
          e.preventDefault();
          onIconOpen?.(focusedId);
        } else if (e.key === "Escape") {
          setSelectedIds(new Set());
          setFocusedId(null);
        }
      },
      [focusedId, icons, onIconOpen],
    ),
  );

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

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pt-8 pr-4 pb-20"
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      onMouseDown={selection.onMouseDown}
      onMouseMove={selection.onMouseMove}
      onMouseUp={selection.onMouseUp}
    >
      {icons.map((icon) => {
        const pos = iconPositions[icon.id] ?? { x: 20, y: 40 };
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
              if (!selectedIds.has(icon.id)) setSelectedIds(new Set([icon.id]));
              onIconContextMenu?.(e, icon);
            }}
            onDragEnd={(x, y) => handleDragEnd(icon.id, x, y)}
          />
        );
      })}

      {selection.rect && (
        <div
          className="absolute pointer-events-none border border-white/40 bg-white/10 rounded-sm"
          style={{
            left: Math.min(selection.rect.startX, selection.rect.currentX),
            top: Math.min(selection.rect.startY, selection.rect.currentY),
            width: Math.abs(selection.rect.currentX - selection.rect.startX),
            height: Math.abs(selection.rect.currentY - selection.rect.startY),
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
  const IconComponent = pickIconComponent(icon.type);

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

function DesktopIcon({
  icon,
  isSelected,
  isFocused,
  position,
  onClick,
  onContextMenu,
  onDragEnd,
}: DesktopIconProps) {
  const IconComponent = pickIconComponent(icon.type);
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
      onDrag={(_, info) => setDragOffset({ x: info.offset.x, y: info.offset.y })}
      onDragEnd={(_, info) => {
        setDragOffset({ x: 0, y: 0 });
        onDragEnd(info.point.x, info.point.y);
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div
        className={
          "w-[72px] h-[72px] flex items-center justify-center rounded-xl transition-all duration-150 " +
          (isSelected
            ? "bg-white/25 ring-2 ring-white/30"
            : isFocused
              ? "bg-white/15 ring-2 ring-blue-400/50"
              : "group-hover:bg-white/10")
        }
      >
        <IconComponent size={64} />
      </div>

      <div
        className={
          "px-1.5 py-[3px] rounded-md text-center max-w-[84px] transition-colors " +
          (isSelected ? "bg-[var(--macos-accent-deep)]" : "bg-transparent")
        }
      >
        <span
          className="text-[11px] font-medium leading-tight line-clamp-2 break-words text-white"
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

function pickIconComponent(type: DesktopIconData["type"]) {
  if (type === "drive") return DriveIcon;
  if (type === "folder") return FolderIcon;
  return FileIcon;
}

export { DEFAULT_DESKTOP_ICONS } from "@/constants/desktop-icons";
