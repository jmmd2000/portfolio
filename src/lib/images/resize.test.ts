import { describe, expect, it } from "vitest";
import { convertedName, resizedSize } from "./resize";

describe("resizedSize", () => {
  it("scales a wide image down to the maximum width and keeps its shape", () => {
    expect(resizedSize({ width: 3200, height: 1801 }, 1600)).toEqual({ width: 1600, height: 901 });
  });

  it("leaves an image that already fits at its own size", () => {
    expect(resizedSize({ width: 1600, height: 900 }, 1600)).toEqual({ width: 1600, height: 900 });
    expect(resizedSize({ width: 40, height: 40 }, 1600)).toEqual({ width: 40, height: 40 });
  });

  it("never rounds a very thin image down to no height", () => {
    expect(resizedSize({ width: 10_000, height: 2 }, 1600)).toEqual({ width: 1600, height: 1 });
  });
});

describe("convertedName", () => {
  it("swaps the extension for the converted type's", () => {
    expect(convertedName("Screen Shot.PNG", "image/webp")).toBe("Screen Shot.webp");
    expect(convertedName("photo", "image/jpeg")).toBe("photo.jpg");
  });

  it("keeps the name for a type it doesn't know", () => {
    expect(convertedName("logo.svg", "image/svg+xml")).toBe("logo.svg");
  });
});
