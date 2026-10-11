import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { getCV } from "$lib/server/content/cv";
import { getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, currentlyRows, cv] = await Promise.all([getFeaturedProjects(), getShownCurrentlyRows(), getCV()]);
  return { featuredProjects, currentlyRows, jobs: cv.jobs };
};
