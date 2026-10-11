import { describe, expect, it } from "vitest";
import { formatDateRange } from "./dateRange";

describe("formatDateRange", () => {
  it("shows a current job as running to now", () => {
    expect(formatDateRange("2023-07-01", null)).toBe("July 2023 to now");
  });

  it("writes the year once when both ends fall in the same year", () => {
    expect(formatDateRange("2022-01-01", "2022-07-01")).toBe("January to July 2022");
  });

  it("writes both years when the job crosses a new year", () => {
    expect(formatDateRange("2021-10-01", "2022-03-01")).toBe("October 2021 to March 2022");
  });

  it("shows a job that started and ended in the same month once", () => {
    expect(formatDateRange("2022-06-01", "2022-06-30")).toBe("June 2022");
  });

  it("refuses a date that isn't YYYY-MM-DD", () => {
    expect(() => formatDateRange("July 2023", null)).toThrow('Expected a date like "2023-07-01"');
  });
});
