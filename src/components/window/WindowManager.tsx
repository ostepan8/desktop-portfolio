"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
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
  component: ReactNode;
}

interface WindowManagerContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (config: Omit<WindowState, "isMinimized">) => void;
  closeWindow: (id: string) => void;
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

  const openWindow = useCallback((config: Omit<WindowState, "isMinimized">) => {
    const newWindow: WindowState = {
      ...config,
      isMinimized: false,
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

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      const remaining = windowOrder.filter((wId) => wId !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [activeWindowId, windowOrder]);

  const focusWindow = useCallback((id: string) => {
    setWindowOrder((prev) => [...prev.filter((wId) => wId !== id), id]);
    setActiveWindowId(id);
    // Restore if minimized
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: false } : w))
    );
  }, []);

  const getWindowsByApp = useCallback((appId: string) => {
    return windows.filter((w) => w.appId === appId);
  }, [windows]);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
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
                    title={w.title}
                    icon={w.icon}
                    initialX={w.x}
                    initialY={w.y}
                    initialWidth={w.width}
                    initialHeight={w.height}
                    minWidth={w.minWidth}
                    minHeight={w.minHeight}
                    isActive={activeWindowId === w.id}
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
