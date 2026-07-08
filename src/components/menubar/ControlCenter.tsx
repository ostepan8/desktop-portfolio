"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useClickOutside } from "@/hooks/useClickOutside";
import { usePointerDrag } from "@/hooks/usePointerDrag";
import { useSounds } from "@/lib/sounds";
import { useSystemStatus } from "@/lib/system-status";
import { useNowPlaying } from "@/lib/now-playing";
import { panelPopVariants } from "@/constants/motion";
import { Z_INDEX } from "@/constants/layout";
import {
  AirDropIcon,
  BluetoothIcon,
  DisplayIcon,
  ForwardIcon,
  MoonIcon,
  MusicNoteIcon,
  PauseIcon,
  PlayIcon,
  SpeakerIcon,
  SunIcon,
  VolumeOffSmallIcon,
  VolumeOnSmallIcon,
  WifiIcon,
} from "./icons";

interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * macOS Control Center dropdown. Everything here is wired to real state:
 * volume drives the global sound system (including <video> playback), the
 * brightness slider dims the screen, Wi-Fi cuts Safari off from the network,
 * Focus syncs with Notification Center, and Now Playing mirrors and controls
 * the active video.
 */
export function ControlCenter({ isOpen, onClose }: ControlCenterProps) {
  const { isMuted, volume, setMuted, setVolume } = useSounds();
  const {
    wifi,
    bluetooth,
    airdrop,
    focusMode,
    brightness,
    setWifi,
    setBluetooth,
    setAirdrop,
    setFocusMode,
    setBrightness,
  } = useSystemStatus();
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, onClose, isOpen);

  // Slider works in 0–100; the sound system stores 0–1. Dragging to zero
  // mutes, dragging back up unmutes — same as the hardware volume keys.
  const volumePercent = isMuted ? 0 : Math.round(volume * 100);
  const handleVolumeChange = (next: number) => {
    if (next === 0) {
      if (!isMuted) setMuted(true);
      return;
    }
    if (isMuted) setMuted(false);
    setVolume(next / 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={panelPopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full right-0 mt-2"
          style={{ zIndex: Z_INDEX.contextMenu }}
        >
          <GlassPanel
            ref={panelRef}
            variant="sheet"
            className="w-80 rounded-2xl overflow-hidden"
          >
            <div className="p-3 grid grid-cols-2 gap-2">
              <ControlTile
                icon={<WifiIcon />}
                label="Wi-Fi"
                sublabel={wifi ? "Home Network" : "Off"}
                isActive={wifi}
                onClick={() => setWifi(!wifi)}
              />
              <ControlTile
                icon={<BluetoothIcon />}
                label="Bluetooth"
                sublabel={bluetooth ? "On" : "Off"}
                isActive={bluetooth}
                onClick={() => setBluetooth(!bluetooth)}
              />
              <ControlTile
                icon={<AirDropIcon />}
                label="AirDrop"
                sublabel={airdrop ? "Everyone" : "Off"}
                isActive={airdrop}
                onClick={() => setAirdrop(!airdrop)}
              />
              <ControlTile
                icon={<MoonIcon />}
                label="Focus"
                sublabel={focusMode ? "On" : "Off"}
                isActive={focusMode}
                onClick={() => setFocusMode(!focusMode)}
              />
            </div>

            <div className="px-3 pb-3 space-y-2">
              <SurfaceTile>
                <div className="flex items-center gap-3 mb-3">
                  <DisplayIcon />
                  <span className="text-xs font-medium text-white/90">Display</span>
                </div>
                <Slider value={brightness} onChange={setBrightness} icon={<SunIcon />} />
              </SurfaceTile>

              <SurfaceTile>
                <div className="flex items-center gap-3 mb-3">
                  <SpeakerIcon />
                  <span className="text-xs font-medium text-white/90">Sound</span>
                </div>
                <Slider
                  value={volumePercent}
                  onChange={handleVolumeChange}
                  icon={volumePercent === 0 ? <VolumeOffSmallIcon /> : <VolumeOnSmallIcon />}
                />
              </SurfaceTile>
            </div>

            <div className="px-3 pb-3">
              <NowPlayingTile />
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Mirrors whatever the Videos app is playing and drives its transport. */
function NowPlayingTile() {
  const { track, controls } = useNowPlaying();
  const hasTrack = track !== null;

  return (
    <SurfaceTile className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
        <MusicNoteIcon />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {track?.title ?? "Not Playing"}
        </div>
        <div className="text-xs text-white/50">{track?.subtitle ?? "Videos"}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => controls?.toggle()}
          disabled={!hasTrack}
          aria-label={track?.isPlaying ? "Pause" : "Play"}
          className={
            "p-1 transition-colors " +
            (hasTrack
              ? "text-white/70 hover:text-white"
              : "text-white/25 cursor-default")
          }
        >
          {track?.isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          onClick={() => controls?.next()}
          disabled={!hasTrack}
          aria-label="Next"
          className={
            "p-1 transition-colors " +
            (hasTrack
              ? "text-white/70 hover:text-white"
              : "text-white/25 cursor-default")
          }
        >
          <ForwardIcon />
        </button>
      </div>
    </SurfaceTile>
  );
}

/** Translucent inner card. Replaces the `rgba(255,255,255,0.08)` inline style. */
function SurfaceTile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl p-3 bg-[var(--macos-surface-hover)] ${className}`}>
      {children}
    </div>
  );
}

interface ControlTileProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  isActive: boolean;
  onClick: () => void;
}

function ControlTile({ icon, label, sublabel, isActive, onClick }: ControlTileProps) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-xl p-3 text-left transition-all active:scale-95 " +
        (isActive
          ? "bg-[var(--macos-accent)]/90"
          : "bg-[var(--macos-surface-hover)]")
      }
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

interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  icon: React.ReactNode;
}

function Slider({ value, onChange, icon }: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const project = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    onChange(Math.round((x / rect.width) * 100));
  };

  // Pointer drag — replaces the hand-rolled mousedown/mousemove/mouseup trio
  // with the shared hook so this slider matches the pattern used by window
  // resize and desktop selection rectangle.
  const onPointerDown = usePointerDrag({
    onStart: (_, e) => project(e.clientX),
    onMove: (_, e) => project(e.clientX),
  });

  return (
    <div className="flex items-center gap-3">
      <div className="text-white/60">{icon}</div>
      <div
        ref={sliderRef}
        className="flex-1 h-7 rounded-full bg-white/20 relative cursor-pointer overflow-hidden"
        onPointerDown={onPointerDown}
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
