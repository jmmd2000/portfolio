import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { formatArticleDate } from "$lib/server/content/articleDetails";
import { createArticle, getAllArticles, isSlugTaken } from "$lib/server/content/articles";
import { formText } from "$lib/server/formText";
import { newArticleSchema, slugTakenMessage, type NewArticleInput } from "$lib/schemas/article";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  const articles = await getAllArticles();
  return {
    articles: articles.map(article => ({
      id: article.id,
      title: article.title,
      status: article.published && article.publishedAt ? `Published ${formatArticleDate(article.publishedAt)}` : "Draft",
      published: article.published,
    })),
  };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = newArticleSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
    }
    if (await isSlugTaken(result.data.slug)) {
      const errors: Partial<Record<keyof NewArticleInput, string[]>> = { slug: [slugTakenMessage] };
      return fail(400, { values, errors });
    }

    const article = await createArticle(result.data);
    redirect(303, `/admin/articles/${article.id}`);
  },
};
