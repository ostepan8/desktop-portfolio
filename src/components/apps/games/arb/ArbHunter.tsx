"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  BOOKS,
  SESSION_SECONDS,
  TICK_MS,
  createMarket,
  evalPair,
  tickMarket,
  type Book,
  type Match,
} from "./market";

type Screen = "intro" | "playing" | "results";

interface Selection {
  matchId: number;
  book: Book;
  side: "home" | "away";
  odds: number;
}

interface Toast {
  id: number;
  text: string;
  good: boolean;
}

interface SessionStats {
  pnl: number;
  arbsHit: number;
  misses: number;
  bestMargin: number;
}

const FRESH_STATS: SessionStats = { pnl: 0, arbsHit: 0, misses: 0, bestMargin: 0 };

/**
 * Arb Hunter — spot the arbitrage before it drifts shut. Grew out of the
 * same itch as my polymarket-arb and arbitrage-sports-betting repos: when
 * two books disagree hard enough, backing both sides is free money.
 */
export function ArbHunter() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [matches, setMatches] = useState<Match[]>(() => createMarket());
  const [clock, setClock] = useState(SESSION_SECONDS);
  const [stats, setStats] = useState<SessionStats>(FRESH_STATS);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [highScore, setHighScore] = useLocalStorage<number>("arb-hunter-best", 0);
  const toastId = useRef(0);

  const start = useCallback(() => {
    setMatches(createMarket());
    setClock(SESSION_SECONDS);
    setStats(FRESH_STATS);
    setSelection(null);
    setToasts([]);
    setScreen("playing");
  }, []);

  // The market interval needs the current clock without re-subscribing.
  const clockRef = useRef(clock);
  useEffect(() => {
    clockRef.current = clock;
  }, [clock]);

  // Market ticks + countdown while playing.
  useEffect(() => {
    if (screen !== "playing") return;
    const market = setInterval(() => {
      setMatches((prev) => tickWithHeat(prev, clockRef.current));
    }, TICK_MS);
    const countdown = setInterval(() => {
      setClock((c) => {
        if (c <= 1) setScreen("results");
        return c - 1;
      });
    }, 1000);
    return () => {
      clearInterval(market);
      clearInterval(countdown);
    };
  }, [screen]);

  // Persist high score when a session ends.
  useEffect(() => {
    if (screen === "results" && stats.pnl > highScore) setHighScore(stats.pnl);
  }, [screen, stats.pnl, highScore, setHighScore]);

  const pushToast = useCallback((text: string, good: boolean) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-2), { id, text, good }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  const handleCell = useCallback(
    (match: Match, book: Book, side: "home" | "away") => {
      if (screen !== "playing") return;
      const odds = match.quotes[book][side];
      const pick: Selection = { matchId: match.id, book, side, odds };

      if (!selection || selection.matchId !== match.id || selection.side === side) {
        setSelection(pick); // first leg (or reselect)
        return;
      }

      // Second leg locked — evaluate the pair.
      const oH = side === "home" ? odds : selection.odds;
      const oA = side === "away" ? odds : selection.odds;
      const result = evalPair(oH, oA);
      setSelection(null);
      setStats((prev) => ({
        pnl: prev.pnl + result.profit,
        arbsHit: prev.arbsHit + (result.isArb ? 1 : 0),
        misses: prev.misses + (result.isArb ? 0 : 1),
        bestMargin: result.isArb
          ? Math.max(prev.bestMargin, 1 - result.impliedSum)
          : prev.bestMargin,
      }));
      const pct = (result.impliedSum * 100).toFixed(1);
      pushToast(
        result.isArb
          ? `ARB! ${pct}% implied → +$${result.profit}`
          : `${pct}% implied — that's the vig. −$${Math.abs(result.profit)}`,
        result.isArb,
      );
    },
    [screen, selection, pushToast],
  );

  if (screen === "intro") return <Intro highScore={highScore} onStart={start} />;
  if (screen === "results") {
    return (
      <Results
        stats={stats}
        highScore={highScore}
        onRestart={start}
        onMenu={() => setScreen("intro")}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#08090c] font-mono text-sm overflow-hidden">
      {/* Ticker header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-[#0d0f14] shrink-0">
        <span className="text-emerald-400 font-bold tracking-widest text-xs">
          ARB·HUNTER
        </span>
        <span className={"tabular-nums " + (stats.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
          P&L ${stats.pnl.toLocaleString()}
        </span>
        <span className="text-white/40 text-xs">
          {stats.arbsHit} arbs · {stats.misses} vigged
        </span>
        <span
          className={
            "ml-auto tabular-nums font-bold " +
            (clock <= 10 ? "text-red-400" : "text-white/80")
          }
        >
          0:{String(Math.max(0, clock)).padStart(2, "0")}
        </span>
      </div>

      {/* Odds board */}
      <div className="flex-1 overflow-auto p-3">
        <table className="w-full border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-white/35">
              <th className="text-left pl-2 font-medium">Matchup</th>
              {BOOKS.map((b) => (
                <th key={b} colSpan={2} className="font-medium">
                  {b}
                </th>
              ))}
            </tr>
            <tr className="text-[9px] text-white/25">
              <th />
              {BOOKS.map((b) => (
                <HomeAwayLabels key={b} />
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="bg-white/[0.03]">
                <td className="pl-2 pr-3 py-1.5 text-white/80 whitespace-nowrap rounded-l-lg">
                  {m.away} <span className="text-white/30">@</span> {m.home}
                </td>
                {BOOKS.map((book) => (
                  <OddsCells
                    key={book}
                    match={m}
                    book={book}
                    selection={selection}
                    onPick={handleCell}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[10px] text-white/30 mt-3 px-1">
          Pick one <span className="text-sky-300">HOME</span> price and one{" "}
          <span className="text-orange-300">AWAY</span> price on the same game.
          If 1/odds + 1/odds &lt; 100%, the ${"1,000"} is guaranteed profit —
          lock it before the books correct.
        </p>
      </div>

      {/* Toasts */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-1.5 items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "px-4 py-1.5 rounded-lg text-xs font-bold border backdrop-blur " +
              (t.good
                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                : "bg-red-500/20 border-red-400/40 text-red-300")
            }
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// Extracted so the market interval callback stays tiny and testable.
function tickWithHeat(prev: Match[], clock: number): Match[] {
  const heat = 1 - Math.max(0, clock) / SESSION_SECONDS;
  return tickMarket(prev, heat);
}

function HomeAwayLabels() {
  return (
    <>
      <th className="font-medium text-sky-300/60">H</th>
      <th className="font-medium text-orange-300/60">A</th>
    </>
  );
}

interface OddsCellsProps {
  match: Match;
  book: Book;
  selection: Selection | null;
  onPick: (match: Match, book: Book, side: "home" | "away") => void;
}

function OddsCells({ match, book, selection, onPick }: OddsCellsProps) {
  const quote = match.quotes[book];
  const render = (side: "home" | "away") => {
    const selected =
      selection?.matchId === match.id &&
      selection.book === book &&
      selection.side === side;
    const partnered =
      selection?.matchId === match.id && selection.side !== side && !selected;
    return (
      <td key={side} className="px-0.5">
        <button
          onClick={() => onPick(match, book, side)}
          className={
            "w-14 py-1.5 rounded-md tabular-nums text-xs transition-colors border " +
            (selected
              ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
              : partnered
                ? "bg-white/10 border-white/25 text-white hover:bg-emerald-500/20"
                : "bg-white/[0.04] border-transparent text-white/75 hover:bg-white/10")
          }
        >
          {quote[side].toFixed(2)}
        </button>
      </td>
    );
  };
  return (
    <>
      {render("home")}
      {render("away")}
    </>
  );
}

function Intro({ highScore, onStart }: { highScore: number; onStart: () => void }) {
  return (
    <div className="h-full overflow-auto bg-[#08090c] flex flex-col items-center justify-center gap-5 p-8 font-mono text-center">
      <h1 className="text-3xl font-black text-emerald-400 tracking-widest">
        ARB·HUNTER
      </h1>
      <p className="text-white/60 text-xs max-w-md leading-relaxed">
        Four books quote every game. Most of the time their prices agree and
        you&apos;re just paying vig — but when they diverge enough that the
        implied probabilities sum under 100%, backing both sides is
        risk-free profit. Find those pairs. Lock both legs. Beat the correction.
      </p>
      <p className="text-white/35 text-[11px] max-w-md">
        Built from the same obsession as my{" "}
        <a
          href="https://github.com/ostepan8/polymarket-arb"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-300 underline underline-offset-2"
        >
          polymarket-arb
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/ostepan8/arbitrage-sports-betting"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-300 underline underline-offset-2"
        >
          arbitrage-sports-betting
        </a>{" "}
        repos — except this market is rigged to be beatable.
      </p>
      {highScore > 0 && (
        <div className="text-xs text-white/50">
          Best session: <span className="text-emerald-400">${highScore.toLocaleString()}</span>
        </div>
      )}
      <button
        onClick={onStart}
        className="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-black tracking-widest transition-colors"
      >
        OPEN THE BOOKS
      </button>
    </div>
  );
}

interface ResultsProps {
  stats: SessionStats;
  highScore: number;
  onRestart: () => void;
  onMenu: () => void;
}

function Results({ stats, highScore, onRestart, onMenu }: ResultsProps) {
  const isRecord = stats.pnl >= highScore && stats.pnl > 0;
  return (
    <div className="h-full overflow-auto bg-[#08090c] flex flex-col items-center justify-center gap-4 p-8 font-mono text-center">
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        Market closed
      </div>
      <div
        className={
          "text-4xl font-black tabular-nums " +
          (stats.pnl >= 0 ? "text-emerald-400" : "text-red-400")
        }
      >
        {stats.pnl >= 0 ? "+" : "−"}${Math.abs(stats.pnl).toLocaleString()}
      </div>
      {isRecord && (
        <div className="text-xs text-amber-300 font-bold">NEW BEST SESSION</div>
      )}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <Stat label="Arbs locked" value={String(stats.arbsHit)} />
        <Stat label="Vig paid" value={String(stats.misses)} />
        <Stat
          label="Best margin"
          value={`${(stats.bestMargin * 100).toFixed(1)}%`}
        />
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black tracking-widest transition-colors"
        >
          RUN IT BACK
        </button>
        <button
          onClick={onMenu}
          className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
        >
          MENU
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
      <div className="text-white font-bold">{value}</div>
      <div className="text-white/40 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}
