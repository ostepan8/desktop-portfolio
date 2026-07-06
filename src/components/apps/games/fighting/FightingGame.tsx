"use client";

import { useRef } from "react";

/** The 2022 game, vendored as static files (see public/fighting-game-2022). */
const GAME_URL = "/fighting-game-2022/index.html";

/**
 * Fighting Game — launches straight into the real 2022 build. The game
 * renders into a fixed 1024x576 stage that scales itself to fit the window,
 * so this component is just a blurb bar over a full-bleed iframe.
 */
export function FightingGame() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex items-baseline gap-2 px-3 py-1.5 bg-[#141414] border-b border-white/10 shrink-0 font-mono">
        <span className="text-[11px] text-amber-300 font-bold whitespace-nowrap">
          FIGHTING GAME (2022)
        </span>
        <span className="text-[11px] text-white/45 truncate">
          Vanilla JS + canvas, built in high school. Remastered in 2026 — the
          UI was rebuilt to scale to any screen; the game code underneath is
          untouched. Click in, pick Ryu, Ken, or Goku.
        </span>
        <a
          href="https://github.com/ostepan8/Fighting-Game"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[11px] text-purple-300 hover:text-purple-200 underline underline-offset-2 whitespace-nowrap"
        >
          source ↗
        </a>
      </div>
      <iframe
        ref={frameRef}
        src={GAME_URL}
        title="Fighting Game (2022)"
        className="flex-1 w-full border-0 bg-black"
        allow="autoplay"
        // Same-origin frame: hand it keyboard focus as soon as it loads so
        // the game's key listeners work without an extra click.
        onLoad={() => frameRef.current?.contentWindow?.focus()}
      />
    </div>
  );
}
