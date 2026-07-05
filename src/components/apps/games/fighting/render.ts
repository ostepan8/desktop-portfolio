import {
  ARENA_H,
  ARENA_W,
  FIGHTER_H,
  FIGHTER_W,
  GROUND_Y,
  MAX_HP,
  PALETTES,
  TICK_RATE,
  WINS_TO_TAKE_MATCH,
  type FighterPalette,
} from "./constants";
import type { FightState, Fighter, StageSpec } from "./types";

/** Full-frame draw. Pure read of the sim state; owns no state of its own. */
export function drawFight(
  ctx: CanvasRenderingContext2D,
  s: FightState,
  stage: StageSpec,
): void {
  ctx.save();
  if (s.shake > 0.5) {
    ctx.translate(
      (Math.sin(s.tick * 3.7) * s.shake) | 0,
      (Math.cos(s.tick * 4.3) * s.shake * 0.6) | 0,
    );
  }

  drawStage(ctx, stage, s.tick);
  drawFighter(ctx, s.p1, PALETTES[0], s.tick);
  drawFighter(ctx, s.p2, PALETTES[1], s.tick);
  drawHud(ctx, s);
  drawBanners(ctx, s);

  ctx.restore();
}

function drawStage(
  ctx: CanvasRenderingContext2D,
  stage: StageSpec,
  tick: number,
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.sky[0]);
  sky.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, ARENA_W, GROUND_Y);

  // Moon drifts very slowly — cheap parallax life.
  ctx.fillStyle = "rgba(255,255,240,0.85)";
  ctx.beginPath();
  ctx.arc(ARENA_W - 140 - (tick * 0.01) % 40, 90, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = stage.silhouette;
  if (stage.backdrop === "trees") {
    for (let i = 0; i < 12; i++) {
      const x = i * 88 + 20;
      const h = 120 + ((i * 53) % 70);
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 26, GROUND_Y - h);
      ctx.lineTo(x + 52, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    }
  } else {
    for (let i = 0; i < 10; i++) {
      const x = i * 100;
      const h = 90 + ((i * 97) % 130);
      ctx.fillRect(x, GROUND_Y - h, 74, h);
      // Lit windows.
      ctx.fillStyle = "rgba(255,200,80,0.5)";
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 2; wx++) {
          if ((i + wx + wy) % 3 === 0) {
            ctx.fillRect(x + 14 + wx * 30, GROUND_Y - h + 18 + wy * 28, 12, 14);
          }
        }
      }
      ctx.fillStyle = stage.silhouette;
    }
  }

  ctx.fillStyle = stage.floor;
  ctx.fillRect(0, GROUND_Y, ARENA_W, ARENA_H - GROUND_Y);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 0.5);
  ctx.lineTo(ARENA_W, GROUND_Y + 0.5);
  ctx.stroke();
}

function drawFighter(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  pal: FighterPalette,
  tick: number,
): void {
  const ko = f.action === "ko";
  const w = FIGHTER_W;
  const h = FIGHTER_H;

  // Ground shadow.
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(f.x, GROUND_Y + 8, w * 0.7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.facing, 1);

  if (ko) {
    // Laid out flat.
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, h * 0.3);
  } else if (f.action === "hitstun") {
    ctx.rotate(-0.18);
  } else if (f.action === "walk") {
    ctx.rotate(Math.sin(tick * 0.35) * 0.03); // subtle bob
  }

  const bodyTop = -h;
  const torsoY = bodyTop + h * 0.32;
  const torsoH = h * 0.42;

  // Legs.
  const stride = f.action === "walk" ? Math.sin(tick * 0.35) * 10 : 0;
  ctx.strokeStyle = pal.giShade;
  ctx.lineWidth = 13;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, torsoY + torsoH - 6);
  ctx.lineTo(-10 - stride, -4);
  ctx.moveTo(8, torsoY + torsoH - 6);
  ctx.lineTo(10 + stride, -4);
  ctx.stroke();

  // Torso gi.
  ctx.fillStyle = pal.gi;
  roundRect(ctx, -w / 2 + 6, torsoY, w - 12, torsoH, 10);
  ctx.fill();
  // Belt.
  ctx.fillStyle = pal.belt;
  ctx.fillRect(-w / 2 + 6, torsoY + torsoH - 12, w - 12, 8);

  // Arms — pose depends on action.
  ctx.strokeStyle = pal.gi;
  ctx.lineWidth = 11;
  const shoulderY = torsoY + 12;
  if (f.action === "light" || f.action === "heavy") {
    const punch = f.action === "heavy" ? 1 : 0.75;
    // Extended arm with glove.
    ctx.beginPath();
    ctx.moveTo(4, shoulderY + 8);
    ctx.lineTo(w * 0.55 + 30 * punch, shoulderY + 4);
    ctx.stroke();
    ctx.fillStyle = pal.glove;
    ctx.beginPath();
    ctx.arc(w * 0.55 + 34 * punch, shoulderY + 4, 9, 0, Math.PI * 2);
    ctx.fill();
    // Rear guard arm.
    ctx.beginPath();
    ctx.moveTo(-6, shoulderY + 10);
    ctx.lineTo(-16, shoulderY + 26);
    ctx.stroke();
  } else if (f.action === "block") {
    ctx.beginPath();
    ctx.moveTo(6, shoulderY + 22);
    ctx.lineTo(20, shoulderY - 4);
    ctx.moveTo(-2, shoulderY + 26);
    ctx.lineTo(14, shoulderY + 4);
    ctx.stroke();
    ctx.fillStyle = pal.glove;
    ctx.beginPath();
    ctx.arc(21, shoulderY - 6, 8, 0, Math.PI * 2);
    ctx.arc(15, shoulderY + 2, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Guard stance, slight idle sway.
    const sway = Math.sin(tick * 0.1) * 2;
    ctx.beginPath();
    ctx.moveTo(6, shoulderY + 8);
    ctx.lineTo(22, shoulderY + 18 + sway);
    ctx.moveTo(-6, shoulderY + 10);
    ctx.lineTo(-18, shoulderY + 24 - sway);
    ctx.stroke();
    ctx.fillStyle = pal.glove;
    ctx.beginPath();
    ctx.arc(24, shoulderY + 20 + sway, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Head + headband tail.
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(2, bodyTop + h * 0.16, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.belt;
  ctx.fillRect(-13, bodyTop + h * 0.16 - 9, 30, 6);
  ctx.beginPath();
  ctx.moveTo(-13, bodyTop + h * 0.16 - 6);
  ctx.lineTo(-26 - Math.sin(tick * 0.2) * 3, bodyTop + h * 0.16 + 2);
  ctx.lineTo(-13, bodyTop + h * 0.16 + 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Hit flash ring while in hitstun.
  if (f.action === "hitstun" && f.actionTick < 6) {
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(f.x, f.y - h * 0.6, 26 + f.actionTick * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx: CanvasRenderingContext2D, s: FightState): void {
  const pad = 24;
  const barW = ARENA_W * 0.38;
  const barH = 20;

  drawHealthBar(ctx, pad, pad, barW, barH, s.p1.hp / MAX_HP, false, PALETTES[0].name);
  drawHealthBar(ctx, ARENA_W - pad - barW, pad, barW, barH, s.p2.hp / MAX_HP, true, PALETTES[1].name);

  // Round clock.
  const secs = Math.max(0, Math.ceil(s.clock / TICK_RATE));
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, ARENA_W / 2 - 34, pad - 6, 68, 34, 6);
  ctx.fill();
  ctx.fillStyle = secs <= 10 ? "#f87171" : "#ffffff";
  ctx.font = "bold 22px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(secs), ARENA_W / 2, pad + 18);

  // Win pips.
  for (let i = 0; i < WINS_TO_TAKE_MATCH; i++) {
    drawPip(ctx, pad + 14 + i * 22, pad + barH + 14, i < s.wins1);
    drawPip(ctx, ARENA_W - pad - 14 - i * 22, pad + barH + 14, i < s.wins2);
  }
}

function drawHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  mirror: boolean,
  name: string,
): void {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 5);
  ctx.fill();
  ctx.fillStyle = "#3f1d1d";
  ctx.fillRect(x, y, w, h);
  const fillW = w * ratio;
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, ratio > 0.3 ? "#fbbf24" : "#ef4444");
  grad.addColorStop(1, ratio > 0.3 ? "#d97706" : "#b91c1c");
  ctx.fillStyle = grad;
  if (mirror) ctx.fillRect(x + w - fillW, y, fillW, h);
  else ctx.fillRect(x, y, fillW, h);

  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 11px ui-monospace, monospace";
  ctx.textAlign = mirror ? "right" : "left";
  ctx.fillText(name, mirror ? x + w : x, y + h + 16);
}

function drawPip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  filled: boolean,
): void {
  ctx.beginPath();
  ctx.arc(x, y + 6, 6, 0, Math.PI * 2);
  ctx.fillStyle = filled ? "#fbbf24" : "rgba(255,255,255,0.2)";
  ctx.fill();
}

function drawBanners(ctx: CanvasRenderingContext2D, s: FightState): void {
  ctx.textAlign = "center";
  if (s.phase === "intro") {
    const late = s.phaseTick < 30;
    banner(ctx, late ? "FIGHT!" : `ROUND ${s.wins1 + s.wins2 + 1}`, late ? "#f87171" : "#ffffff");
  } else if (s.phase === "roundOver") {
    banner(ctx, s.roundWinner === 0 ? "DRAW" : "KO!", "#fbbf24");
  } else if (s.phase === "matchOver") {
    const winner = s.wins1 > s.wins2 ? PALETTES[0].name : PALETTES[1].name;
    banner(ctx, `${winner} WINS`, "#fbbf24");
  }
}

function banner(ctx: CanvasRenderingContext2D, text: string, color: string): void {
  ctx.save();
  ctx.font = "bold 56px ui-monospace, monospace";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.strokeText(text, ARENA_W / 2, ARENA_H / 2 - 40);
  ctx.fillStyle = color;
  ctx.fillText(text, ARENA_W / 2, ARENA_H / 2 - 40);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
