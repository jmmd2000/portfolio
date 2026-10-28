import { describe, expect, it } from "vitest";
import { formatDraftTime, isWorthRestoring, type ArticleDraft } from "./articleDraft";

const saved = { title: "How the sand falls", summary: "One rule per material.", body: "## The grid" };
const savedAt = new Date("2026-10-13T12:00:00Z");

function draft(overrides: Partial<ArticleDraft>): ArticleDraft {
  return { ...saved, savedAt: new Date("2026-10-13T12:05:00Z"), ...overrides };
}

describe("isWorthRestoring", () => {
  it("offers a newer draft whose text differs", () => {
    expect(isWorthRestoring(draft({ body: "## The grid, longer" }), saved, savedAt)).toBe(true);
  });

  it("offers a newer draft when only the title differs", () => {
    expect(isWorthRestoring(draft({ title: "How sand falls" }), saved, savedAt)).toBe(true);
  });

  it("skips a draft kept before the last save, such as one saved from another tab", () => {
    expect(isWorthRestoring(draft({ body: "Old text", savedAt: new Date("2026-10-13T11:59:00Z") }), saved, savedAt)).toBe(false);
  });

  it("skips a draft that matches what's saved", () => {
    expect(isWorthRestoring(draft({}), saved, savedAt)).toBe(false);
  });
});

describe("formatDraftTime", () => {
  it("shows Irish summer time, an hour ahead of UTC", () => {
    const time = formatDraftTime(new Date("2026-07-01T13:05:00Z"));

    expect(time).toContain("14:05");
    expect(time).toContain("1 July");
  });
});
