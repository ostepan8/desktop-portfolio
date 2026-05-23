"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { Window } from "./Window";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMinimizing: boolean;
  component: ReactNode;
}

interface WindowManagerContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (config: Omit<WindowState, "isMinimized" | "isMinimizing">) => void;
  closeWindow: (id: string) => void;
  closeWindowsByApp: (appId: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  getWindowsByApp: (appId: string) => WindowState[];
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  }
  return context;
}

interface WindowManagerProviderProps {
  children: ReactNode;
}

export function WindowManagerProvider({ children }: WindowManagerProviderProps) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [windowOrder, setWindowOrder] = useState<string[]>([]);

  const openWindow = useCallback((config: Omit<WindowState, "isMinimized" | "isMinimizing">) => {
    const newWindow: WindowState = {
      ...config,
      isMinimized: false,
      isMinimizing: false,
    };
    setWindows((prev) => [...prev, newWindow]);
    setWindowOrder((prev) => [...prev, config.id]);
    setActiveWindowId(config.id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setWindowOrder((prev) => prev.filter((wId) => wId !== id));
    if (activeWindowId === id) {
      const remaining = windowOrder.filter((wId) => wId !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [activeWindowId, windowOrder]);

  const closeWindowsByApp = useCallback((appId: string) => {
    const windowsToClose = windows.filter((w) => w.appId === appId).map((w) => w.id);
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
    setWindowOrder((prev) => prev.filter((wId) => !windowsToClose.includes(wId)));
    if (activeWindowId && windowsToClose.includes(activeWindowId)) {
      const remaining = windowOrder.filter((wId) => !windowsToClose.includes(wId));
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [windows, activeWindowId, windowOrder]);

  const minimizeWindow = useCallback((id: string) => {
    // First, trigger the minimizing animation
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimizing: true } : w))
    );

    // Update active window immediately
    if (activeWindowId === id) {
      const remaining = windowOrder.filter((wId) => wId !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }

    // After animation duration, actually minimize the window
    setTimeout(() => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isMinimized: true, isMinimizing: false } : w))
      );
    }, 400); // Match animation duration
  }, [activeWindowId, windowOrder]);

  const focusWindow = useCallback((id: string) => {
    setWindowOrder((prev) => [...prev.filter((wId) => wId !== id), id]);
    setActiveWindowId(id);
    // Restore if minimized
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: false, isMinimizing: false } : w))
    );
  }, []);

  const getWindowsByApp = useCallback((appId: string) => {
    return windows.filter((w) => w.appId === appId);
  }, [windows]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Meta (Cmd) key is pressed
      if (!e.metaKey) return;

      // Cmd+W - Close active window
      if (e.key === "w" && activeWindowId) {
        e.preventDefault();
        closeWindow(activeWindowId);
      }

      // Cmd+M - Minimize active window
      if (e.key === "m" && activeWindowId) {
        e.preventDefault();
        minimizeWindow(activeWindowId);
      }

      // Cmd+` - Cycle through windows
      if (e.key === "`" && windows.length > 1) {
        e.preventDefault();
        const visibleWindows = windows.filter((w) => !w.isMinimized);
        if (visibleWindows.length > 1) {
          const currentIndex = visibleWindows.findIndex((w) => w.id === activeWindowId);
          const nextIndex = (currentIndex + 1) % visibleWindows.length;
          focusWindow(visibleWindows[nextIndex].id);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, windows, closeWindow, minimizeWindow, focusWindow]);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        closeWindowsByApp,
        minimizeWindow,
        focusWindow,
        getWindowsByApp,
      }}
    >
      {children}
      
      {/* Render windows */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {windows
            .filter((w) => !w.isMinimized)
            .map((w) => {
              const zIndex = windowOrder.indexOf(w.id) + 10;
              return (
                <div
                  key={w.id}
                  className="pointer-events-auto"
                  style={{ zIndex }}
                >
                  <Window
                    id={w.id}
                    appId={w.appId}
                    title={w.title}
                    icon={w.icon}
                    initialX={w.x}
                    initialY={w.y}
                    initialWidth={w.width}
                    initialHeight={w.height}
                    minWidth={w.minWidth}
                    minHeight={w.minHeight}
                    isActive={activeWindowId === w.id}
                    isMinimizing={w.isMinimizing}
                    onClose={() => closeWindow(w.id)}
                    onMinimize={() => minimizeWindow(w.id)}
                    onFocus={() => focusWindow(w.id)}
                  >
                    {w.component}
                  </Window>
                </div>
              );
            })}
        </AnimatePresence>
      </div>
    </WindowManagerContext.Provider>
  );
}
