/** How long ago she was fed, rounded down to the unit the line uses */
export type TimeSinceFed = { unit: "justNow" } | { unit: "yesterday" } | { unit: "minutes" | "hours" | "days"; count: number };

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

export function timeSinceFed(secondsAgo: number): TimeSinceFed {
  if (secondsAgo < minute) return { unit: "justNow" };
  if (secondsAgo < hour) return { unit: "minutes", count: Math.floor(secondsAgo / minute) };
  if (secondsAgo < day) return { unit: "hours", count: Math.floor(secondsAgo / hour) };
  if (secondsAgo < 2 * day) return { unit: "yesterday" };
  return { unit: "days", count: Math.floor(secondsAgo / day) };
}

function counted(count: number, word: string): string {
  return count === 1 ? `1 ${word}` : `${count} ${word}s`;
}

/**
 * The line under her buttons, such as "Someone fed her 40 minutes ago." It says "You" when the last feed was this
 * visitor's own.
 *
 * @param secondsAgo how long ago she was last fed, or null if nobody has fed her yet
 */
export function lastFedLine(secondsAgo: number | null, byThisVisitor: boolean): string {
  if (secondsAgo === null) return "Nobody has fed her yet.";

  const who = byThisVisitor ? "You" : "Someone";
  const time = timeSinceFed(secondsAgo);
  if (time.unit === "justNow") return `${who} fed her just now.`;
  if (time.unit === "yesterday") return `${who} fed her yesterday.`;
  if (time.unit === "minutes") return `${who} fed her ${counted(time.count, "minute")} ago.`;
  if (time.unit === "hours") return `${who} fed her ${counted(time.count, "hour")} ago.`;
  return `${who} fed her ${counted(time.count, "day")} ago.`;
}
