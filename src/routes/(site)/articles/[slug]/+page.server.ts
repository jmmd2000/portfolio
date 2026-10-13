import { error, redirect } from "@sveltejs/kit";
import { articleDateTime, formatArticleDate, readingMinutes } from "$lib/server/content/articleDetails";
import { getPublishedArticle, getSlugRedirect } from "$lib/server/content/articles";
import { renderMarkdown } from "$lib/server/markdown/renderMarkdown";
import type { PageServerLoad } from "./$types";

// A day, so a browser that cached a redirect follows the article if it's renamed back
const redirectCacheSeconds = 86_400;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const article = await getPublishedArticle(params.slug);
  if (!article) {
    const slugRedirect = await getSlugRedirect(params.slug);
    if (slugRedirect?.published) {
      setHeaders({ "cache-control": `max-age=${redirectCacheSeconds}` });
      redirect(301, `/articles/${slugRedirect.slug}`);
    }
    error(404, "No article with that address");
  }

  return {
    article: {
      title: article.title,
      summary: article.summary,
      date: formatArticleDate(article.publishedAt),
      dateTime: articleDateTime(article.publishedAt),
      readingMinutes: readingMinutes(article.body),
      project: article.project,
    },
    html: await renderMarkdown(article.body),
  };
};
