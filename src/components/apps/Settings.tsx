"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  useDesktop,
  WALLPAPERS,
  ACCENT_COLORS,
  type WallpaperKey,
  type AccentKey,
} from "@/components/desktop";
import { useSounds } from "@/lib/sounds";
import { Toggle } from "@/components/ui/Toggle";
import { SidebarItem } from "@/components/ui/SidebarItem";

type SettingsTab = "general" | "desktop" | "sound";

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "desktop", label: "Desktop", icon: "🖼️" },
  { id: "sound", label: "Sound", icon: "🔊" },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="h-full flex bg-[var(--macos-bg-1)]">
      {/* Sidebar */}
      <div className="w-56 bg-[var(--macos-bg-2)] border-r border-white/10 p-3">
        <div className="space-y-1">
          {TABS.map((tab) => (
            <SidebarItem
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="p-6"
        >
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "desktop" && <DesktopSettings />}
          {activeTab === "sound" && <SoundSettings />}
        </motion.div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">General</h2>

      <SettingsSection title="About This Portfolio">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              💻
            </div>
            <div>
              <h3 className="text-white font-semibold">Desktop Portfolio</h3>
              <p className="text-white/50 text-sm">Version 1.0.0</p>
              <p className="text-white/50 text-sm">Built with Next.js & React</p>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Technologies">
        <div className="flex flex-wrap gap-2">
          {["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70"
            >
              {tech}
            </span>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Keyboard Shortcuts">
        <div className="space-y-2 text-sm">
          <ShortcutRow keys={["⌘", "W"]} description="Close window" />
          <ShortcutRow keys={["⌘", "M"]} description="Minimize window" />
          <ShortcutRow keys={["⌘", "Q"]} description="Quit app" />
          <ShortcutRow keys={["Double-click"]} description="Open item" />
        </div>
      </SettingsSection>
    </div>
  );
}

function DesktopSettings() {
  const { wallpaper, setWallpaper, accent, setAccent } = useDesktop();
  const wallpaperKeys = Object.keys(WALLPAPERS) as WallpaperKey[];
  const accentKeys = Object.keys(ACCENT_COLORS) as AccentKey[];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Desktop & Appearance</h2>

      <SettingsSection title="Wallpaper">
        <div className="grid grid-cols-3 gap-3">
          {wallpaperKeys.map((key) => (
            <button
              key={key}
              onClick={() => setWallpaper(key)}
              className={
                "relative aspect-video rounded-lg overflow-hidden border-2 transition-all " +
                (wallpaper === key
                  ? "border-[#0a84ff] ring-2 ring-[#0a84ff]/50"
                  : "border-transparent hover:border-white/30")
              }
            >
              <div
                className={"absolute inset-0 " + WALLPAPERS[key].className}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1">
                <span className="text-xs text-white">{WALLPAPERS[key].name}</span>
              </div>
              {wallpaper === key && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-[#0a84ff] rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Accent Color">
        <div className="flex gap-2">
          {accentKeys.map((key) => {
            const isActive = accent === key;
            return (
              <button
                key={key}
                onClick={() => setAccent(key)}
                className={
                  "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center " +
                  (isActive
                    ? "border-white ring-2 ring-white/30 scale-110"
                    : "border-white/20 hover:border-white/50")
                }
                style={{ backgroundColor: ACCENT_COLORS[key].bright }}
                title={ACCENT_COLORS[key].name}
                aria-pressed={isActive}
              >
                {isActive && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-white/40 mt-2">
          Changes buttons, highlights, and selection color across the system.
        </p>
      </SettingsSection>
    </div>
  );
}

function SoundSettings() {
  const { isMuted, volume, setMuted, setVolume, playClick } = useSounds();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    playClick();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Sound</h2>

      <SettingsSection title="Output">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Sound Effects</span>
            <Toggle
              checked={!isMuted}
              onChange={() => setMuted(!isMuted)}
              size="md"
              ariaLabel="Sound effects"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Volume</span>
              <span className="text-white/50 text-sm">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer disabled:opacity-50
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="text-lg">🔊</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Sound Effects">
        <div className="space-y-2 text-sm text-white/60">
          <p>Sound effects include:</p>
          <ul className="list-disc list-inside space-y-1 text-white/50">
            <li>Startup chime</li>
            <li>Window open/close sounds</li>
            <li>Error beeps</li>
            <li>UI click feedback</li>
          </ul>
        </div>
      </SettingsSection>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-white/50 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/80 font-mono">
              {key}
            </kbd>
            {i < keys.length - 1 && <span className="text-white/30 mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
