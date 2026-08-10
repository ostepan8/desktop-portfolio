import { describe, expect, it } from "vitest";
import { DOCK_HEIGHT, MENU_BAR_HEIGHT, WINDOW_DEFAULTS } from "@/constants/layout";
import {
  clampPositionToArea,
  containPosition,
  detachRect,
  detectSnapZone,
  fitRectToArea,
  fitSize,
  getWorkArea,
  placeNewWindow,
  resizeRect,
  snapRect,
  type Rect,
  type Size,
} from "./window-geometry";

const LAPTOP: Size = { width: 1440, height: 900 };
const SMALL: Size = { width: 900, height: 620 };
const MIN: Size = { width: 400, height: 300 };

const area = getWorkArea(LAPTOP);
const right = (r: Rect) => r.x + r.width;
const bottom = (r: Rect) => r.y + r.height;

describe("getWorkArea", () => {
  it("excludes the menu bar and the dock", () => {
    expect(area).toEqual({
      x: 0,
      y: MENU_BAR_HEIGHT,
      width: 1440,
      height: 900 - MENU_BAR_HEIGHT - DOCK_HEIGHT,
    });
  });

  it("never returns a negative size on a tiny viewport", () => {
    const tiny = getWorkArea({ width: 0, height: 10 });
    expect(tiny.width).toBeGreaterThan(0);
    expect(tiny.height).toBeGreaterThan(0);
  });
});

describe("fitSize", () => {
  it("leaves a window that already fits alone", () => {
    expect(fitSize({ width: 800, height: 500 }, MIN, area)).toEqual({
      width: 800,
      height: 500,
    });
  });

  it("shrinks an oversized window while preserving its aspect ratio", () => {
    const preferred = { width: 1000, height: 640 };
    const small = getWorkArea(SMALL);
    const fitted = fitSize(preferred, MIN, small);

    expect(fitted.width).toBeLessThanOrEqual(small.width);
    expect(fitted.height).toBeLessThanOrEqual(small.height);
    expect(fitted.width / fitted.height).toBeCloseTo(
      preferred.width / preferred.height,
      1,
    );
  });

  it("gives up the minimum rather than overflowing a very small area", () => {
    const cramped = { width: 320, height: 240 };
    const fitted = fitSize({ width: 800, height: 600 }, MIN, cramped);
    expect(fitted.width).toBeLessThanOrEqual(cramped.width);
    expect(fitted.height).toBeLessThanOrEqual(cramped.height);
  });
});

describe("placeNewWindow", () => {
  it("keeps every window fully inside the work area", () => {
    for (let index = 0; index < 12; index += 1) {
      const rect = placeNewWindow(
        index,
        { width: 1000, height: 640 },
        MIN,
        SMALL,
      );
      const small = getWorkArea(SMALL);
      expect(rect.x).toBeGreaterThanOrEqual(small.x);
      expect(rect.y).toBeGreaterThanOrEqual(small.y);
      expect(right(rect)).toBeLessThanOrEqual(right(small));
      expect(bottom(rect)).toBeLessThanOrEqual(bottom(small));
    }
  });

  it("is deterministic — the same index always lands in the same place", () => {
    const preferred = { width: 800, height: 500 };
    expect(placeNewWindow(3, preferred, MIN, LAPTOP)).toEqual(
      placeNewWindow(3, preferred, MIN, LAPTOP),
    );
  });

  it("cascades consecutive windows instead of stacking them", () => {
    const preferred = { width: 800, height: 500 };
    const first = placeNewWindow(0, preferred, MIN, LAPTOP);
    const second = placeNewWindow(1, preferred, MIN, LAPTOP);

    expect(second.x - first.x).toBe(WINDOW_DEFAULTS.CASCADE_STEP);
    expect(second.y - first.y).toBe(WINDOW_DEFAULTS.CASCADE_STEP);
  });

  it("wraps the cascade so it cannot walk off the desktop", () => {
    const preferred = { width: 800, height: 500 };
    const positions = Array.from({ length: 20 }, (_, i) =>
      placeNewWindow(i, preferred, MIN, LAPTOP),
    );
    const distinct = new Set(positions.map((p) => `${p.x},${p.y}`));
    expect(distinct.size).toBeLessThanOrEqual(WINDOW_DEFAULTS.CASCADE_SLOTS);
  });
});

describe("clampPositionToArea", () => {
  const size: Size = { width: 600, height: 400 };

  it("never lets the title bar hide under the menu bar", () => {
    expect(clampPositionToArea({ x: 100, y: -500 }, size, area).y).toBe(area.y);
  });

  it("never lets the title bar sink behind the dock", () => {
    const y = clampPositionToArea({ x: 100, y: 5000 }, size, area).y;
    expect(y + WINDOW_DEFAULTS.TITLE_BAR_HEIGHT).toBeLessThanOrEqual(
      bottom(area),
    );
  });

  it("keeps a grabbable strip on screen when dragged past an edge", () => {
    const dragged = clampPositionToArea({ x: -5000, y: 200 }, size, area);
    expect(dragged.x + size.width).toBeGreaterThanOrEqual(
      area.x + WINDOW_DEFAULTS.EDGE_GRIP,
    );
  });

  it("leaves an on-screen window untouched", () => {
    expect(clampPositionToArea({ x: 200, y: 200 }, size, area)).toEqual({
      x: 200,
      y: 200,
    });
  });
});

describe("fitRectToArea", () => {
  it("returns the same reference when nothing needs to change", () => {
    const rect: Rect = { x: 100, y: 100, width: 600, height: 400 };
    expect(fitRectToArea(rect, MIN, area)).toBe(rect);
  });

  it("shrinks and repositions a window stranded by a smaller viewport", () => {
    const small = getWorkArea(SMALL);
    const rect: Rect = { x: 1200, y: 600, width: 1000, height: 700 };
    const fitted = fitRectToArea(rect, MIN, small);

    expect(fitted.width).toBeLessThanOrEqual(small.width);
    expect(fitted.height).toBeLessThanOrEqual(small.height);
    expect(right(fitted)).toBeLessThanOrEqual(right(small));
    expect(bottom(fitted)).toBeLessThanOrEqual(bottom(small));
  });
});

describe("containPosition", () => {
  it("pins to the top-left when the window is larger than the area", () => {
    const rect: Rect = { x: 300, y: 300, width: 9000, height: 9000 };
    expect(containPosition(rect, area)).toEqual({ x: area.x, y: area.y });
  });
});

describe("snapRect", () => {
  it("tiles halves without a seam or an overlap", () => {
    const left = snapRect("left", area);
    const rightHalf = snapRect("right", area);

    expect(right(left)).toBe(rightHalf.x);
    expect(left.width + rightHalf.width).toBe(area.width);
  });

  it("maximizes to exactly the work area", () => {
    expect(snapRect("maximized", area)).toEqual(area);
  });

  it("handles an odd viewport width", () => {
    const odd = getWorkArea({ width: 1001, height: 800 });
    expect(snapRect("left", odd).width + snapRect("right", odd).width).toBe(
      odd.width,
    );
  });
});

describe("detectSnapZone", () => {
  it("arms nothing in the middle of the desktop", () => {
    expect(detectSnapZone({ x: 700, y: 400 }, LAPTOP)).toBeNull();
  });

  it("arms tiling only with the pointer hard against a screen edge", () => {
    expect(detectSnapZone({ x: 2, y: 400 }, LAPTOP)).toBe("left");
    expect(detectSnapZone({ x: LAPTOP.width - 2, y: 400 }, LAPTOP)).toBe(
      "right",
    );
  });

  it("does not hijack a drop that is merely near an edge", () => {
    // Regression: with a 24px threshold, placing a window near an edge tiled
    // it to half the screen instead of leaving it where it was dropped.
    expect(detectSnapZone({ x: 18, y: 400 }, LAPTOP)).toBeNull();
    expect(detectSnapZone({ x: LAPTOP.width - 18, y: 400 }, LAPTOP)).toBeNull();
  });

  it("arms maximize only when the pointer is pushed into the menu bar", () => {
    expect(detectSnapZone({ x: 700, y: 4 }, LAPTOP)).toBe("maximized");
    expect(detectSnapZone({ x: 700, y: MENU_BAR_HEIGHT }, LAPTOP)).toBe(
      "maximized",
    );
  });

  it("does not hijack a window placed at the top of the desktop", () => {
    // Regression: dropping with the pointer just below the menu bar (i.e.
    // placing a window flush with the top) used to maximize it instead.
    expect(
      detectSnapZone({ x: 700, y: MENU_BAR_HEIGHT + 18 }, LAPTOP),
    ).toBeNull();
  });
});

describe("resizeRect", () => {
  const start: Rect = { x: 200, y: 100, width: 600, height: 400 };

  it("moves only the dragged edge", () => {
    const next = resizeRect(start, "e", { x: 120, y: 999 }, MIN, area);
    expect(next).toEqual({ ...start, width: 720 });
  });

  it("keeps the opposite corner anchored when dragging west", () => {
    const next = resizeRect(start, "w", { x: -100, y: 0 }, MIN, area);
    expect(next.x).toBe(100);
    expect(right(next)).toBe(right(start));
  });

  it("pins at the minimum size instead of freezing", () => {
    const next = resizeRect(start, "w", { x: 5000, y: 0 }, MIN, area);
    expect(next.width).toBe(MIN.width);
    expect(right(next)).toBe(right(start));
  });

  it("cannot be resized up under the menu bar", () => {
    const next = resizeRect(start, "n", { x: 0, y: -5000 }, MIN, area);
    expect(next.y).toBe(area.y);
  });

  it("cannot be resized down behind the dock", () => {
    const next = resizeRect(start, "s", { x: 0, y: 5000 }, MIN, area);
    expect(bottom(next)).toBe(bottom(area));
  });

  it("resizes both axes from a corner", () => {
    const next = resizeRect(start, "se", { x: 50, y: 60 }, MIN, area);
    expect(next).toEqual({ ...start, width: 650, height: 460 });
  });

  it("does not teleport a window the user dragged off the left edge", () => {
    const offscreen: Rect = { x: -200, y: 200, width: 600, height: 400 };
    const next = resizeRect(offscreen, "e", { x: 40, y: 0 }, MIN, area);
    expect(next.x).toBe(offscreen.x);
    expect(next.width).toBe(640);
  });
});

describe("detachRect", () => {
  it("restores the floating size under the pointer when un-snapping", () => {
    const snapped = snapRect("left", area);
    const floating: Size = { width: 600, height: 400 };
    const pointer = { x: snapped.x + snapped.width / 2, y: 300 };
    const detached = detachRect(snapped, floating, pointer, area);

    expect(detached.width).toBe(floating.width);
    expect(detached.height).toBe(floating.height);
    // Grabbed mid-title-bar, so the window hangs centred on the pointer.
    expect(detached.x + floating.width / 2).toBeCloseTo(pointer.x, 0);
  });
});
