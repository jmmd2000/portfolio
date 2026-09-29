import { describe, expect, it } from "vitest";
import { formatDateRange } from "./dateRange";

describe("formatDateRange", () => {
  it("shows a current job as running to Present", () => {
    expect(formatDateRange("2023-07-01", null)).toBe("Jul 2023 - Present");
  });

  it("writes the year once when both ends fall in the same year", () => {
    expect(formatDateRange("2022-01-01", "2022-07-01")).toBe("Jan - Jul 2022");
  });

  it("writes both years when the job crosses a new year", () => {
    expect(formatDateRange("2021-10-01", "2022-03-01")).toBe("Oct 2021 - Mar 2022");
  });

  it("shows a job that started and ended in the same month once", () => {
    expect(formatDateRange("2022-06-01", "2022-06-30")).toBe("Jun 2022");
  });

  it("refuses a date that isn't YYYY-MM-DD", () => {
    expect(() => formatDateRange("July 2023", null)).toThrow('Expected a date like "2023-07-01"');
  });
});
