const wordsPerMinute = 230;
const articleTimeZone = "Europe/Dublin";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: articleTimeZone });
const yearFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: articleTimeZone });
const datePartsFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: articleTimeZone });

/**
 * Minutes to read some markdown at 230 words a minute, rounded up, and at least 1. Markdown symbols and code
 * count as words too, which adds a little.
 */
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(word => word !== "");
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

/** Whether the markdown has a demo placeholder. A placeholder shown as an example inside a code block doesn't count */
export function hasDemo(markdown: string): boolean {
  const withoutCodeBlocks = markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, "");
  return /<div\s[^>]*data-demo=/.test(withoutCodeBlocks);
}

/** The date an article shows, in Irish time, so the server and the browser always agree */
export function formatArticleDate(date: Date): string {
  return dateFormat.format(date);
}

/** The date in Irish time as YYYY-MM-DD, the form a <time> element's datetime attribute needs */
export function articleDateTime(date: Date): string {
  const parts = datePartsFormat.formatToParts(date);
  const partValue = (type: string) => parts.find(part => part.type === type)?.value;
  return `${partValue("year")}-${partValue("month")}-${partValue("day")}`;
}

export function articleYear(date: Date): number {
  return Number(yearFormat.format(date));
}
