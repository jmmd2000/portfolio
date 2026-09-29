const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthAndYear {
  month: string;
  year: number;
}

/** Reads the month and year from a date stored as "YYYY-MM-DD". */
function parseDate(date: string): MonthAndYear {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) {
    throw new Error(`Expected a date like "2023-07-01", got "${date}"`);
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return { month: monthNames[monthIndex], year };
}

/**
 * Formats a job's dates as "Jul 2023 - Present", "Jan - Jul 2022" or "Oct 2021 - Mar 2022". A null end date
 * means the job is current. When both ends fall in the same year, the year is only written once.
 */
export function formatDateRange(startDate: string, endDate: string | null): string {
  const start = parseDate(startDate);
  if (endDate === null) return `${start.month} ${start.year} - Present`;

  const end = parseDate(endDate);
  if (start.year !== end.year) return `${start.month} ${start.year} - ${end.month} ${end.year}`;

  if (start.month === end.month) return `${start.month} ${start.year}`;

  return `${start.month} - ${end.month} ${end.year}`;
}
