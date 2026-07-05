import {
  AIR_DRIFT,
  ARENA_W,
  ATTACKS,
  BLOCK_FREEZE,
  CHIP_RATIO,
  DT,
  FIGHTER_H,
  FIGHTER_W,
  GRAVITY,
  GROUND_Y,
  HIT_FREEZE,
  HIT_SHAKE,
  INTRO_TICKS,
  JUMP_VELOCITY,
  MAX_HP,
  ROUND_OVER_TICKS,
  ROUND_SECONDS,
  TICK_RATE,
  WALK_SPEED,
  WINS_TO_TAKE_MATCH,
} from "./constants";
import type {
  Box,
  FightState,
  Fighter,
  FighterAction,
  InputFrame,
} from "./types";

/**
 * Deterministic fixed-timestep fight simulation.
 *
 * The FightState is owned and mutated *inside this module only* — the React
 * shell treats it as an opaque handle and reads it once per render frame.
 * Contained mutation keeps the 60hz tick allocation-free; nothing outside
 * the engine ever observes a partially-updated state.
 */

export function createFighter(x: number, facing: 1 | -1): Fighter {
  return {
    x,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing,
    hp: MAX_HP,
    action: "idle",
    actionTick: 0,
    attackLanded: false,
    grounded: true,
    hitstunTicks: 0,
  };
}

export function createFightState(): FightState {
  return {
    p1: createFighter(ARENA_W * 0.3, 1),
    p2: createFighter(ARENA_W * 0.7, -1),
    clock: ROUND_SECONDS * TICK_RATE,
    phase: "intro",
    phaseTick: INTRO_TICKS,
    wins1: 0,
    wins2: 0,
    roundWinner: 0,
    freeze: 0,
    shake: 0,
    tick: 0,
  };
}

function resetRound(s: FightState): void {
  s.p1 = createFighter(ARENA_W * 0.3, 1);
  s.p2 = createFighter(ARENA_W * 0.7, -1);
  s.clock = ROUND_SECONDS * TICK_RATE;
  s.phase = "intro";
  s.phaseTick = INTRO_TICKS;
  s.roundWinner = 0;
  s.freeze = 0;
  s.shake = 0;
}

/** Body-sized hurtbox around the fighter's feet anchor. */
export function hurtbox(f: Fighter): Box {
  return {
    x: f.x - FIGHTER_W / 2,
    y: f.y - FIGHTER_H,
    w: FIGHTER_W,
    h: FIGHTER_H,
  };
}

/** Live hitbox for the current attack, or null outside active frames. */
export function activeHitbox(f: Fighter): Box | null {
  if (f.action !== "light" && f.action !== "heavy") return null;
  const spec = ATTACKS[f.action];
  const t = f.actionTick;
  if (t < spec.startup || t >= spec.startup + spec.active) return null;
  const armY = f.y - FIGHTER_H * 0.68;
  const front = f.x + f.facing * (FIGHTER_W / 2);
  return {
    x: f.facing === 1 ? front : front - spec.reach,
    y: armY - 14,
    w: spec.reach,
    h: 28,
  };
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function setAction(f: Fighter, action: FighterAction): void {
  f.action = action;
  f.actionTick = 0;
  f.attackLanded = false;
}

/** Can the fighter act on new inputs this tick? */
function canAct(f: Fighter): boolean {
  return f.action === "idle" || f.action === "walk" || f.action === "jump";
}

function attackDuration(kind: "light" | "heavy"): number {
  const a = ATTACKS[kind];
  return a.startup + a.active + a.recovery;
}

function stepFighter(f: Fighter, input: InputFrame, opponent: Fighter): void {
  f.actionTick += 1;

  // Timed states resolve back to idle when they expire.
  if (f.action === "light" || f.action === "heavy") {
    if (f.actionTick >= attackDuration(f.action)) setAction(f, "idle");
  } else if (f.action === "hitstun") {
    if (f.actionTick >= f.hitstunTicks) setAction(f, "idle");
  }

  const acting = canAct(f);

  // Blocking: only from the ground, holds while the key is held.
  if (f.action === "block" && (!input.block || !f.grounded)) setAction(f, "idle");
  if (acting && input.block && f.grounded) setAction(f, "block");

  // Attacks.
  if (canAct(f) && f.action !== "block") {
    if (input.light) setAction(f, "light");
    else if (input.heavy) setAction(f, "heavy");
  }

  // Horizontal movement — free while idle/walk/jump, locked otherwise.
  const mobile = f.action === "idle" || f.action === "walk" || f.action === "jump";
  if (mobile) {
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const speed = f.grounded ? WALK_SPEED : AIR_DRIFT;
    f.vx = dir * speed;
    if (f.grounded) {
      if (dir !== 0 && f.action === "idle") setAction(f, "walk");
      if (dir === 0 && f.action === "walk") setAction(f, "idle");
      if (input.jump) {
        f.vy = JUMP_VELOCITY;
        f.grounded = false;
        setAction(f, "jump");
      }
    }
  } else if (f.grounded && f.action !== "hitstun") {
    f.vx = 0;
  }

  // Integrate.
  f.x += f.vx * DT;
  if (!f.grounded) {
    f.vy += GRAVITY * DT;
    f.y += f.vy * DT;
    if (f.y >= GROUND_Y) {
      f.y = GROUND_Y;
      f.vy = 0;
      f.grounded = true;
      if (f.action === "jump") setAction(f, "idle");
    }
  }

  // Hitstun knockback decays.
  if (f.action === "hitstun" && f.grounded) f.vx *= 0.86;

  // Stay in bounds.
  const half = FIGHTER_W / 2;
  f.x = Math.min(ARENA_W - half, Math.max(half, f.x));

  // Face the opponent unless mid-move.
  if (f.action === "idle" || f.action === "walk") {
    f.facing = opponent.x >= f.x ? 1 : -1;
  }
}

function resolveHit(s: FightState, attacker: Fighter, victim: Fighter): void {
  if (attacker.action !== "light" && attacker.action !== "heavy") return;
  if (attacker.attackLanded) return;
  const hb = activeHitbox(attacker);
  if (!hb || !overlaps(hb, hurtbox(victim))) return;

  attacker.attackLanded = true;
  const spec = ATTACKS[attacker.action];
  const blocked = victim.action === "block" && victim.facing !== attacker.facing;

  if (blocked) {
    victim.hp = Math.max(0, victim.hp - Math.ceil(spec.damage * CHIP_RATIO));
    victim.vx = attacker.facing * spec.knockback * 0.4;
    s.freeze = BLOCK_FREEZE;
    s.shake = HIT_SHAKE * 0.4;
    return;
  }

  victim.hp = Math.max(0, victim.hp - spec.damage);
  victim.vx = attacker.facing * spec.knockback;
  victim.hitstunTicks = spec.hitstun;
  setAction(victim, "hitstun");
  s.freeze = HIT_FREEZE;
  s.shake = HIT_SHAKE;
}

function endRound(s: FightState, winner: 0 | 1 | 2): void {
  s.roundWinner = winner;
  if (winner === 1) s.wins1 += 1;
  if (winner === 2) s.wins2 += 1;
  if (s.p1.hp === 0) setAction(s.p1, "ko");
  if (s.p2.hp === 0) setAction(s.p2, "ko");
  const matchDone =
    s.wins1 >= WINS_TO_TAKE_MATCH || s.wins2 >= WINS_TO_TAKE_MATCH;
  s.phase = matchDone ? "matchOver" : "roundOver";
  s.phaseTick = ROUND_OVER_TICKS;
}

/** Advance the simulation by exactly one 60hz tick. */
export function stepFight(s: FightState, in1: InputFrame, in2: InputFrame): void {
  s.tick += 1;
  s.shake *= 0.85;

  if (s.phase === "intro") {
    s.phaseTick -= 1;
    if (s.phaseTick <= 0) s.phase = "fighting";
    return;
  }
  if (s.phase === "roundOver") {
    s.phaseTick -= 1;
    // Let bodies settle (gravity) during the KO banner.
    stepFighter(s.p1, EMPTY_INPUT, s.p2);
    stepFighter(s.p2, EMPTY_INPUT, s.p1);
    if (s.phaseTick <= 0) resetRound(s);
    return;
  }
  if (s.phase === "matchOver") return;

  if (s.freeze > 0) {
    s.freeze -= 1;
    return;
  }

  stepFighter(s.p1, in1, s.p2);
  stepFighter(s.p2, in2, s.p1);
  resolveHit(s, s.p1, s.p2);
  resolveHit(s, s.p2, s.p1);

  s.clock -= 1;
  if (s.p1.hp === 0 || s.p2.hp === 0) {
    endRound(s, s.p1.hp === 0 ? (s.p2.hp === 0 ? 0 : 2) : 1);
  } else if (s.clock <= 0) {
    endRound(s, s.p1.hp === s.p2.hp ? 0 : s.p1.hp > s.p2.hp ? 1 : 2);
  }
}

export const EMPTY_INPUT: InputFrame = {
  left: false,
  right: false,
  jump: false,
  light: false,
  heavy: false,
  block: false,
};
