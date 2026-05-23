"use client";

import { ReactNode, createContext, useContext } from "react";
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

interface DesktopContextType {
  wallpaper: WallpaperKey;
  setWallpaper: (key: WallpaperKey) => void;
  wallpapers: typeof WALLPAPERS;
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

  // Guard against bad keys (e.g. an old saved value for a wallpaper we removed).
  const setWallpaper = (key: WallpaperKey) => {
    if (WALLPAPERS[key]) setWallpaperRaw(key);
  };
  const safeWallpaper = WALLPAPERS[wallpaper] ? wallpaper : "sonoma";

  return (
    <DesktopContext.Provider value={{ wallpaper: safeWallpaper, setWallpaper, wallpapers: WALLPAPERS }}>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
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
