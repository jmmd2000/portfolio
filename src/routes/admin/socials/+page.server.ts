import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { createSocial, deleteSocial, moveSocial, updateSocial } from "$lib/server/content/socials";
import { formText } from "$lib/server/formText";
import { socialSchema } from "$lib/schemas/socials";
import type { Actions } from "./$types";

const idSchema = z.coerce.number().int().positive();
const directionSchema = z.enum(["up", "down"]);

/** The link's id from the form's hidden fields. */
function socialID(values: Record<string, string>): number {
  const result = idSchema.safeParse(values.id);
  if (!result.success) error(400, "No social link with that id");
  return result.data;
}

export const actions: Actions = {
  add: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = socialSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { id: "new", values, errors: z.flattenError(result.error).fieldErrors });
    }

    await createSocial(result.data);
    return { message: `${result.data.name} added.` };
  },

  update: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = socialID(values);
    const result = socialSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { id, values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateSocial(id, result.data);
    if (!updated) error(404, "No social link with that id");
    return { message: `${updated.name} saved.` };
  },

  move: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const direction = directionSchema.safeParse(values.direction);
    if (!direction.success) error(400, "Move a link up or down");

    await moveSocial(socialID(values), direction.data);
  },

  delete: async ({ request, locals }) => {
    requireAdmin(locals);

    const deleted = await deleteSocial(socialID(formText(await request.formData())));
    if (!deleted) error(404, "No social link with that id");
    return { message: "Link deleted." };
  },
};
