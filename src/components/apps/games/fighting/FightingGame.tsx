"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARENA_H, ARENA_W, DT, PALETTES, STAGES } from "./constants";
import { EMPTY_INPUT, createFightState, stepFight } from "./engine";
import { cpuInput, createCpuMemory } from "./ai";
import { drawFight } from "./render";
import type { FightState, InputFrame } from "./types";

type Screen = "menu" | "fight" | "original";
type Mode = "cpu" | "versus";

/** The real 2022 game, vendored as static files (see public/fighting-game-2022). */
const ORIGINAL_GAME_URL = "/fighting-game-2022/index.html";

const P1_KEYS: Record<string, keyof InputFrame> = {
  KeyA: "left",
  KeyD: "right",
  KeyW: "jump",
  KeyS: "block",
  KeyF: "light",
  KeyG: "heavy",
};

const P2_KEYS: Record<string, keyof InputFrame> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "jump",
  ArrowDown: "block",
  KeyK: "light",
  KeyL: "heavy",
};

/**
 * Rematch — an homage to the Fighting-Game repo from 2022, rebuilt from
 * scratch: fixed-timestep engine, state-machine fighters, hand-drawn canvas
 * art instead of borrowed sprites.
 */
export function FightingGame() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("cpu");
  const [stageIndex, setStageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [matchOver, setMatchOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const stateRef = useRef<FightState>(createFightState());
  const cpuRef = useRef(createCpuMemory());
  // Edge-triggered actions (attack/jump) fire once per key press, not per
  // held frame — tracked as "pressed since last consumed tick".
  const pressedRef = useRef<Set<string>>(new Set());

  const startFight = useCallback((nextMode: Mode) => {
    stateRef.current = createFightState();
    cpuRef.current = createCpuMemory();
    setMode(nextMode);
    setMatchOver(false);
    setPaused(false);
    setScreen("fight");
  }, []);

  // Keyboard listeners live for the whole app lifetime.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // leave OS shortcuts alone
      // Don't steal keys the user is typing into another app's text field.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (P1_KEYS[e.code] || P2_KEYS[e.code]) e.preventDefault();
      if (!keysRef.current.has(e.code)) pressedRef.current.add(e.code);
      keysRef.current.add(e.code);
      if (e.code === "Escape") setPaused((p) => !p);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    const blur = () => {
      keysRef.current.clear();
      setPaused(true);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Fixed-timestep simulation + rAF render loop.
  useEffect(() => {
    if (screen !== "fight") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const readInput = (map: Record<string, keyof InputFrame>): InputFrame => {
      const input: InputFrame = { ...EMPTY_INPUT };
      for (const [code, key] of Object.entries(map)) {
        if (key === "light" || key === "heavy" || key === "jump") {
          if (pressedRef.current.has(code)) input[key] = true;
        } else if (keysRef.current.has(code)) {
          input[key] = true;
        }
      }
      return input;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      acc += Math.min(0.25, (now - last) / 1000); // clamp long tab-away gaps
      last = now;

      if (!paused) {
        while (acc >= DT) {
          const s = stateRef.current;
          const in1 = readInput(P1_KEYS);
          const in2 =
            mode === "versus" ? readInput(P2_KEYS) : cpuInput(s, cpuRef.current);
          pressedRef.current.clear();
          stepFight(s, in1, in2);
          acc -= DT;
          if (s.phase === "matchOver") setMatchOver(true);
        }
      } else {
        acc = 0;
      }

      drawFight(ctx, stateRef.current, STAGES[stageIndex]);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [screen, mode, paused, stageIndex]);

  if (screen === "menu") {
    return (
      <MainMenu
        stageIndex={stageIndex}
        onStage={setStageIndex}
        onStart={startFight}
        onPlayOriginal={() => setScreen("original")}
      />
    );
  }

  if (screen === "original") {
    return <OriginalGame onBack={() => setScreen("menu")} />;
  }

  return (
    <div className="relative h-full bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={ARENA_W}
        height={ARENA_H}
        className="max-w-full max-h-full aspect-video"
      />

      {paused && !matchOver && (
        <GameOverlay title="PAUSED">
          <OverlayButton onClick={() => setPaused(false)}>Resume</OverlayButton>
          <OverlayButton onClick={() => setScreen("menu")}>Main Menu</OverlayButton>
        </GameOverlay>
      )}

      {matchOver && (
        <GameOverlay title="">
          <OverlayButton onClick={() => startFight(mode)}>Rematch!</OverlayButton>
          <OverlayButton onClick={() => setScreen("menu")}>Main Menu</OverlayButton>
        </GameOverlay>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/35 font-mono whitespace-nowrap">
        P1: A D move · W jump · S block · F/G punch
        {mode === "versus" && "  |  P2: ← → ↑ ↓ · K/L punch"}
        {"  |  Esc pause"}
      </div>
    </div>
  );
}

interface MainMenuProps {
  stageIndex: number;
  onStage: (i: number) => void;
  onStart: (mode: Mode) => void;
  onPlayOriginal: () => void;
}

function MainMenu({ stageIndex, onStage, onStart, onPlayOriginal }: MainMenuProps) {
  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-[#0d0a1f] to-[#1e1033] flex flex-col items-center justify-center gap-6 p-8 font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white tracking-widest">
          REMATCH<span className="text-red-400">!</span>
        </h1>
        <p className="text-white/50 text-xs mt-2 max-w-sm">
          A from-scratch rebuild of the fighting game I made in 2022 — same
          spirit, zero borrowed sprites. The original is playable below.
        </p>
        <a
          href="https://github.com/ostepan8/Fighting-Game"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-[11px] text-purple-300 hover:text-purple-200 underline underline-offset-2"
        >
          2022 source on GitHub ↗
        </a>
      </div>

      {/* Fighter cards */}
      <div className="flex items-center gap-4">
        {PALETTES.map((pal, i) => (
          <div
            key={pal.name}
            className="w-28 rounded-xl border border-white/15 bg-white/5 p-3 text-center"
          >
            <div
              className="w-10 h-10 mx-auto rounded-full mb-2 border-2"
              style={{ backgroundColor: pal.gi, borderColor: pal.belt }}
            />
            <div className="text-xs text-white font-bold">{pal.name}</div>
            <div className="text-[10px] text-white/40">
              {i === 0 ? "P1" : "P2 / CPU"}
            </div>
          </div>
        ))}
      </div>

      {/* Stage select */}
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
          Stage
        </div>
        <div className="flex gap-2">
          {STAGES.map((stage, i) => (
            <button
              key={stage.id}
              onClick={() => onStage(i)}
              className={
                "px-3 py-2 rounded-lg text-xs border transition-colors " +
                (i === stageIndex
                  ? "border-purple-400 bg-purple-500/20 text-white"
                  : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10")
              }
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onStart("cpu")}
          className="px-6 py-3 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors"
        >
          VS CPU
        </button>
        <button
          onClick={() => onStart("versus")}
          className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition-colors"
        >
          2 PLAYERS
        </button>
      </div>

      <button
        onClick={onPlayOriginal}
        className="px-6 py-2.5 rounded-lg border border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 text-xs font-bold tracking-wider transition-colors"
      >
        🕹 PLAY THE 2022 ORIGINAL
      </button>
    </div>
  );
}

/**
 * The actual 2022 build, served untouched from public/fighting-game-2022 in
 * an iframe. It was laid out for a big desktop viewport, so the frame gets a
 * fixed-size stage inside a scrollable area.
 */
function OriginalGame({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#141414] border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors"
        >
          ← Back to Rematch!
        </button>
        <span className="text-[11px] text-white/40 font-mono truncate">
          Fighting-Game (2022) — served exactly as I wrote it in high school.
          Click inside first so it hears the keyboard.
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <iframe
          src={ORIGINAL_GAME_URL}
          title="Fighting-Game (2022)"
          // The 2022 layout assumes a ~1500px-wide desktop page; give it that
          // and let the app window scroll.
          className="border-0 bg-black"
          style={{ width: 1500, height: 900 }}
          allow="autoplay"
        />
      </div>
    </div>
  );
}

function GameOverlay({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
      {title && (
        <div className="text-2xl font-black text-white font-mono tracking-widest mb-2">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function OverlayButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-44 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-mono font-bold transition-colors"
    >
      {children}
    </button>
  );
}
