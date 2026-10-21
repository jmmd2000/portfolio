const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Dublin" });
const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Dublin" });

/** "Saved at 14:02" for a save on the same day in Irish time, or "Saved 3 October 2026 at 14:02" for an older one */
export function savedTimeLabel(savedAt: Date, now: Date): string {
  const time = timeFormat.format(savedAt);
  const day = dayFormat.format(savedAt);
  if (day === dayFormat.format(now)) return `Saved at ${time}`;

  return `Saved ${day} at ${time}`;
}
