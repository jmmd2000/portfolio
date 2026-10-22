import { describe, expect, it } from "vitest";
import { formatBytes } from "./formatBytes";

describe("formatBytes", () => {
  it("picks the largest unit that keeps the number at 1 or more", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(340_000)).toBe("340 KB");
    expect(formatBytes(7_622_741)).toBe("7.6 MB");
    expect(formatBytes(10_000_000_000)).toBe("10 GB");
  });

  it("keeps one decimal place only under 10", () => {
    expect(formatBytes(1_000)).toBe("1 KB");
    expect(formatBytes(9_950)).toBe("10 KB");
    expect(formatBytes(12_400_000)).toBe("12 MB");
  });
});
