import { describe, expect, it } from "vitest";

import { fittedFontSize } from "./fitText";

describe("fittedFontSize", () => {
  it("scales the text to fill the width, with 1% spare", () => {
    expect(fittedFontSize(500, 400, 1000)).toBe(123);
  });

  it("stops at the cap", () => {
    expect(fittedFontSize(600, 300, 160)).toBe(160);
  });

  it("gives text with no width the cap", () => {
    expect(fittedFontSize(600, 0, 160)).toBe(160);
  });
});
