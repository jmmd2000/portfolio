import { error, json } from "@sveltejs/kit";
import { coverCopySchema, coverSearchSchema } from "$lib/schemas/coverSearch";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { copyCover, RefusedCover } from "$lib/server/covers/copyCover";
import { searchCovers } from "$lib/server/covers/search";
import type { RequestHandler } from "./$types";

/** Up to five covers matching `query` from `source`: album, game, show or book */
export const GET: RequestHandler = async ({ url, locals }) => {
  requireAdmin(locals);

  const search = coverSearchSchema.safeParse({ source: url.searchParams.get("source"), query: url.searchParams.get("query") });
  if (!search.success) error(400, "Send a source and some words to search for");

  try {
    return json(await searchCovers(search.data.source, search.data.query));
  } catch (cause) {
    console.error(`The ${search.data.source} cover search failed:`, cause);
    error(502, "That source couldn't be reached");
  }
};

/** Copies a picked cover, sent as `{ coverURL, title }`, into the image library. Returns the stored image */
export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin(locals);

  const copy = coverCopySchema.safeParse(await request.json().catch(() => null));
  if (!copy.success) error(400, "Send the cover's address and its title");

  try {
    return json(await copyCover(copy.data.coverURL, copy.data.title), { status: 201 });
  } catch (cause) {
    if (cause instanceof RefusedCover) error(400, cause.message);
    console.error("Copying a cover failed:", cause);
    error(502, "The cover couldn't be copied");
  }
};
