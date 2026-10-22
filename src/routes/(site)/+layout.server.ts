import { countVisit, getVisitorCount } from "$lib/server/visitors/visits";
import type { LayoutServerLoad } from "./$types";

/**
 * Counts the visit and reads the visitor count for the footer. It reads nothing about the address, so it runs on
 * the first page load and not again as the visitor moves between pages. If the count fails, the footer leaves it
 * out and the page still loads.
 */
export const load: LayoutServerLoad = async ({ request, locals, getClientAddress }) => {
  try {
    await countVisit({ address: getClientAddress(), userAgent: request.headers.get("user-agent"), signedIn: locals.user !== null, at: new Date() });
    return { visitorCount: await getVisitorCount() };
  } catch (error) {
    console.error("Couldn't count the visit:", error);
    return { visitorCount: null };
  }
};
