"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AboutThisMac,
  BootSequence,
  ContextMenu,
  DEFAULT_DESKTOP_ICONS,
  DesktopIcons,
  DesktopProvider,
  Spotlight,
  SystemOverlay,
  WALLPAPERS,
  useDesktop,
  type ContextMenuItem,
  type DesktopIconData,
  type SystemPowerState,
  type WallpaperKey,
} from "@/components/desktop";
import { Dock, type DockItemData } from "@/components/dock";
import { MenuBar, type MenuActions } from "@/components/menubar";
import {
  WindowManagerProvider,
  useWindowManager,
} from "@/components/window";
import { FileSystemProvider } from "@/lib/filesystem";
import { SoundProvider, useSounds } from "@/lib/sounds";
import { SystemStatusProvider } from "@/lib/system-status";
import { NowPlayingProvider } from "@/lib/now-playing";
import {
  APPS,
  DOCK_APPS,
  type AppId,
  type AppLaunchContext,
} from "@/constants/apps";

export default function Home() {
  const [isBooted, setIsBooted] = useState(false);

  return (
    <SoundProvider>
      <SystemStatusProvider>
        <NowPlayingProvider>
          <FileSystemProvider>
            <DesktopProvider>
              <WindowManagerProvider>
                {!isBooted && (
                  <BootSequence onComplete={() => setIsBooted(true)} />
                )}
                <DesktopShell onReboot={() => setIsBooted(false)} />
              </WindowManagerProvider>
            </DesktopProvider>
          </FileSystemProvider>
        </NowPlayingProvider>
      </SystemStatusProvider>
    </SoundProvider>
  );
}

function DesktopShell({ onReboot }: { onReboot: () => void }) {
  const { playWindowOpen } = useSounds();
  return <DesktopContent onWindowOpen={playWindowOpen} onReboot={onReboot} />;
}

interface DesktopContentProps {
  onWindowOpen?: () => void;
  /** Replay the boot sequence (Apple menu Restart / power-on after Shut Down). */
  onReboot: () => void;
}

/** Map of desktop icon id → which app to open with what initial argument. */
const DESKTOP_ICON_TARGETS: Record<
  string,
  { appId: AppId; title?: string; arg?: string | null }
> = {
  "macintosh-hd": { appId: "finder", title: "Macintosh HD", arg: null },
  documents: { appId: "finder", title: "Documents", arg: "documents" },
  // The Projects folder opens the live GitHub repo browser.
  projects: { appId: "github", title: "Projects — GitHub" },
  resume: { appId: "pdfviewer", title: "Resume.pdf" },
  basketball: { appId: "basketball", title: "Basketball" },
  videos: { appId: "videos", title: "Videos" },
  rematch: { appId: "rematch", title: "Fighting Game" },
  arbhunter: { appId: "arbhunter", title: "Arb Hunter" },
  readme: { appId: "textedit", title: "README.txt", arg: "readme" },
};

function DesktopContent({ onWindowOpen, onReboot }: DesktopContentProps) {
  const {
    windows,
    activeWindowId,
    openWindow,
    focusWindow,
    closeWindow,
    minimizeWindow,
    getWindowsByApp,
    closeWindowsByApp,
  } = useWindowManager();
  const { setWallpaper } = useDesktop();
  const [activeApp, setActiveApp] = useState("Finder");
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [powerState, setPowerState] = useState<SystemPowerState>("on");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);

  // Cmd+Space toggles Spotlight.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.code === "Space") {
        e.preventDefault();
        setShowSpotlight((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Apps can launch other apps (e.g. Finder "Open in TextEdit"). They receive
  // an `openApp` callback that must call the latest openAppWindow without the
  // callback referencing itself before it's declared — route through a ref.
  const openAppWindowRef = useRef<AppLaunchContext["openApp"]>(() => {});
  const launchApp = useCallback<AppLaunchContext["openApp"]>(
    (...args) => openAppWindowRef.current(...args),
    [],
  );

  const openAppWindow = useCallback<AppLaunchContext["openApp"]>(
    (appId, customTitle, initialArg) => {
      const app = APPS[appId];
      if (!app) return;

      // Reuse an existing window if one is already open and no new initial arg
      // was supplied. Otherwise spawn a fresh window so e.g. "open Finder at
      // /documents" doesn't steal an existing finder pointed at /projects.
      const existing = getWindowsByApp(appId);
      if (existing.length > 0 && initialArg === undefined) {
        focusWindow(existing[0].id);
        setActiveApp(customTitle ?? app.label);
        return;
      }

      const title = customTitle ?? app.label;
      const screenWidth =
        typeof window !== "undefined" ? window.innerWidth : 1200;
      const screenHeight =
        typeof window !== "undefined" ? window.innerHeight : 800;
      const centerX =
        (screenWidth - app.defaultWidth) / 2 + (Math.random() - 0.5) * 60;
      const centerY =
        (screenHeight - app.defaultHeight) / 2 -
        40 +
        (Math.random() - 0.5) * 40;

      openWindow({
        id: `${appId}-${Date.now()}`,
        appId,
        title,
        icon: undefined,
        x: Math.max(50, centerX),
        y: Math.max(40, centerY),
        width: app.defaultWidth,
        height: app.defaultHeight,
        minWidth: app.minWidth,
        minHeight: app.minHeight,
        component: app.render({ initialArg, openApp: launchApp }),
      });
      onWindowOpen?.();
      setActiveApp(title);
    },
    [getWindowsByApp, focusWindow, openWindow, onWindowOpen, launchApp],
  );

  // Keep the ref pointed at the latest openAppWindow so launchApp stays current.
  useEffect(() => {
    openAppWindowRef.current = openAppWindow;
  }, [openAppWindow]);

  const handleDockItemClick = useCallback(
    (id: string) => openAppWindow(id as AppId),
    [openAppWindow],
  );

  const handleQuitApp = useCallback(
    (id: string) => closeWindowsByApp(id),
    [closeWindowsByApp],
  );

  const handleShowInFinder = useCallback(
    () => openAppWindow("finder", "Applications", null),
    [openAppWindow],
  );

  const handleDesktopIconOpen = useCallback(
    (id: string) => {
      const target = DESKTOP_ICON_TARGETS[id];
      if (!target) return;
      openAppWindow(target.appId, target.title, target.arg);
    },
    [openAppWindow],
  );

  const handleSpotlightOpenApp = useCallback(
    (appId: string) => openAppWindow(appId as AppId),
    [openAppWindow],
  );

  const closeAllWindows = useCallback(() => {
    windows.forEach((w) => closeWindow(w.id));
  }, [windows, closeWindow]);

  // Apple menu power actions. Sleep blanks the screen until a click/keypress;
  // Restart replays the boot sequence; Shut Down powers "off" until the user
  // presses the on-screen power button.
  const handleSleep = useCallback(() => setPowerState("sleeping"), []);
  const handleRestart = useCallback(() => {
    closeAllWindows();
    onReboot();
  }, [closeAllWindows, onReboot]);
  const handleShutDown = useCallback(() => {
    closeAllWindows();
    setPowerState("off");
  }, [closeAllWindows]);
  const handleWake = useCallback(() => {
    const wasOff = powerState === "off";
    setPowerState("on");
    if (wasOff) onReboot();
  }, [powerState, onReboot]);

  // "New Window" opens another window of whichever app is frontmost
  // (Finder when nothing is focused). Passing null as the initial argument
  // forces a fresh window instead of refocusing the existing one.
  const handleNewWindow = useCallback(() => {
    const frontmostAppId =
      (windows.find((w) => w.id === activeWindowId)?.appId as AppId | undefined) ??
      "finder";
    openAppWindow(frontmostAppId, undefined, null);
  }, [windows, activeWindowId, openAppWindow]);

  const menuActions: MenuActions = {
    onAbout: () => setShowAboutDialog(true),
    onOpenApp: openAppWindow,
    onOpenFinderAt: (title, folderId) =>
      openAppWindow("finder", title, folderId),
    onNewWindow: handleNewWindow,
    onCloseWindow: activeWindowId
      ? () => closeWindow(activeWindowId)
      : undefined,
    onMinimizeWindow: activeWindowId
      ? () => minimizeWindow(activeWindowId)
      : undefined,
    onMinimizeAll: () => windows.forEach((w) => minimizeWindow(w.id)),
    onBringAllToFront: () => windows.forEach((w) => focusWindow(w.id)),
    onFocusWindow: focusWindow,
    onSpotlight: () => setShowSpotlight(true),
    onSleep: handleSleep,
    onRestart: handleRestart,
    onShutDown: handleShutDown,
  };

  const hideContextMenu = useCallback(() => setContextMenu(null), []);

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const wallpaperKeys = Object.keys(WALLPAPERS) as WallpaperKey[];
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "New Folder", icon: "📁" },
          { label: "New File", icon: "📄" },
          { divider: true, label: "" },
          { label: "Get Info", icon: "ℹ️", disabled: true },
          { divider: true, label: "" },
          ...wallpaperKeys.map((key) => ({
            label: `Wallpaper: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            icon: "🖼️",
            action: () => setWallpaper(key),
          })),
          { divider: true, label: "" },
          { label: "Clean Up" },
          { label: "Sort By", disabled: true },
        ],
      });
    },
    [setWallpaper],
  );

  const handleIconContextMenu = useCallback(
    (e: React.MouseEvent, icon: DesktopIconData) => {
      e.preventDefault();
      const isFolder = icon.type === "folder" || icon.type === "drive";
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Open", icon: "📂", action: () => handleDesktopIconOpen(icon.id) },
          { divider: true, label: "" },
          { label: "Get Info", icon: "ℹ️", shortcut: "⌘I" },
          { label: "Rename" },
          { label: "Duplicate", disabled: icon.type === "drive" },
          { divider: true, label: "" },
          ...(isFolder ? [{ label: "New Folder", icon: "📁" }, { divider: true, label: "" }] : []),
          {
            label: "Move to Trash",
            icon: "🗑️",
            danger: true,
            disabled: icon.type === "drive",
          },
        ],
      });
    },
    [handleDesktopIconOpen],
  );

  // Dock items derive from APPS; runningness is the only dynamic field.
  const runningApps = new Set(windows.map((w) => w.appId));
  const dockItems: DockItemData[] = DOCK_APPS.map((app) => ({
    id: app.id,
    icon: "", // legacy field; Dock renders <AppIcon appId={id}/>
    label: app.label,
    isRunning: runningApps.has(app.id),
  }));

  const desktopIcons: DesktopIconData[] = DEFAULT_DESKTOP_ICONS.map((icon) => ({
    ...icon,
    onOpen: () => handleDesktopIconOpen(icon.id),
  }));

  return (
    <>
      <MenuBar
        activeApp={activeApp}
        windows={windows.map((w) => ({ id: w.id, title: w.title, appId: w.appId }))}
        activeWindowId={activeWindowId}
        actions={menuActions}
      />

      <AboutThisMac
        isOpen={showAboutDialog}
        onClose={() => setShowAboutDialog(false)}
      />

      <Spotlight
        isOpen={showSpotlight}
        onClose={() => setShowSpotlight(false)}
        onOpenApp={handleSpotlightOpenApp}
        onOpenFile={handleDesktopIconOpen}
      />

      <main className="flex-1 relative" onClick={hideContextMenu}>
        <DesktopIcons
          icons={desktopIcons}
          onIconOpen={handleDesktopIconOpen}
          onIconContextMenu={handleIconContextMenu}
          onDesktopContextMenu={handleDesktopContextMenu}
        />
      </main>

      <Dock
        items={dockItems}
        onItemClick={handleDockItemClick}
        onQuitApp={handleQuitApp}
        onShowInFinder={handleShowInFinder}
      />

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

      <AnimatePresence>
        {powerState !== "on" && (
          <SystemOverlay state={powerState} onWake={handleWake} />
        )}
      </AnimatePresence>
    </>
  );
}
