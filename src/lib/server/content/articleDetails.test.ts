import { describe, expect, it } from "vitest";
import { articleDateTime, articleYear, formatArticleDate, hasDemo, readingMinutes } from "./articleDetails";

describe("readingMinutes", () => {
  it("rounds up at 230 words a minute", () => {
    expect(readingMinutes("word ".repeat(230))).toBe(1);
    expect(readingMinutes("word ".repeat(231))).toBe(2);
  });

  it("is at least one minute", () => {
    expect(readingMinutes("")).toBe(1);
  });

  it("counts words across lines and extra spaces", () => {
    expect(readingMinutes(`${"word\n\n  ".repeat(460)}`)).toBe(2);
  });
});

describe("hasDemo", () => {
  it("finds a demo placeholder", () => {
    expect(hasDemo('Try it:\n\n<div data-demo="SandBox"></div>')).toBe(true);
  });

  it("ignores a placeholder shown inside a code block", () => {
    expect(hasDemo('Write this:\n\n```html\n<div data-demo="SandBox"></div>\n```')).toBe(false);
  });

  it("is false without a placeholder", () => {
    expect(hasDemo("Just words, and a data-demo mention.")).toBe(false);
  });
});

describe("article dates", () => {
  // 23:30 UTC on 30 June is 00:30 on 1 July in Ireland, which is an hour ahead in summer
  const justAfterMidnightInIreland = new Date("2026-06-30T23:30:00Z");

  it("shows the day in Irish time", () => {
    expect(formatArticleDate(justAfterMidnightInIreland)).toBe("1 July 2026");
    expect(articleDateTime(justAfterMidnightInIreland)).toBe("2026-07-01");
  });

  it("reads the year", () => {
    expect(articleYear(justAfterMidnightInIreland)).toBe(2026);
  });
});
