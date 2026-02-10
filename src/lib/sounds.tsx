"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface SoundContextType {
  isMuted: boolean;
  volume: number;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  playStartup: () => void;
  playWindowOpen: () => void;
  playWindowClose: () => void;
  playError: () => void;
  playClick: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function useSounds() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSounds must be used within SoundProvider");
  }
  return context;
}

// Web Audio API sound generator
class SoundGenerator {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Mac startup chime - simplified version
  playStartup(volume: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Create a chord (F major-ish)
    const frequencies = [349.23, 440, 523.25, 698.46]; // F4, A4, C5, F5

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05);
      gain.gain.linearRampToValueAtTime(volume * 0.1, now + 0.3);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.02);
      osc.stop(now + 1.5);
    });
  }

  // Window open sound - quick ascending tone
  playWindowOpen(volume: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);

    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Window close sound - quick descending tone
  playWindowClose(volume: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.1);

    gain.gain.setValueAtTime(volume * 0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Error beep - classic Mac error sound
  playError(volume: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Two quick beeps
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.value = 800;

      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.08, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  }

  // UI click sound
  playClick(volume: number) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 1000;

    gain.gain.setValueAtTime(volume * 0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

const soundGenerator = typeof window !== "undefined" ? new SoundGenerator() : null;

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isMuted, setIsMuted] = useState(true); // Muted by default
  const [volume, setVolume] = useState(0.5);

  // Load preferences from localStorage
  useEffect(() => {
    const savedMuted = localStorage.getItem("sound-muted");
    const savedVolume = localStorage.getItem("sound-volume");

    if (savedMuted !== null) {
      setIsMuted(savedMuted === "true");
    }
    if (savedVolume !== null) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("sound-muted", String(isMuted));
    localStorage.setItem("sound-volume", String(volume));
  }, [isMuted, volume]);

  const playStartup = useCallback(() => {
    if (!isMuted && soundGenerator) {
      soundGenerator.playStartup(volume);
    }
  }, [isMuted, volume]);

  const playWindowOpen = useCallback(() => {
    if (!isMuted && soundGenerator) {
      soundGenerator.playWindowOpen(volume);
    }
  }, [isMuted, volume]);

  const playWindowClose = useCallback(() => {
    if (!isMuted && soundGenerator) {
      soundGenerator.playWindowClose(volume);
    }
  }, [isMuted, volume]);

  const playError = useCallback(() => {
    if (!isMuted && soundGenerator) {
      soundGenerator.playError(volume);
    }
  }, [isMuted, volume]);

  const playClick = useCallback(() => {
    if (!isMuted && soundGenerator) {
      soundGenerator.playClick(volume);
    }
  }, [isMuted, volume]);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        volume,
        setMuted: setIsMuted,
        setVolume,
        playStartup,
        playWindowOpen,
        playWindowClose,
        playError,
        playClick,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}
