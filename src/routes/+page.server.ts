import { toArticleListItem } from "$lib/server/content/articleList";
import { getHomeArticles } from "$lib/server/content/articles";
import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { getCV } from "$lib/server/content/cv";
import { getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, currentlyRows, cv, homeArticles] = await Promise.all([getFeaturedProjects(), getShownCurrentlyRows(), getCV(), getHomeArticles()]);
  return { featuredProjects, currentlyRows, jobs: cv.jobs, articles: homeArticles.map(toArticleListItem) };
};
