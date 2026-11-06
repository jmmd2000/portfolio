import { describe, expect, it } from "vitest";
import { hasThrownBefore, hintPlace, rememberThrow } from "./throwHint";

const size = { width: 190, height: 36 };
const pixel = 3;
const plumTop = 700 - 32 * pixel;

function ballAt(x: number) {
  return { x, y: 688, velocityX: 0, velocityY: 0 };
}

describe("hintPlace", () => {
  const wide = { width: 1200, height: 700, pixel };

  it("sits to the right of the ball when Plum is on its left", () => {
    const place = hintPlace(ballAt(500), 450, size, wide);

    expect(place.side).toBe("right");
    expect(place.x).toBeGreaterThan(500);
  });

  it("sits to the left of the ball when Plum is on its right", () => {
    const place = hintPlace(ballAt(500), 550, size, wide);

    expect(place.side).toBe("left");
    expect(place.x + size.width).toBeLessThan(500);
  });

  it("stays on the page when the ball is on the bottom", () => {
    const place = hintPlace(ballAt(500), 450, size, wide);

    expect(place.y + size.height).toBeLessThanOrEqual(wide.height);
  });

  it("goes above Plum's head when the far side of the ball has no room", () => {
    const narrow = { width: 400, height: 700, pixel };
    const place = hintPlace(ballAt(20), 80, size, narrow);

    expect(place.side).toBe("above");
    expect(place.y + size.height).toBeLessThanOrEqual(plumTop);
    expect(place.x).toBeGreaterThanOrEqual(0);
    expect(place.x + size.width).toBeLessThanOrEqual(narrow.width);
  });

  it("points at the ball when it sits above", () => {
    const narrow = { width: 400, height: 700, pixel };
    const place = hintPlace(ballAt(20), 80, size, narrow);

    expect(place.x + place.notchX).toBe(20);
  });
});

describe("without storage", () => {
  it("counts as never having thrown, and saving does nothing", () => {
    expect(() => rememberThrow()).not.toThrow();
    expect(hasThrownBefore()).toBe(false);
  });
});
