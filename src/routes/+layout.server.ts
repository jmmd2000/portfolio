import { countPublishedArticles } from "$lib/server/content/articles";
import { getProfile } from "$lib/server/content/profile";
import { getSocials } from "$lib/server/content/socials";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
  const [profile, socials, publishedArticleCount] = await Promise.all([getProfile(), getSocials(), countPublishedArticles()]);
  return { profile, socials, hasArticles: publishedArticleCount > 0 };
};
