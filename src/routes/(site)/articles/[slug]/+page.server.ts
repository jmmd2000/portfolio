import { error, redirect } from "@sveltejs/kit";
import { articleDateTime, formatArticleDate, readingMinutes } from "$lib/server/content/articleDetails";
import { getArticleBySlug, getSlugRedirect } from "$lib/server/content/articles";
import { renderMarkdown } from "$lib/server/markdown/renderMarkdown";
import type { PageServerLoad } from "./$types";

// A day, so a browser that cached a redirect follows the article if it's renamed back
const redirectCacheSeconds = 86_400;

export const load: PageServerLoad = async ({ params, setHeaders, locals }) => {
  // The signed-in admin also sees drafts and unpublished articles. Everyone else only sees published ones
  const signedIn = locals.user !== null;
  const found = await getArticleBySlug(params.slug);
  const article = found && (found.published || signedIn) ? found : null;

  if (!article) {
    const slugRedirect = await getSlugRedirect(params.slug);
    if (slugRedirect && (slugRedirect.published || signedIn)) {
      if (slugRedirect.published) setHeaders({ "cache-control": `max-age=${redirectCacheSeconds}` });
      redirect(301, `/articles/${slugRedirect.slug}`);
    }
    error(404, "No article with that address");
  }

  // A draft shows the date it would get if it were published now
  const shownDate = article.publishedAt ?? new Date();

  return {
    article: {
      title: article.title,
      summary: article.summary,
      date: formatArticleDate(shownDate),
      dateTime: articleDateTime(shownDate),
      readingMinutes: readingMinutes(article.body),
      draft: !article.published,
      // Only the signed-in admin gets a link to the editor
      editID: signedIn ? article.id : null,
    },
    html: await renderMarkdown(article.body),
  };
};
