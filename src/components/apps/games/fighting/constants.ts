import type { AttackSpec, StageSpec } from "./types";

/** Internal simulation resolution; the canvas letterboxes to fit the window. */
export const ARENA_W = 960;
export const ARENA_H = 540;
export const GROUND_Y = 470;

/** Simulation runs at a fixed 60hz regardless of display refresh rate. */
export const TICK_RATE = 60;
export const DT = 1 / TICK_RATE;

// Movement tuning. Values are px/s (or px/s² for gravity) at 1x world scale.
export const WALK_SPEED = 290;
export const JUMP_VELOCITY = -820;
export const GRAVITY = 2400;
/** Horizontal drift allowed while airborne, px/s. */
export const AIR_DRIFT = 200;

export const FIGHTER_W = 56;
export const FIGHTER_H = 122;
export const MAX_HP = 100;
export const ROUND_SECONDS = 60;
export const WINS_TO_TAKE_MATCH = 2;

/** Ticks both fighters freeze when a hit connects — classic hit pause. */
export const HIT_FREEZE = 7;
export const BLOCK_FREEZE = 3;
/** Shake added to the camera on hit, px. */
export const HIT_SHAKE = 7;
/** Fraction of damage that leaks through a block. */
export const CHIP_RATIO = 0.15;

export const ATTACKS: Record<"light" | "heavy", AttackSpec> = {
  light: {
    startup: 5,
    active: 4,
    recovery: 9,
    damage: 6,
    knockback: 160,
    hitstun: 14,
    reach: 52,
  },
  heavy: {
    startup: 13,
    active: 5,
    recovery: 18,
    damage: 13,
    knockback: 330,
    hitstun: 24,
    reach: 68,
  },
};

/** Ticks for phase banners. */
export const INTRO_TICKS = 90; // "ROUND 1 ... FIGHT!"
export const ROUND_OVER_TICKS = 120; // "KO!" / "TIME!"

export interface FighterPalette {
  readonly name: string;
  readonly gi: string;
  readonly giShade: string;
  readonly skin: string;
  readonly belt: string;
  readonly glove: string;
}

/**
 * Original characters (the 2022 game borrowed Ryu/Ken/Goku sprites — these
 * two are drawn from scratch instead).
 */
export const PALETTES: readonly [FighterPalette, FighterPalette] = [
  {
    name: "COLONEL",
    gi: "#2563eb",
    giShade: "#1e40af",
    skin: "#e8b98a",
    belt: "#0f172a",
    glove: "#ef4444",
  },
  {
    name: "MAROON",
    gi: "#b91c1c",
    giShade: "#7f1d1d",
    skin: "#c98d5e",
    belt: "#fbbf24",
    glove: "#2563eb",
  },
];

/** Stage names nod to the 2022 original's "Haunted Forrest" and "Old York". */
export const STAGES: readonly StageSpec[] = [
  {
    id: "forest",
    name: "Haunted Forest",
    sky: ["#1a1033", "#43265e"],
    floor: "#241a2e",
    silhouette: "#120b20",
    backdrop: "trees",
  },
  {
    id: "york",
    name: "Old York",
    sky: ["#0b1d3a", "#c2571f"],
    floor: "#1c1a24",
    silhouette: "#0d1526",
    backdrop: "skyline",
  },
];
