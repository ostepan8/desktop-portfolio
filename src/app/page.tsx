"use client";

import { useState, useCallback } from "react";
import { DesktopProvider, DesktopIcons, DEFAULT_DESKTOP_ICONS, type DesktopIconData } from "@/components/desktop";
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

  const openAppWindow = useCallback((appId: string, title: string, icon: string) => {
    const existingWindows = getWindowsByApp(appId);

    if (existingWindows.length > 0) {
      focusWindow(existingWindows[0].id);
    } else {
      const windowId = `${appId}-${Date.now()}`;
      openWindow({
        id: windowId,
        appId: appId,
        title: title,
        icon: icon,
        x: 100 + Math.random() * 100,
        y: 50 + Math.random() * 50,
        width: 700,
        height: 500,
        minWidth: 400,
        minHeight: 300,
        component: <AppContent appId={appId} />,
      });
    }
    setActiveApp(title);
  }, [getWindowsByApp, focusWindow, openWindow]);

  const handleDockItemClick = useCallback((id: string) => {
    const app = DOCK_ITEMS.find((item) => item.id === id);
    if (!app) return;
    openAppWindow(id, app.label, app.icon);
  }, [openAppWindow]);

  const handleDesktopIconOpen = useCallback((id: string) => {
    // Map desktop icon to app or action
    const iconActions: Record<string, () => void> = {
      "macintosh-hd": () => openAppWindow("finder", "Macintosh HD", "💻"),
      "documents": () => openAppWindow("finder", "Documents", "📁"),
      "projects": () => openAppWindow("projects", "Projects", "📂"),
      "readme": () => openAppWindow("textedit", "README.txt", "📄"),
    };
    iconActions[id]?.();
  }, [openAppWindow]);

  // Determine which apps are running
  const runningApps = new Set(windows.map((w) => w.appId));

  const dockItems: DockItemData[] = DOCK_ITEMS.map((item) => ({
    ...item,
    isRunning: runningApps.has(item.id),
  }));

  // Desktop icons with open handlers
  const desktopIcons: DesktopIconData[] = DEFAULT_DESKTOP_ICONS.map((icon) => ({
    ...icon,
    onOpen: () => handleDesktopIconOpen(icon.id),
  }));

  return (
    <>
      <MenuBar activeApp={activeApp} />

      <main className="flex-1 relative">
        <DesktopIcons icons={desktopIcons} onIconOpen={handleDesktopIconOpen} />
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
