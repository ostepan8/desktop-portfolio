"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";
import { NotificationCenter } from "./NotificationCenter";

// Control Center Panel
function ControlCenter({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
}: {
  isOpen: boolean;
  onClose: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}) {
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(isMuted ? 0 : 70);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume === 0 && !isMuted) {
      onToggleMute?.();
    } else if (newVolume > 0 && isMuted) {
      onToggleMute?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-[200]"
          style={{
            backgroundColor: "rgba(30, 30, 32, 0.8)",
            backdropFilter: "blur(50px) saturate(180%)",
            WebkitBackdropFilter: "blur(50px) saturate(180%)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1)",
          }}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Grid of toggles */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {/* Wi-Fi */}
            <ControlTile
              icon={<WifiIcon />}
              label="Wi-Fi"
              sublabel={wifi ? "Home Network" : "Off"}
              isActive={wifi}
              onClick={() => setWifi(!wifi)}
            />

            {/* Bluetooth */}
            <ControlTile
              icon={<BluetoothIcon />}
              label="Bluetooth"
              sublabel={bluetooth ? "On" : "Off"}
              isActive={bluetooth}
              onClick={() => setBluetooth(!bluetooth)}
            />

            {/* AirDrop */}
            <ControlTile
              icon={<AirDropIcon />}
              label="AirDrop"
              sublabel={airdrop ? "Everyone" : "Off"}
              isActive={airdrop}
              onClick={() => setAirdrop(!airdrop)}
            />

            {/* Do Not Disturb */}
            <ControlTile
              icon={<MoonIcon />}
              label="Focus"
              sublabel={doNotDisturb ? "On" : "Off"}
              isActive={doNotDisturb}
              onClick={() => setDoNotDisturb(!doNotDisturb)}
            />
          </div>

          {/* Display & Sound */}
          <div className="px-3 pb-3 space-y-2">
            {/* Display */}
            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                <DisplayIcon />
                <span className="text-xs font-medium text-white/90">Display</span>
              </div>
              <Slider
                value={brightness}
                onChange={setBrightness}
                icon={<SunIcon />}
              />
            </div>

            {/* Sound */}
            <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-3">
                <SpeakerIcon />
                <span className="text-xs font-medium text-white/90">Sound</span>
              </div>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                icon={volume === 0 ? <VolumeOffSmallIcon /> : <VolumeOnSmallIcon />}
              />
            </div>
          </div>

          {/* Now Playing - Placeholder */}
          <div className="px-3 pb-3">
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                <MusicNoteIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">Not Playing</div>
                <div className="text-xs text-white/50">Music</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 text-white/50 hover:text-white/90 transition-colors">
                  <PlayIcon />
                </button>
                <button className="p-1 text-white/50 hover:text-white/90 transition-colors">
                  <ForwardIcon />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Control Tile Component
function ControlTile({
  icon,
  label,
  sublabel,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-3 text-left transition-all active:scale-95"
      style={{
        backgroundColor: isActive ? "rgba(0, 122, 255, 0.9)" : "rgba(255,255,255,0.08)",
      }}
    >
      <div className={`mb-2 ${isActive ? "text-white" : "text-blue-400"}`}>
        {icon}
      </div>
      <div className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/90"}`}>
        {label}
      </div>
      <div className={`text-[10px] ${isActive ? "text-white/80" : "text-white/50"}`}>
        {sublabel}
      </div>
    </button>
  );
}

// Slider Component
function Slider({
  value,
  onChange,
  icon,
}: {
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    onChange(percent);
  }, [onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-white/60">{icon}</div>
      <div
        ref={sliderRef}
        className="flex-1 h-7 rounded-full bg-white/20 relative cursor-pointer overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute inset-y-0 left-0 bg-white rounded-full transition-[width]"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-[left]"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>
    </div>
  );
}

// Additional Control Center Icons
function BluetoothIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
    </svg>
  );
}

function AirDropIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
    </svg>
  );
}

function DisplayIcon() {
  return (
    <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
  );
}

function VolumeOnSmallIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>
  );
}

function VolumeOffSmallIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
  );
}

// Status bar icons
function VolumeOnIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.5 2.5L4 5H2a1 1 0 00-1 1v4a1 1 0 001 1h2l3.5 2.5a.5.5 0 00.8-.4V2.9a.5.5 0 00-.8-.4zM10.5 4.5a.5.5 0 01.7 0 5.5 5.5 0 010 7.78.5.5 0 11-.7-.72 4.5 4.5 0 000-6.34.5.5 0 010-.72z"/>
      <path d="M12.5 2.5a.5.5 0 01.7 0 8.5 8.5 0 010 12.02.5.5 0 11-.7-.72 7.5 7.5 0 000-10.58.5.5 0 010-.72z"/>
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.5 2.5L4 5H2a1 1 0 00-1 1v4a1 1 0 001 1h2l3.5 2.5a.5.5 0 00.8-.4V2.9a.5.5 0 00-.8-.4z"/>
      <path d="M10.35 5.35a.5.5 0 01.7 0L12.5 6.8l1.45-1.45a.5.5 0 01.7.7L13.2 7.5l1.45 1.45a.5.5 0 01-.7.7L12.5 8.2l-1.45 1.45a.5.5 0 01-.7-.7L11.8 7.5l-1.45-1.45a.5.5 0 010-.7z"/>
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg className="w-[22px] h-4 text-white/90" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.5"/>
      <path d="M23 4v4a2 2 0 002-2 2 2 0 00-2-2z" fill="currentColor" fillOpacity="0.5"/>
      <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/>
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
      <path d="M5.17 9.17a4 4 0 015.66 0 .75.75 0 001.06-1.06 5.5 5.5 0 00-7.78 0 .75.75 0 001.06 1.06z"/>
      <path d="M2.34 6.34a7 7 0 0111.32 0 .75.75 0 001.06-1.06 8.5 8.5 0 00-13.44 0 .75.75 0 001.06 1.06z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5"/>
      <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
    </svg>
  );
}

function ControlCenterIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/>
      <rect x="9" y="1" width="6" height="3" rx="1"/>
      <rect x="9" y="6" width="6" height="3" rx="1"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/>
      <rect x="9" y="11" width="6" height="4" rx="1"/>
    </svg>
  );
}

function StatusIcon({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && title && (
          <motion.div
            className="absolute top-full mt-2 px-3 py-2 rounded-lg whitespace-nowrap z-[200] pointer-events-none"
            style={{
              backgroundColor: "rgba(30, 30, 32, 0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.1 }}
          >
            <div className="text-xs font-medium text-white">{title}</div>
            {subtitle && <div className="text-[10px] text-white/50 mt-0.5">{subtitle}</div>}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[-6px]"
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "6px solid rgba(30, 30, 32, 0.95)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface WindowInfo {
  id: string;
  title: string;
  appId: string;
}

interface MenuBarProps {
  activeApp?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  windows?: WindowInfo[];
  activeWindowId?: string | null;
  onFocusWindow?: (id: string) => void;
  onMinimizeAll?: () => void;
  onCloseWindow?: () => void;
  onAbout?: () => void;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  disabled?: boolean;
}


export function MenuBar({
  activeApp = "Finder",
  isMuted = true,
  onToggleMute,
  windows = [],
  activeWindowId,
  onFocusWindow,
  onMinimizeAll,
  onCloseWindow,
  onAbout,
}: MenuBarProps) {
  const isMobile = useIsMobile();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [time, setTime] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);

  const closeControlCenter = useCallback(() => {
    setShowControlCenter(false);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setShowNotificationCenter(false);
  }, []);

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
      <div className="flex items-center gap-1">
        <MenuBarItem
          isOpen={openMenu === "apple"}
          onMouseDown={() => setOpenMenu(openMenu === "apple" ? null : "apple")}
          onMouseEnter={() => handleMenuEnter("apple")}
        >
          <AppleLogo />
          <MenuDropdown
            items={[
              { label: "About This Mac", action: onAbout },
              { divider: true, label: "" },
              { label: "System Preferences...", disabled: true },
              { label: "App Store...", disabled: true },
              { divider: true, label: "" },
              { label: "Sleep", disabled: true },
              { label: "Restart...", disabled: true },
              { label: "Shut Down...", disabled: true },
            ]}
            isOpen={openMenu === "apple"}
          />
        </MenuBarItem>

        <MenuBarItem
          isOpen={openMenu === "app"}
          onMouseDown={() => setOpenMenu(openMenu === "app" ? null : "app")}
          onMouseEnter={() => handleMenuEnter("app")}
          className="font-semibold"
        >
          {activeApp}
        </MenuBarItem>

        {/* File Menu */}
        <MenuBarItem
          isOpen={openMenu === "file"}
          onMouseDown={() => setOpenMenu(openMenu === "file" ? null : "file")}
          onMouseEnter={() => handleMenuEnter("file")}
          className="text-white/90"
        >
          File
          <MenuDropdown
            items={[
              { label: "New Window", shortcut: "⌘N", disabled: true },
              { label: "Close Window", shortcut: "⌘W", action: onCloseWindow, disabled: !activeWindowId },
              { divider: true, label: "" },
              { label: "Get Info", shortcut: "⌘I", disabled: true },
            ]}
            isOpen={openMenu === "file"}
          />
        </MenuBarItem>

        {/* Edit Menu */}
        <MenuBarItem
          isOpen={openMenu === "edit"}
          onMouseDown={() => setOpenMenu(openMenu === "edit" ? null : "edit")}
          onMouseEnter={() => handleMenuEnter("edit")}
          className="text-white/90"
        >
          Edit
          <MenuDropdown
            items={[
              { label: "Undo", shortcut: "⌘Z", disabled: true },
              { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
              { divider: true, label: "" },
              { label: "Cut", shortcut: "⌘X", disabled: true },
              { label: "Copy", shortcut: "⌘C", disabled: true },
              { label: "Paste", shortcut: "⌘V", disabled: true },
              { label: "Select All", shortcut: "⌘A", disabled: true },
            ]}
            isOpen={openMenu === "edit"}
          />
        </MenuBarItem>

        {/* View Menu */}
        <MenuBarItem
          isOpen={openMenu === "view"}
          onMouseDown={() => setOpenMenu(openMenu === "view" ? null : "view")}
          onMouseEnter={() => handleMenuEnter("view")}
          className="text-white/90"
        >
          View
          <MenuDropdown
            items={[
              { label: "as Icons", disabled: true },
              { label: "as List", disabled: true },
              { label: "as Columns", disabled: true },
              { divider: true, label: "" },
              { label: "Show Sidebar", disabled: true },
              { label: "Hide Toolbar", disabled: true },
            ]}
            isOpen={openMenu === "view"}
          />
        </MenuBarItem>

        {/* Go Menu */}
        <MenuBarItem
          isOpen={openMenu === "go"}
          onMouseDown={() => setOpenMenu(openMenu === "go" ? null : "go")}
          onMouseEnter={() => handleMenuEnter("go")}
          className="text-white/90"
        >
          Go
          <MenuDropdown
            items={[
              { label: "Back", shortcut: "⌘[", disabled: true },
              { label: "Forward", shortcut: "⌘]", disabled: true },
              { divider: true, label: "" },
              { label: "Computer", disabled: true },
              { label: "Home", shortcut: "⇧⌘H", disabled: true },
              { label: "Desktop", shortcut: "⇧⌘D", disabled: true },
              { label: "Documents", disabled: true },
              { label: "Downloads", disabled: true },
            ]}
            isOpen={openMenu === "go"}
          />
        </MenuBarItem>

        {/* Window Menu - Dynamic based on open windows */}
        <MenuBarItem
          isOpen={openMenu === "window"}
          onMouseDown={() => setOpenMenu(openMenu === "window" ? null : "window")}
          onMouseEnter={() => handleMenuEnter("window")}
          className="text-white/90"
        >
          Window
          <MenuDropdown
            items={[
              { label: "Minimize", shortcut: "⌘M", disabled: !activeWindowId },
              { label: "Minimize All", action: onMinimizeAll, disabled: windows.length === 0 },
              { divider: true, label: "" },
              { label: "Bring All to Front", disabled: true },
              ...(windows.length > 0 ? [
                { divider: true, label: "" },
                ...windows.map((w) => ({
                  label: (w.id === activeWindowId ? "✓ " : "   ") + w.title,
                  action: () => onFocusWindow?.(w.id),
                })),
              ] : []),
            ]}
            isOpen={openMenu === "window"}
          />
        </MenuBarItem>

        {/* Help Menu */}
        <MenuBarItem
          isOpen={openMenu === "help"}
          onMouseDown={() => setOpenMenu(openMenu === "help" ? null : "help")}
          onMouseEnter={() => handleMenuEnter("help")}
          className="text-white/90"
        >
          Help
          <MenuDropdown
            items={[
              { label: "Search", disabled: true },
              { divider: true, label: "" },
              { label: "macOS Help", disabled: true },
            ]}
            isOpen={openMenu === "help"}
          />
        </MenuBarItem>
      </div>

      <div className="flex items-center gap-0.5">
        {/* Volume */}
        <button
          onClick={onToggleMute}
          className="px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors"
          title={isMuted ? "Sound: Off" : "Sound: On"}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>

        {/* Battery */}
        <StatusIcon title="Battery" subtitle="100% - Charged">
          <BatteryIcon />
        </StatusIcon>

        {/* WiFi */}
        <StatusIcon title="Wi-Fi" subtitle="Home Network">
          <WifiIcon />
        </StatusIcon>

        {/* Spotlight */}
        <StatusIcon title="Spotlight" subtitle="⌘ Space">
          <SearchIcon />
        </StatusIcon>

        {/* Control Center */}
        <div className="relative">
          <button
            onClick={() => setShowControlCenter(!showControlCenter)}
            className={"px-1.5 py-0.5 rounded transition-colors " + (showControlCenter ? "bg-white/20" : "hover:bg-white/10")}
            title="Control Center"
          >
            <ControlCenterIcon />
          </button>
          <ControlCenter
            isOpen={showControlCenter}
            onClose={closeControlCenter}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
          />
        </div>

        {/* Date/Time */}
        <button
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          className={"px-2 py-0.5 rounded transition-colors " + (showNotificationCenter ? "bg-white/20" : "hover:bg-white/10")}
        >
          <time className="tabular-nums text-white/90 text-[13px]">{time}</time>
        </button>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={closeNotificationCenter}
      />
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


function AppleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
