import { z } from "zod";
import { coverRequestHeaders, coverRequestMilliseconds, joinSubtitle, maxCoverResults, type CoverResult } from "./coverResult";

/** Many results have no cover, so the search asks for more than it shows */
const requestedResults = 10;

const bookSearchSchema = z.object({
  docs: z.array(
    z.object({
      title: z.string().min(1),
      author_name: z.array(z.string()).optional(),
      first_publish_year: z.number().int().optional(),
      cover_i: z.number().int().positive().optional(),
    })
  ),
});

function coverURL(coverID: number, size: "M" | "L"): string {
  return `https://covers.openlibrary.org/b/id/${coverID}-${size}.jpg`;
}

/** The books in an Open Library search that have a cover, with their first author and the year they were first published */
export function parseOpenLibraryBooks(body: unknown): CoverResult[] {
  const results: CoverResult[] = [];
  for (const book of bookSearchSchema.parse(body).docs) {
    if (book.cover_i === undefined) continue;

    const subtitle = joinSubtitle(book.author_name?.[0] ?? null, book.first_publish_year ?? null);
    results.push({ title: book.title, subtitle, thumbnailURL: coverURL(book.cover_i, "M"), coverURL: coverURL(book.cover_i, "L") });
  }
  return results.slice(0, maxCoverResults);
}

/** Searches Open Library for books by title. Throws when Open Library fails or answers in an unexpected shape */
export async function searchOpenLibraryBooks(query: string, fetchFunction: typeof fetch = fetch): Promise<CoverResult[]> {
  const parameters = new URLSearchParams({ title: query, limit: String(requestedResults), fields: "title,author_name,first_publish_year,cover_i" });
  const response = await fetchFunction(`https://openlibrary.org/search.json?${parameters}`, { headers: coverRequestHeaders, signal: AbortSignal.timeout(coverRequestMilliseconds) });
  if (!response.ok) throw new Error(`Open Library answered ${response.status}`);

  return parseOpenLibraryBooks(await response.json());
}
