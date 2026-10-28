import { describe, expect, it } from "vitest";
import { irishDate } from "./irishDate";

describe("irishDate", () => {
  it("starts the next day at Irish midnight in summer, an hour before UTC midnight", () => {
    expect(irishDate(new Date("2026-07-14T22:59:00Z"))).toBe("2026-07-14");
    expect(irishDate(new Date("2026-07-14T23:00:00Z"))).toBe("2026-07-15");
  });

  it("starts the next day at UTC midnight in winter", () => {
    expect(irishDate(new Date("2026-12-14T23:59:00Z"))).toBe("2026-12-14");
    expect(irishDate(new Date("2026-12-15T00:00:00Z"))).toBe("2026-12-15");
  });
});
