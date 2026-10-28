const datePartsFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Dublin" });

/** The date in Irish time as YYYY-MM-DD, so a visitor's day ends at Irish midnight */
export function irishDate(date: Date): string {
  const parts = datePartsFormat.formatToParts(date);
  const partValue = (type: string) => parts.find(part => part.type === type)?.value;
  return `${partValue("year")}-${partValue("month")}-${partValue("day")}`;
}
