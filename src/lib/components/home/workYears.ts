/**
 * Formats the years of a job for the home page's work list: "2023 to now" while it's ongoing,
 * "2022" when it started and ended in the same year, and "2019 to 2023" otherwise.
 */
export function formatWorkYears(startYear: number, endYear: number | null): string {
  if (endYear === null) return `${startYear} to now`;
  if (startYear === endYear) return String(startYear);

  return `${startYear} to ${endYear}`;
}

/** The year from a date stored as "YYYY-MM-DD" */
export function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}
