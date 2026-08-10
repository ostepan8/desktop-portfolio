"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { WINDOW_DEFAULTS } from "@/constants/layout";
import {
  getViewportSize,
  placeNewWindow,
  type Rect,
} from "@/lib/window-geometry";
import { Window } from "./Window";

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  /** Placement resolved at open time — see {@link placeNewWindow}. */
  rect: Rect;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMinimizing: boolean;
  component: ReactNode;
}

/**
 * What a caller asks for when opening a window. Size is a *preference*: the
 * manager shrinks it to fit the current desktop and picks the position, so no
 * app can open larger than the screen or land underneath the dock.
 */
export interface OpenWindowRequest {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  preferredWidth: number;
  preferredHeight: number;
  minWidth?: number;
  minHeight?: number;
  component: ReactNode;
}

interface WindowManagerContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (request: OpenWindowRequest) => void;
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

  // Cascade counter for auto-placement. Reset once the desktop is empty so a
  // fresh run of windows starts from the centre again instead of drifting.
  const cascadeIndexRef = useRef(0);

  const openWindow = useCallback((request: OpenWindowRequest) => {
    const minWidth = request.minWidth ?? WINDOW_DEFAULTS.MIN_WIDTH;
    const minHeight = request.minHeight ?? WINDOW_DEFAULTS.MIN_HEIGHT;
    const rect = placeNewWindow(
      cascadeIndexRef.current,
      { width: request.preferredWidth, height: request.preferredHeight },
      { width: minWidth, height: minHeight },
      getViewportSize(),
    );
    cascadeIndexRef.current += 1;

    const newWindow: WindowState = {
      id: request.id,
      appId: request.appId,
      title: request.title,
      icon: request.icon,
      component: request.component,
      rect,
      minWidth,
      minHeight,
      isMinimized: false,
      isMinimizing: false,
    };
    setWindows((prev) => [...prev, newWindow]);
    setWindowOrder((prev) => [...prev, request.id]);
    setActiveWindowId(request.id);
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const next = prev.filter((w) => w.id !== id);
      if (next.length === 0) cascadeIndexRef.current = 0;
      return next;
    });
    setWindowOrder((prev) => prev.filter((wId) => wId !== id));
    if (activeWindowId === id) {
      const remaining = windowOrder.filter((wId) => wId !== id);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  }, [activeWindowId, windowOrder]);

  const closeWindowsByApp = useCallback((appId: string) => {
    const windowsToClose = windows.filter((w) => w.appId === appId).map((w) => w.id);
    setWindows((prev) => {
      const next = prev.filter((w) => w.appId !== appId);
      if (next.length === 0) cascadeIndexRef.current = 0;
      return next;
    });
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
                    initialRect={w.rect}
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
