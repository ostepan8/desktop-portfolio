"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface NowPlayingTrack {
  title: string;
  /** Source app shown under the title, e.g. "Videos". */
  subtitle: string;
  isPlaying: boolean;
}

export interface NowPlayingControls {
  /** Toggle play/pause on the active media element. */
  toggle: () => void;
  /** Skip to the next item in the source app's playlist. */
  next: () => void;
}

interface NowPlayingContextType {
  track: NowPlayingTrack | null;
  controls: NowPlayingControls | null;
  setTrack: (track: NowPlayingTrack | null) => void;
  setControls: (controls: NowPlayingControls | null) => void;
}

const NowPlayingContext = createContext<NowPlayingContextType | null>(null);

export function useNowPlaying(): NowPlayingContextType {
  const context = useContext(NowPlayingContext);
  if (!context) {
    throw new Error("useNowPlaying must be used within NowPlayingProvider");
  }
  return context;
}

interface NowPlayingProviderProps {
  children: ReactNode;
}

/**
 * Bridges media apps (currently the Videos player) to the Control Center
 * "Now Playing" tile. The playing app publishes its current track and a pair
 * of transport controls; Control Center renders and drives them. If multiple
 * players are open the most recently mounted one wins.
 */
export function NowPlayingProvider({ children }: NowPlayingProviderProps) {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [controls, setControlsState] = useState<NowPlayingControls | null>(null);

  // Stable identity is load-bearing: players call setControls/setTrack from
  // effects that depend on them, so a fresh function per render would loop.
  const setControls = useCallback((next: NowPlayingControls | null) => {
    // Objects holding functions must go through the updater form, otherwise
    // useState would treat a bare function value as an updater callback.
    setControlsState(() => next);
  }, []);

  return (
    <NowPlayingContext.Provider
      value={{ track, controls, setTrack, setControls }}
    >
      {children}
    </NowPlayingContext.Provider>
  );
}
