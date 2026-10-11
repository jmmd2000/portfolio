import { groupByYear } from "$lib/server/content/articleList";
import { getPublishedArticles } from "$lib/server/content/articles";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { articleYears: groupByYear(await getPublishedArticles()) };
};
