/** One match from a cover search */
export interface CoverResult {
  title: string;
  /** Who made it and when, such as the artist and year. Null when the source doesn't say */
  subtitle: string | null;
  /** A small version of the cover, for the search results */
  thumbnailURL: string;
  /** The full cover, which is copied into the image library when it's picked */
  coverURL: string;
}

export const maxCoverResults = 5;

/** Every request to a source names the site and gives a contact, as Open Library asks */
export const coverRequestHeaders = { "User-Agent": "jamesmddoyle.com cover search (hi@jamesmddoyle.com)" };

/** Open Library often takes a few seconds, so every source gets this long */
export const coverRequestMilliseconds = 8000;

/** "Bon Iver · 2011", leaving out whichever part is missing. Null when both are */
export function joinSubtitle(maker: string | null, year: string | number | null): string | null {
  const parts: string[] = [];
  if (maker) parts.push(maker);
  if (year) parts.push(String(year));
  return parts.length > 0 ? parts.join(" · ") : null;
}
