"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Z_INDEX } from "@/constants/layout";

/** Floor so the brightness slider can never black out the screen entirely. */
const MIN_BRIGHTNESS = 15;
const MAX_BRIGHTNESS = 100;
/** Opacity of the dimming overlay at minimum brightness. */
const MAX_DIM_OPACITY = 0.82;

export interface SystemStatus {
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  /** Focus / Do Not Disturb — shared between Control Center and Notification Center. */
  focusMode: boolean;
  /** Display brightness, MIN_BRIGHTNESS–100. Drives a screen-dimming overlay. */
  brightness: number;
}

interface SystemStatusContextType extends SystemStatus {
  setWifi: (on: boolean) => void;
  setBluetooth: (on: boolean) => void;
  setAirdrop: (on: boolean) => void;
  setFocusMode: (on: boolean) => void;
  setBrightness: (value: number) => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | null>(null);

export function useSystemStatus(): SystemStatusContextType {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error("useSystemStatus must be used within SystemStatusProvider");
  }
  return context;
}

interface SystemStatusProviderProps {
  children: ReactNode;
}

/**
 * Session-level "hardware" state for the fake macOS: Wi-Fi, Bluetooth, AirDrop,
 * Focus (DND), and display brightness. Brightness is real — the provider
 * renders a pointer-transparent black overlay above the whole desktop whose
 * opacity tracks the slider. Wi-Fi is real too: Safari refuses to load pages
 * while it's off.
 */
export function SystemStatusProvider({ children }: SystemStatusProviderProps) {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [brightness, setBrightnessRaw] = useState(MAX_BRIGHTNESS);

  const setBrightness = (value: number) => {
    setBrightnessRaw(
      Math.min(MAX_BRIGHTNESS, Math.max(MIN_BRIGHTNESS, Math.round(value))),
    );
  };

  const dimOpacity =
    ((MAX_BRIGHTNESS - brightness) / (MAX_BRIGHTNESS - MIN_BRIGHTNESS)) *
    MAX_DIM_OPACITY;

  return (
    <SystemStatusContext.Provider
      value={{
        wifi,
        bluetooth,
        airdrop,
        focusMode,
        brightness,
        setWifi,
        setBluetooth,
        setAirdrop,
        setFocusMode,
        setBrightness,
      }}
    >
      {children}
      {dimOpacity > 0 && (
        <div
          aria-hidden
          className="fixed inset-0 bg-black pointer-events-none transition-opacity duration-150"
          style={{ opacity: dimOpacity, zIndex: Z_INDEX.brightnessOverlay }}
        />
      )}
    </SystemStatusContext.Provider>
  );
}
