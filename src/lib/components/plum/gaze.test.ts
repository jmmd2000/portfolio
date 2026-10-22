import { describe, expect, it } from "vitest";
import { gazeAt, gazeFrame } from "./gaze";

describe("gazeAt", () => {
  it("looks ahead when the pointer is close to her face", () => {
    expect(gazeAt(10, -10, 20)).toBe("ahead");
  });

  it("looks each of the eight ways around her, with screen y growing downwards", () => {
    expect(gazeAt(100, 0, 20)).toBe("look_right");
    expect(gazeAt(100, 100, 20)).toBe("look_down_right");
    expect(gazeAt(0, 100, 20)).toBe("look_down");
    expect(gazeAt(-100, 100, 20)).toBe("look_down_left");
    expect(gazeAt(-100, 0, 20)).toBe("look_left");
    expect(gazeAt(-100, -100, 20)).toBe("look_up_left");
    expect(gazeAt(0, -100, 20)).toBe("look_up");
    expect(gazeAt(100, -100, 20)).toBe("look_up_right");
  });

  it("changes direction halfway between two of them", () => {
    // 22 degrees below the right is still right, 23 is down and right
    expect(gazeAt(100, 40, 20)).toBe("look_right");
    expect(gazeAt(100, 43, 20)).toBe("look_down_right");
  });

  it("looks left from straight left, above or below", () => {
    expect(gazeAt(-100, -1, 20)).toBe("look_left");
    expect(gazeAt(-100, 1, 20)).toBe("look_left");
  });
});

describe("gazeFrame", () => {
  it("matches the order of the watching sprite's frames", () => {
    expect(gazeFrame("ahead")).toBe(0);
    expect(gazeFrame("look_up")).toBe(1);
    expect(gazeFrame("look_up_left")).toBe(8);
  });
});
