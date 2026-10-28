import { getLiveSettings } from "$lib/server/content/liveSettings";
import { getVisitorCount } from "$lib/server/visitors/visits";
import type { LayoutServerLoad } from "./$types";

/** Reads the visitor count for the footer unless the admin has hidden it. If that fails, the footer leaves the count out and the page still loads */
export const load: LayoutServerLoad = async () => {
  try {
    const { visitorCountShown } = await getLiveSettings();
    return { visitorCount: visitorCountShown ? await getVisitorCount() : null };
  } catch (error) {
    console.error("Couldn't read the visitor count:", error);
    return { visitorCount: null };
  }
};
