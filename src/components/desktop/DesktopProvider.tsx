"use client";

import { CSSProperties, ReactNode, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// macOS-inspired wallpapers
export const WALLPAPERS = {
  sonoma: {
    name: "Sonoma",
    className: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800",
  },
  monterey: {
    name: "Monterey",
    className: "bg-gradient-to-br from-purple-900 via-blue-900 to-teal-700",
  },
  ventura: {
    name: "Ventura",
    className: "bg-gradient-to-br from-orange-600 via-rose-600 to-purple-800",
  },
  sequoia: {
    name: "Sequoia",
    className: "bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-600",
  },
  midnight: {
    name: "Midnight",
    className: "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900",
  },
  aurora: {
    name: "Aurora",
    className: "bg-gradient-to-br from-green-400 via-cyan-500 to-blue-600",
  },
} as const;

export type WallpaperKey = keyof typeof WALLPAPERS;

// macOS-style accent colors. Each provides the three CSS variables the theme
// consumes: base, bright (on dark surfaces), and deep (selection highlight).
export const ACCENT_COLORS = {
  blue: { name: "Blue", accent: "#007aff", bright: "#0a84ff", deep: "#0058d1" },
  green: { name: "Green", accent: "#28cd41", bright: "#30d158", deep: "#1f9d34" },
  orange: { name: "Orange", accent: "#ff9500", bright: "#ff9f0a", deep: "#c96f00" },
  pink: { name: "Pink", accent: "#ff2d55", bright: "#ff375f", deep: "#c8203f" },
  purple: { name: "Purple", accent: "#af52de", bright: "#bf5af2", deep: "#8e3fb8" },
} as const;

export type AccentKey = keyof typeof ACCENT_COLORS;

interface DesktopContextType {
  wallpaper: WallpaperKey;
  setWallpaper: (key: WallpaperKey) => void;
  wallpapers: typeof WALLPAPERS;
  accent: AccentKey;
  setAccent: (key: AccentKey) => void;
  accents: typeof ACCENT_COLORS;
}

const DesktopContext = createContext<DesktopContextType | null>(null);

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error("useDesktop must be used within DesktopProvider");
  }
  return context;
}

interface DesktopProviderProps {
  children: ReactNode;
}

export function DesktopProvider({ children }: DesktopProviderProps) {
  const [wallpaper, setWallpaperRaw, mounted] = useLocalStorage<WallpaperKey>(
    "desktop-wallpaper",
    "sonoma",
  );
  const [accent, setAccentRaw] = useLocalStorage<AccentKey>(
    "desktop-accent",
    "blue",
  );

  // Guard against bad keys (e.g. an old saved value for a wallpaper we removed).
  const setWallpaper = (key: WallpaperKey) => {
    if (WALLPAPERS[key]) setWallpaperRaw(key);
  };
  const safeWallpaper = WALLPAPERS[wallpaper] ? wallpaper : "sonoma";

  const setAccent = (key: AccentKey) => {
    if (ACCENT_COLORS[key]) setAccentRaw(key);
  };
  const safeAccent = ACCENT_COLORS[accent] ? accent : "blue";
  const accentVars = {
    "--macos-accent": ACCENT_COLORS[safeAccent].accent,
    "--macos-accent-bright": ACCENT_COLORS[safeAccent].bright,
    "--macos-accent-deep": ACCENT_COLORS[safeAccent].deep,
  } as CSSProperties;

  return (
    <DesktopContext.Provider
      value={{
        wallpaper: safeWallpaper,
        setWallpaper,
        wallpapers: WALLPAPERS,
        accent: safeAccent,
        setAccent,
        accents: ACCENT_COLORS,
      }}
    >
      {/* Accent CSS variables cascade to every descendant, overriding the
          :root defaults from globals.css. */}
      <div
        className="h-screen w-screen overflow-hidden flex flex-col"
        style={accentVars}
      >
        {/* Background layer */}
        <motion.div
          className={`absolute inset-0 ${WALLPAPERS[safeWallpaper].className} transition-colors duration-500`}
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content layer */}
        <div className="relative flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </DesktopContext.Provider>
  );
}
