import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getArticle, isSlugTaken, updateArticle } from "$lib/server/content/articles";
import { formText } from "$lib/server/formText";
import { articleSchema, slugTakenMessage, type ArticleInput } from "$lib/schemas/article";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();

/** The article's id from the address, or 404 when it isn't a valid id */
function articleID(param: string): number {
  const result = idSchema.safeParse(param);
  if (!result.success) error(404, "No article with that id");
  return result.data;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  requireAdmin(locals);

  const article = await getArticle(articleID(params.id));
  if (!article) error(404, "No article with that id");

  return { article };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    requireAdmin(locals);

    const id = articleID(params.id);
    const values = formText(await request.formData());
    const result = articleSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
    }
    if (await isSlugTaken(result.data.slug, id)) {
      const errors: Partial<Record<keyof ArticleInput, string[]>> = { slug: [slugTakenMessage] };
      return fail(400, { values, errors });
    }

    const updated = await updateArticle(id, result.data);
    if (!updated) error(404, "No article with that id");
    return { message: `${updated.title} saved.` };
  },
};
