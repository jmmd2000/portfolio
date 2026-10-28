import { countVisit } from "$lib/server/visitors/visits";
import type { RequestHandler } from "./$types";

/**
 * Counts a visit. The site layout asks for this once the page runs in the browser, so tools that fetch a page
 * without running it never count. Asking again from the same address on the same day changes nothing.
 */
export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  await countVisit({ address: getClientAddress(), userAgent: request.headers.get("user-agent"), signedIn: locals.user !== null, at: new Date() });
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
};
