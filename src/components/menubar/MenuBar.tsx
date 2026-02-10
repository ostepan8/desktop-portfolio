"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";

interface MenuBarProps {
  activeApp?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

const APPLE_MENU: MenuItem[] = [
  { label: "About This Mac", action: () => console.log("About") },
  { divider: true, label: "" },
  { label: "System Preferences...", action: () => console.log("Prefs") },
  { label: "App Store...", disabled: true },
  { divider: true, label: "" },
  { label: "Sleep", disabled: true },
  { label: "Restart...", disabled: true },
  { label: "Shut Down...", disabled: true },
];

export function MenuBar({ activeApp = "Finder", isMuted = true, onToggleMute }: MenuBarProps) {
  const isMobile = useIsMobile();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [time, setTime] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      // Shorter format for mobile
      const format = isMobile
        ? { hour: "numeric" as const, minute: "2-digit" as const }
        : {
            hour: "numeric" as const,
            minute: "2-digit" as const,
            weekday: "short" as const,
            month: "short" as const,
            day: "numeric" as const,
          };
      setTime(new Date().toLocaleTimeString("en-US", format));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isMobile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuEnter = (menuId: string) => {
    if (openMenu !== null) {
      setOpenMenu(menuId);
    }
  };

  // Mobile: Simplified status bar
  if (isMobile) {
    return (
      <header
        ref={menuRef}
        className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-3 text-[13px] font-medium z-50 select-none"
      >
        <div className="flex items-center gap-2">
          <AppleLogo />
          <span className="font-semibold text-white/90">{activeApp}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-1 rounded active:bg-white/20 text-sm"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
          <span className="text-white/90 text-xs tabular-nums">{time}</span>
        </div>
      </header>
    );
  }

  // Desktop: Full menu bar
  return (
    <header
      ref={menuRef}
      className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-2 text-[13px] font-medium z-50 select-none"
    >
      <div className="flex items-center">
        <MenuBarItem
          isOpen={openMenu === "apple"}
          onMouseDown={() => setOpenMenu(openMenu === "apple" ? null : "apple")}
          onMouseEnter={() => handleMenuEnter("apple")}
        >
          <AppleLogo />
          <MenuDropdown items={APPLE_MENU} isOpen={openMenu === "apple"} />
        </MenuBarItem>

        <MenuBarItem
          isOpen={openMenu === "app"}
          onMouseDown={() => setOpenMenu(openMenu === "app" ? null : "app")}
          onMouseEnter={() => handleMenuEnter("app")}
          className="font-semibold"
        >
          {activeApp}
        </MenuBarItem>

        {["File", "Edit", "View", "Go", "Window", "Help"].map((menu) => (
          <MenuBarItem
            key={menu}
            isOpen={openMenu === menu.toLowerCase()}
            onMouseDown={() =>
              setOpenMenu(openMenu === menu.toLowerCase() ? null : menu.toLowerCase())
            }
            onMouseEnter={() => handleMenuEnter(menu.toLowerCase())}
            className="text-white/90"
          >
            {menu}
          </MenuBarItem>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleMute}
          className="px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors text-sm"
          title={isMuted ? "Sound: Off" : "Sound: On"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <StatusIcon>🔋</StatusIcon>
        <StatusIcon>📶</StatusIcon>
        <StatusIcon>🔍</StatusIcon>
        <div className="px-2 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors">
          <time className="tabular-nums text-white/90">{time}</time>
        </div>
      </div>
    </header>
  );
}

interface MenuBarItemProps {
  children: React.ReactNode;
  isOpen: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  className?: string;
}

function MenuBarItem({
  children,
  isOpen,
  onMouseDown,
  onMouseEnter,
  className = "",
}: MenuBarItemProps) {
  return (
    <div
      className={"relative px-2 py-0.5 rounded cursor-default transition-colors " +
        (isOpen ? "bg-white/20" : "hover:bg-white/10") + " " + className}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}

interface MenuDropdownProps {
  items: MenuItem[];
  isOpen: boolean;
}

function MenuDropdown({ items, isOpen }: MenuDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 mt-0.5 min-w-[220px] py-1.5 rounded-xl overflow-hidden"
          style={{
            backgroundColor: "rgba(30, 30, 32, 0.85)",
            backdropFilter: "blur(50px) saturate(180%)",
            WebkitBackdropFilter: "blur(50px) saturate(180%)",
            boxShadow:
              "0 20px 40px -8px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.1), inset 0 0.5px 0 rgba(255,255,255,0.08)",
          }}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.12, ease: [0.2, 0, 0.13, 1] }}
        >
          {items.map((item, index) =>
            item.divider ? (
              <div key={index} className="h-px bg-white/10 my-1.5 mx-3" />
            ) : (
              <button
                key={index}
                className={
                  "w-full px-3 py-[5px] mx-1.5 flex items-center justify-between text-[13px] rounded-md transition-colors " +
                  "focus:outline-none " +
                  (item.disabled
                    ? "text-white/30 cursor-default"
                    : "text-white/90 hover:bg-[#0058d1] active:bg-[#004bb5] cursor-default")
                }
                style={{ width: "calc(100% - 12px)" }}
                onClick={() => !item.disabled && item.action?.()}
                disabled={item.disabled}
              >
                <span className="font-normal">{item.label}</span>
                {item.shortcut && (
                  <span className="text-white/40 text-[12px] font-medium tracking-wide ml-4">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatusIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors text-sm">
      {children}
    </div>
  );
}

function AppleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
