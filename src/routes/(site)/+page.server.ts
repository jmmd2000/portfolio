import { toArticleListItem } from "$lib/server/content/articleList";
import { getHomeArticles } from "$lib/server/content/articles";
import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { countPublishedProjects, getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, projectCount, currentlyRows, homeArticles] = await Promise.all([getFeaturedProjects(), countPublishedProjects(), getShownCurrentlyRows(), getHomeArticles()]);
  return { featuredProjects, projectCount, currentlyRows, articles: homeArticles.map(toArticleListItem) };
};
