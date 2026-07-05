/** One player's inputs for a single simulation tick. */
export interface InputFrame {
  left: boolean;
  right: boolean;
  jump: boolean;
  light: boolean;
  heavy: boolean;
  block: boolean;
}

export type FighterAction =
  | "idle"
  | "walk"
  | "jump"
  | "light"
  | "heavy"
  | "block"
  | "hitstun"
  | "ko";

export interface AttackSpec {
  /** Ticks before the hitbox comes out. */
  readonly startup: number;
  /** Ticks the hitbox is live. */
  readonly active: number;
  /** Ticks of recovery after the hitbox ends. */
  readonly recovery: number;
  readonly damage: number;
  /** Horizontal shove applied to the victim, px/s. */
  readonly knockback: number;
  /** Ticks the victim is stuck in hitstun. */
  readonly hitstun: number;
  /** Hitbox reach beyond the fist, px. */
  readonly reach: number;
}

export interface Fighter {
  /** Center-x, feet-y in world px. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** +1 faces right, -1 faces left. */
  facing: 1 | -1;
  hp: number;
  action: FighterAction;
  /** Ticks spent in the current action. */
  actionTick: number;
  /** Set once an attack has connected so it can't multi-hit. */
  attackLanded: boolean;
  grounded: boolean;
  /** How long the current hitstun lasts; set when a hit lands. */
  hitstunTicks: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type RoundPhase = "intro" | "fighting" | "roundOver" | "matchOver";

export interface FightState {
  p1: Fighter;
  p2: Fighter;
  /** Round clock in ticks, counts down. */
  clock: number;
  phase: RoundPhase;
  /** Ticks remaining in the current phase transition (intro/round-over). */
  phaseTick: number;
  wins1: number;
  wins2: number;
  /** 0 = none; winner of the round/match for banners. */
  roundWinner: 0 | 1 | 2;
  /** Global freeze ticks after a hit lands (hit pause). */
  freeze: number;
  /** Screen shake magnitude in px, decays each tick. */
  shake: number;
  /** Monotonic tick counter (drives AI decisions + animation). */
  tick: number;
}

export interface StageSpec {
  readonly id: string;
  readonly name: string;
  /** Sky gradient stops, top → horizon. */
  readonly sky: readonly [string, string];
  readonly floor: string;
  readonly silhouette: string;
  /** "trees" | "skyline" — which backdrop shapes to draw. */
  readonly backdrop: "trees" | "skyline";
}
