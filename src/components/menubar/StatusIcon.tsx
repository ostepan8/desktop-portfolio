"use client";

import { useState, type ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";

interface StatusIconProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Makes the icon an actionable button (e.g. Spotlight opens search). */
  onClick?: () => void;
}

/**
 * Right-side menubar icon (battery, WiFi, spotlight, etc.) that shows a
 * hover tooltip below itself. The tooltip text is two lines: a short title
 * and an optional subtitle.
 */
export function StatusIcon({ children, title, subtitle, onClick }: StatusIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {children}
      {title && (
        <Tooltip
          visible={isHovered}
          placement="bottom"
          offset={28}
          label={
            <>
              <div className="text-xs font-medium text-white">{title}</div>
              {subtitle && (
                <div className="text-[10px] text-white/50 mt-0.5">{subtitle}</div>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
