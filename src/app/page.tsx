"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DesktopProvider,
  DesktopIcons,
  DEFAULT_DESKTOP_ICONS,
  useDesktop,
  WALLPAPERS,
  ContextMenu,
  BootSequence,
  type DesktopIconData,
  type ContextMenuItem,
  type WallpaperKey,
} from "@/components/desktop";
import { Dock, type DockItemData } from "@/components/dock";
import { MenuBar } from "@/components/menubar";
import { WindowManagerProvider, useWindowManager } from "@/components/window";
import { FileSystemProvider } from "@/lib/filesystem";
import { SoundProvider, useSounds } from "@/lib/sounds";
import { Finder, AboutMe, Terminal, Projects, TextEdit, Safari } from "@/components/apps";

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
  const [isBooted, setIsBooted] = useState(false);

  return (
    <SoundProvider>
      <FileSystemProvider>
        <DesktopProvider>
          <WindowManagerProvider>
            {!isBooted && <BootSequence onComplete={() => setIsBooted(true)} />}
            <DesktopContentWithSound />
          </WindowManagerProvider>
        </DesktopProvider>
      </FileSystemProvider>
    </SoundProvider>
  );
}

// Wrapper to access sounds context
function DesktopContentWithSound() {
  const { playWindowOpen, isMuted, setMuted } = useSounds();
  return (
    <DesktopContent
      onWindowOpen={playWindowOpen}
      isMuted={isMuted}
      onToggleMute={() => setMuted(!isMuted)}
    />
  );
}

interface DesktopContentProps {
  onWindowOpen?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

function DesktopContent({ onWindowOpen, isMuted, onToggleMute }: DesktopContentProps) {
  const { windows, openWindow, focusWindow, getWindowsByApp } = useWindowManager();
  const { setWallpaper } = useDesktop();
  const [activeApp, setActiveApp] = useState("Finder");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  const openAppWindow = useCallback((appId: string, title: string, icon: string, initialPath?: string | null) => {
    // For finder, always open a new window if path is specified
    const existingWindows = getWindowsByApp(appId);
    const shouldFocusExisting = existingWindows.length > 0 && initialPath === undefined;

    if (shouldFocusExisting) {
      focusWindow(existingWindows[0].id);
    } else {
      const windowId = `${appId}-${Date.now()}`;

      // Determine which component to render
      let component: React.ReactNode;
      if (appId === "finder") {
        component = <Finder initialPath={initialPath ?? null} />;
      } else if (appId === "about") {
        component = <AboutMe />;
      } else if (appId === "terminal") {
        component = <Terminal />;
      } else if (appId === "projects") {
        component = <Projects />;
      } else if (appId === "textedit") {
        component = <TextEdit fileId={initialPath ?? undefined} />;
      } else if (appId === "safari") {
        component = <Safari />;
      } else {
        component = <AppContent appId={appId} />;
      }

      openWindow({
        id: windowId,
        appId: appId,
        title: title,
        icon: icon,
        x: 100 + Math.random() * 100,
        y: 50 + Math.random() * 50,
        width: appId === "finder" ? 800 : 700,
        height: appId === "finder" ? 500 : 500,
        minWidth: appId === "finder" ? 600 : 400,
        minHeight: 300,
        component,
      });
      onWindowOpen?.();
    }
    setActiveApp(title);
  }, [getWindowsByApp, focusWindow, openWindow, onWindowOpen]);

  const handleDockItemClick = useCallback((id: string) => {
    const app = DOCK_ITEMS.find((item) => item.id === id);
    if (!app) return;
    openAppWindow(id, app.label, app.icon);
  }, [openAppWindow]);

  const handleDesktopIconOpen = useCallback((id: string) => {
    // Map desktop icon to app or action
    const iconActions: Record<string, () => void> = {
      "macintosh-hd": () => openAppWindow("finder", "Macintosh HD", "💻", null),
      "documents": () => openAppWindow("finder", "Documents", "📁", "documents"),
      "projects": () => openAppWindow("finder", "Projects", "📂", "projects"),
      "readme": () => openAppWindow("textedit", "README.txt", "📄"),
    };
    iconActions[id]?.();
  }, [openAppWindow]);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    // Create wallpaper submenu items
    const wallpaperKeys = Object.keys(WALLPAPERS) as WallpaperKey[];

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "New Folder", icon: "📁", action: () => console.log("New folder") },
        { label: "New File", icon: "📄", action: () => console.log("New file") },
        { divider: true, label: "" },
        { label: "Get Info", icon: "ℹ️", disabled: true },
        { divider: true, label: "" },
        // Wallpaper options
        ...wallpaperKeys.map((key) => ({
          label: `Wallpaper: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          icon: "🖼️",
          action: () => setWallpaper(key),
        })),
        { divider: true, label: "" },
        { label: "Clean Up", action: () => console.log("Clean up") },
        { label: "Sort By", disabled: true },
      ],
    });
  }, [setWallpaper]);

  const handleIconContextMenu = useCallback((e: React.MouseEvent, icon: DesktopIconData) => {
    e.preventDefault();

    const isFolder = icon.type === "folder" || icon.type === "drive";

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: "Open", icon: "📂", action: () => handleDesktopIconOpen(icon.id) },
        { divider: true, label: "" },
        { label: "Get Info", icon: "ℹ️", shortcut: "⌘I" },
        { label: "Rename", action: () => console.log("Rename", icon.id) },
        { label: "Duplicate", disabled: icon.type === "drive" },
        { divider: true, label: "" },
        ...(isFolder ? [
          { label: "New Folder", icon: "📁" },
          { divider: true, label: "" },
        ] : []),
        { label: "Move to Trash", icon: "🗑️", danger: true, disabled: icon.type === "drive" },
      ],
    });
  }, [handleDesktopIconOpen]);

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
      <MenuBar activeApp={activeApp} isMuted={isMuted} onToggleMute={onToggleMute} />

      <main className="flex-1 relative" onClick={hideContextMenu}>
        <DesktopIcons
          icons={desktopIcons}
          onIconOpen={handleDesktopIconOpen}
          onIconContextMenu={handleIconContextMenu}
          onDesktopContextMenu={handleDesktopContextMenu}
        />
      </main>

      <Dock items={dockItems} onItemClick={handleDockItemClick} />

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={hideContextMenu}
          />
        )}
      </AnimatePresence>
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
