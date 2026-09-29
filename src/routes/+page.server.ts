import { countPublishedProjects, getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, publishedCount] = await Promise.all([getFeaturedProjects(), countPublishedProjects()]);
  return { featuredProjects, publishedCount };
};
