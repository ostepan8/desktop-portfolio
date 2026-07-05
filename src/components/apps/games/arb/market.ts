/**
 * Simulated two-way betting market for Arb Hunter.
 *
 * Every match has a hidden true probability that random-walks; each book
 * quotes decimal odds around it with vig and its own noise. Occasionally the
 * sim injects a genuine arbitrage window (books disagree enough that backing
 * both sides guarantees profit) which drifts closed within a few ticks.
 */

export const BOOKS = ["POLY", "PROPS", "HEDGE", "MOON"] as const;
export type Book = (typeof BOOKS)[number];

/** Cross-country matchups; CHI @ BOS is the hometown special. */
export const FIXTURES: readonly { home: string; away: string }[] = [
  { home: "BOS", away: "CHI" },
  { home: "LAL", away: "NYK" },
  { home: "DEN", away: "MIA" },
  { home: "MIL", away: "PHX" },
  { home: "CLE", away: "GSW" },
];

export interface Quote {
  home: number;
  away: number;
}

export interface Match {
  readonly id: number;
  readonly home: string;
  readonly away: string;
  /** Hidden true probability of a home win. */
  p: number;
  quotes: Record<Book, Quote>;
  /** Ticks a forced arb window stays open; 0 = no forced window. */
  arbTicks: number;
}

/** Fixed total stake committed per locked pair, in dollars. */
export const STAKE = 1000;
export const SESSION_SECONDS = 75;
export const TICK_MS = 600;

const VIG = 0.045;
const BOOK_NOISE = 0.035;
const DRIFT = 0.02;

function clampP(p: number): number {
  return Math.min(0.82, Math.max(0.18, p));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Decimal odds a book quotes for an outcome with believed probability q. */
function quoteFor(q: number): number {
  const priced = clampP(q) * (1 + VIG);
  return round2(Math.max(1.05, 1 / priced));
}

function freshQuotes(p: number): Record<Book, Quote> {
  const entries = BOOKS.map((book) => {
    const skew = (Math.random() - 0.5) * 2 * BOOK_NOISE;
    return [
      book,
      { home: quoteFor(p + skew), away: quoteFor(1 - p - skew) },
    ] as const;
  });
  return Object.fromEntries(entries) as Record<Book, Quote>;
}

export function createMarket(): Match[] {
  return FIXTURES.map((f, i) => {
    const p = 0.35 + Math.random() * 0.3;
    return {
      id: i,
      home: f.home,
      away: f.away,
      p,
      quotes: freshQuotes(p),
      arbTicks: 0,
    };
  });
}

/**
 * Advance the market one tick. `heat` ∈ [0,1] scales difficulty over the
 * session: faster drift, rarer and thinner arb windows late.
 */
export function tickMarket(matches: readonly Match[], heat: number): Match[] {
  const next = matches.map((m) => {
    const p = clampP(m.p + (Math.random() - 0.5) * DRIFT * (1 + heat));
    if (m.arbTicks > 0) {
      // Window drifting shut: nudge quotes back toward fair.
      return { ...m, p, arbTicks: m.arbTicks - 1, quotes: m.arbTicks === 1 ? freshQuotes(p) : m.quotes };
    }
    return { ...m, p, quotes: freshQuotes(p) };
  });

  // Maybe open one new arb window somewhere.
  const spawnChance = 0.35 - heat * 0.15;
  const idle = next.filter((m) => m.arbTicks === 0);
  if (idle.length > 0 && Math.random() < spawnChance) {
    const target = idle[Math.floor(Math.random() * idle.length)];
    const margin = 0.015 + Math.random() * (0.045 - heat * 0.02);
    const bookH = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    let bookA = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    if (bookA === bookH) bookA = BOOKS[(BOOKS.indexOf(bookH) + 1) % BOOKS.length];

    // Choose odds so 1/oH + 1/oA = 1 - margin, split around true p.
    const target1 = (1 - margin) * target.p;
    const target2 = (1 - margin) * (1 - target.p);
    const quotes: Record<Book, Quote> = { ...target.quotes };
    quotes[bookH] = { ...quotes[bookH], home: round2(1 / target1) };
    quotes[bookA] = { ...quotes[bookA], away: round2(1 / target2) };

    return next.map((m) =>
      m.id === target.id
        ? { ...m, quotes, arbTicks: 4 + Math.floor(Math.random() * 4) }
        : m,
    );
  }
  return next;
}

export interface PairResult {
  /** Sum of implied probabilities; < 1 means guaranteed profit. */
  impliedSum: number;
  /** Guaranteed P&L in dollars on STAKE with optimal split. */
  profit: number;
  isArb: boolean;
}

/** Evaluate backing home at oH and away at oA with STAKE split optimally. */
export function evalPair(oH: number, oA: number): PairResult {
  const impliedSum = 1 / oH + 1 / oA;
  const profit = Math.round(STAKE * (1 / impliedSum - 1));
  return { impliedSum, profit, isArb: impliedSum < 1 };
}

/** Best available (highest) odds per side across books — the scanner view. */
export function bestPair(m: Match): { sum: number; isArb: boolean } {
  const bestH = Math.max(...BOOKS.map((b) => m.quotes[b].home));
  const bestA = Math.max(...BOOKS.map((b) => m.quotes[b].away));
  const sum = 1 / bestH + 1 / bestA;
  return { sum, isArb: sum < 1 };
}
