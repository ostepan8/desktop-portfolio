"use client";

import { useState, useCallback } from "react";
import { DesktopProvider } from "@/components/desktop";
import { Dock, type DockItemData } from "@/components/dock";
import { MenuBar } from "@/components/menubar";
import { WindowManagerProvider, useWindowManager } from "@/components/window";

const DOCK_ITEMS: DockItemData[] = [
  { id: "finder", icon: "📁", label: "Finder" },
  { id: "safari", icon: "🧭", label: "Safari" },
  { id: "about", icon: "👤", label: "About Me" },
  { id: "projects", icon: "💼", label: "Projects" },
  { id: "terminal", icon: "💻", label: "Terminal" },
  { id: "textedit", icon: "📝", label: "TextEdit" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Home() {
  return (
    <DesktopProvider>
      <WindowManagerProvider>
        <DesktopContent />
      </WindowManagerProvider>
    </DesktopProvider>
  );
}

function DesktopContent() {
  const { windows, openWindow, focusWindow, getWindowsByApp } = useWindowManager();
  const [activeApp, setActiveApp] = useState("Finder");

  const handleDockItemClick = useCallback((id: string) => {
    const existingWindows = getWindowsByApp(id);

    if (existingWindows.length > 0) {
      // Focus existing window
      focusWindow(existingWindows[0].id);
    } else {
      // Open new window
      const app = DOCK_ITEMS.find((item) => item.id === id);
      if (!app) return;

      const windowId = `${id}-${Date.now()}`;
      openWindow({
        id: windowId,
        appId: id,
        title: app.label,
        icon: app.icon,
        x: 100 + Math.random() * 100,
        y: 50 + Math.random() * 50,
        width: 700,
        height: 500,
        minWidth: 400,
        minHeight: 300,
        component: <AppContent appId={id} />,
      });
    }

    const appName = DOCK_ITEMS.find((item) => item.id === id)?.label || "Finder";
    setActiveApp(appName);
  }, [getWindowsByApp, focusWindow, openWindow]);

  // Determine which apps are running
  const runningApps = new Set(windows.map((w) => w.appId));

  const dockItems: DockItemData[] = DOCK_ITEMS.map((item) => ({
    ...item,
    isRunning: runningApps.has(item.id),
  }));

  return (
    <>
      <MenuBar activeApp={activeApp} />

      <main className="flex-1 relative">
        {/* Desktop icons placeholder */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 items-center">
          <div className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg transition-colors">
            <span className="text-5xl drop-shadow-lg">💻</span>
          </div>
          <span className="text-xs text-white text-center drop-shadow-lg font-medium">
            Macintosh HD
          </span>
        </div>
      </main>

      <Dock items={dockItems} onItemClick={handleDockItemClick} />
    </>
  );
}

// Placeholder app content - will be replaced with actual apps in future todos
function AppContent({ appId }: { appId: string }) {
  const contents: Record<string, { title: string; description: string }> = {
    finder: {
      title: "Finder",
      description: "File browser coming soon...",
    },
    safari: {
      title: "Safari",
      description: "Web browser coming soon...",
    },
    about: {
      title: "About Me",
      description: "Personal info coming soon...",
    },
    projects: {
      title: "Projects",
      description: "Portfolio showcase coming soon...",
    },
    terminal: {
      title: "Terminal",
      description: "Command line coming soon...",
    },
    textedit: {
      title: "TextEdit",
      description: "Text editor coming soon...",
    },
    settings: {
      title: "Settings",
      description: "System preferences coming soon...",
    },
  };

  const content = contents[appId] || { title: "App", description: "Coming soon..." };

  return (
    <div className="h-full flex flex-col items-center justify-center text-white/60 p-8">
      <span className="text-6xl mb-4">
        {DOCK_ITEMS.find((item) => item.id === appId)?.icon || "📱"}
      </span>
      <h2 className="text-xl font-semibold text-white mb-2">{content.title}</h2>
      <p className="text-center">{content.description}</p>
    </div>
  );
}
