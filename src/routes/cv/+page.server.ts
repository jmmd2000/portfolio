import { getCV } from "$lib/server/content/cv";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return getCV();
};
