import { describe, expect, it } from "vitest";
import { frameAt } from "./frameAt";

const durations = [100, 50, 200];

describe("frameAt", () => {
  it("moves to the next frame once a frame's time is up", () => {
    expect(frameAt(durations, 99, true)).toBe(0);
    expect(frameAt(durations, 100, true)).toBe(1);
    expect(frameAt(durations, 150, true)).toBe(2);
  });

  it("starts again after the last frame when it loops", () => {
    expect(frameAt(durations, 350, true)).toBe(0);
    expect(frameAt(durations, 3620, true)).toBe(1);
  });

  it("stays on the last frame when it doesn't loop", () => {
    expect(frameAt(durations, 350, false)).toBe(2);
    expect(frameAt(durations, 1_000_000, false)).toBe(2);
  });
});
