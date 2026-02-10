"use client";

import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import { motion } from "framer-motion";

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
  const [wallpaper, setWallpaperState] = useState<WallpaperKey>("sonoma");
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("desktop-wallpaper") as WallpaperKey;
    if (saved && WALLPAPERS[saved]) {
      setWallpaperState(saved);
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  const setWallpaper = (key: WallpaperKey) => {
    setWallpaperState(key);
    localStorage.setItem("desktop-wallpaper", key);
  };

  return (
    <DesktopContext.Provider value={{ wallpaper, setWallpaper, wallpapers: WALLPAPERS }}>
      <div className="h-screen w-screen overflow-hidden flex flex-col">
        {/* Background layer */}
        <motion.div
          className={`absolute inset-0 ${WALLPAPERS[wallpaper].className} transition-colors duration-500`}
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
