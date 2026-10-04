import { describe, expect, it } from "vitest";
import { lineList } from "./lineList";

const bullets = lineList("bullet", 20);

describe("lineList", () => {
  it("makes one item per line, trimmed, with blank lines dropped", () => {
    expect(bullets.parse("  First  \n\n   \nSecond\n")).toEqual(["First", "Second"]);
  });

  it("handles the Windows line endings browsers submit", () => {
    expect(bullets.parse("First\r\nSecond\r\n")).toEqual(["First", "Second"]);
  });

  it("is an empty list when nothing is typed", () => {
    expect(bullets.parse("")).toEqual([]);
  });

  it("refuses a line over the limit", () => {
    expect(bullets.safeParse("Short\nThis line is far too long").success).toBe(false);
  });
});
