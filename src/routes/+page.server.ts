import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { countPublishedProjects, getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, publishedCount, currentlyRows] = await Promise.all([getFeaturedProjects(), countPublishedProjects(), getShownCurrentlyRows()]);
  return { featuredProjects, publishedCount, currentlyRows };
};
