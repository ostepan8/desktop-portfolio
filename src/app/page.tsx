"use client";

import { useState } from "react";
import { DesktopProvider } from "@/components/desktop";
import { Dock, type DockItemData } from "@/components/dock";
import { MenuBar } from "@/components/menubar";

const DOCK_ITEMS: DockItemData[] = [
  { id: "finder", icon: "📁", label: "Finder", isRunning: true },
  { id: "safari", icon: "🧭", label: "Safari" },
  { id: "about", icon: "👤", label: "About Me" },
  { id: "projects", icon: "💼", label: "Projects" },
  { id: "terminal", icon: "💻", label: "Terminal" },
  { id: "textedit", icon: "📝", label: "TextEdit" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Home() {
  const [runningApps, setRunningApps] = useState<Set<string>>(new Set(["finder"]));
  const [activeApp, setActiveApp] = useState("Finder");

  const handleDockItemClick = (id: string) => {
    console.log("Open app:", id);
    setRunningApps((prev) => new Set([...prev, id]));
    // Set active app name (capitalize first letter)
    const appName = DOCK_ITEMS.find((item) => item.id === id)?.label || "Finder";
    setActiveApp(appName);
  };

  const dockItems: DockItemData[] = DOCK_ITEMS.map((item) => ({
    ...item,
    isRunning: runningApps.has(item.id),
  }));

  return (
    <DesktopProvider>
      {/* Menu Bar */}
      <MenuBar activeApp={activeApp} />

      {/* Desktop Area */}
      <main className="flex-1 relative">
        {/* Desktop icons will go here in future todos */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 items-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <span className="text-5xl drop-shadow-lg">💻</span>
          </div>
          <span className="text-xs text-white text-center drop-shadow-lg font-medium">
            Macintosh HD
          </span>
        </div>
      </main>

      {/* Dock */}
      <Dock items={dockItems} onItemClick={handleDockItemClick} />
    </DesktopProvider>
  );
}
