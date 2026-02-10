"use client";

import { useState } from "react";
import { DesktopProvider } from "@/components/desktop";
import { Dock, DockSeparator, type DockItemData } from "@/components/dock";

const DOCK_ITEMS: DockItemData[] = [
  { id: "finder", icon: "📁", label: "Finder", isRunning: true },
  { id: "safari", icon: "🧭", label: "Safari" },
  { id: "about", icon: "👤", label: "About Me" },
  { id: "projects", icon: "💼", label: "Projects" },
  { id: "terminal", icon: "💻", label: "Terminal" },
  { id: "textedit", icon: "📝", label: "TextEdit" },
];

const DOCK_ITEMS_RIGHT: DockItemData[] = [
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Home() {
  const [runningApps, setRunningApps] = useState<Set<string>>(new Set(["finder"]));

  const handleDockItemClick = (id: string) => {
    console.log("Open app:", id);
    // Will open windows in future todos
    setRunningApps((prev) => new Set([...prev, id]));
  };

  const allDockItems: DockItemData[] = [
    ...DOCK_ITEMS.map((item) => ({
      ...item,
      isRunning: runningApps.has(item.id),
    })),
    { id: "separator", icon: "", label: "" }, // Separator marker
    ...DOCK_ITEMS_RIGHT.map((item) => ({
      ...item,
      isRunning: runningApps.has(item.id),
    })),
  ];

  return (
    <DesktopProvider>
      {/* Menu Bar */}
      <header className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-4 text-[13px] font-medium z-50">
        <div className="flex items-center gap-4">
          <button className="hover:bg-white/10 px-2 py-0.5 rounded transition-colors">
            <AppleLogo />
          </button>
          <span className="font-semibold">Finder</span>
          <MenuItems items={["File", "Edit", "View", "Go", "Window", "Help"]} />
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <span>🔋</span>
          <span>📶</span>
          <Clock />
        </div>
      </header>

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
      <Dock
        items={allDockItems.filter((item) => item.id !== "separator")}
        onItemClick={handleDockItemClick}
      />
    </DesktopProvider>
  );
}

// Apple logo component
function AppleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

// Menu items component
function MenuItems({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item) => (
        <button
          key={item}
          className="text-white/60 hover:text-white/90 hover:bg-white/10 px-2 py-0.5 rounded transition-colors"
        >
          {item}
        </button>
      ))}
    </>
  );
}

// Clock component
function Clock() {
  return (
    <time suppressHydrationWarning className="tabular-nums">
      {new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
    </time>
  );
}
