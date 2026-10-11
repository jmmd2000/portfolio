import { describe, expect, it } from "vitest";
import { formatWorkYears, yearOf } from "./workYears";

describe("formatWorkYears", () => {
  it("says 'to now' while it's ongoing", () => {
    expect(formatWorkYears(2023, null)).toBe("2023 to now");
  });

  it("writes the year once when it started and ended in the same year", () => {
    expect(formatWorkYears(2022, 2022)).toBe("2022");
  });

  it("writes both years when they differ", () => {
    expect(formatWorkYears(2019, 2023)).toBe("2019 to 2023");
  });
});

describe("yearOf", () => {
  it("reads the year from a stored date", () => {
    expect(yearOf("2023-07-01")).toBe(2023);
  });
});
