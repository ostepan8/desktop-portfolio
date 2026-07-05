import { ATTACKS, FIGHTER_W } from "./constants";
import type { FightState, InputFrame } from "./types";

/**
 * CPU controller for player 2. Deliberately beatable: it telegraphs heavies
 * from range, sometimes forgets to block, and only "thinks" a few times a
 * second (decisions latch between think-ticks, like reaction time).
 */

const THINK_EVERY = 9; // ticks between decisions (~150ms reaction time)
const CLOSE = FIGHTER_W + ATTACKS.light.reach - 8;
const MID = CLOSE + 90;

interface CpuMemory {
  decision: InputFrame;
}

export function createCpuMemory(): CpuMemory {
  return { decision: { ...IDLE } };
}

const IDLE: InputFrame = {
  left: false,
  right: false,
  jump: false,
  light: false,
  heavy: false,
  block: false,
};

/**
 * Small deterministic PRNG from the sim tick so replays of the same fight
 * behave identically (and tests could assert on it).
 */
function chance(state: FightState, salt: number, p: number): boolean {
  const n = Math.sin(state.tick * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n) < p;
}

export function cpuInput(state: FightState, memory: CpuMemory): InputFrame {
  if (state.tick % THINK_EVERY !== 0) return memory.decision;

  const me = state.p2;
  const you = state.p1;
  const gap = Math.abs(you.x - me.x);
  const towards = you.x > me.x ? "right" : "left";
  const away = you.x > me.x ? "left" : "right";
  const next: InputFrame = { ...IDLE };

  const youAttacking = you.action === "light" || you.action === "heavy";

  if (youAttacking && gap < MID && chance(state, 1, 0.55)) {
    // Respect the opponent's offense — but not every time.
    next.block = true;
  } else if (gap <= CLOSE) {
    if (chance(state, 2, 0.5)) next.light = true;
    else if (chance(state, 3, 0.25)) next.heavy = true;
    else next[away] = true; // reposition
  } else if (gap <= MID) {
    if (chance(state, 4, 0.2)) next.heavy = true; // telegraphed poke
    else next[towards] = true;
    if (chance(state, 5, 0.08)) next.jump = true;
  } else {
    next[towards] = true;
    if (chance(state, 6, 0.05)) next.jump = true;
  }

  memory.decision = next;
  return next;
}
