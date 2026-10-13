import { error } from "@sveltejs/kit";
import { articleDateTime, formatArticleDate, readingMinutes } from "$lib/server/content/articleDetails";
import { getPublishedArticle } from "$lib/server/content/articles";
import { renderMarkdown } from "$lib/server/markdown/renderMarkdown";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const article = await getPublishedArticle(params.slug);
  if (!article) error(404, "No article with that address");

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
