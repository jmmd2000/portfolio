import { getLiveSettings } from "$lib/server/content/liveSettings";
import { countVisit, getVisitorCount } from "$lib/server/visitors/visits";
import type { LayoutServerLoad } from "./$types";

/**
 * Counts the visit, and reads the visitor count for the footer unless the admin has hidden it. It reads nothing
 * about the address, so it runs on the first page load and not again as the visitor moves between pages. If
 * either fails, the footer leaves the count out and the page still loads.
 */
export const load: LayoutServerLoad = async ({ request, locals, getClientAddress }) => {
  try {
    await countVisit({ address: getClientAddress(), userAgent: request.headers.get("user-agent"), signedIn: locals.user !== null, at: new Date() });
    const { visitorCountShown } = await getLiveSettings();
    return { visitorCount: visitorCountShown ? await getVisitorCount() : null };
  } catch (error) {
    console.error("Couldn't count the visit:", error);
    return { visitorCount: null };
  }
};
