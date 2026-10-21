import { toArticleListItem } from "$lib/server/content/articleList";
import { getHomeArticles } from "$lib/server/content/articles";
import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { getFeaturedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, currentlyRows, homeArticles] = await Promise.all([getFeaturedProjects(), getShownCurrentlyRows(), getHomeArticles()]);
  return { featuredProjects, currentlyRows, articles: homeArticles.map(toArticleListItem) };
};
