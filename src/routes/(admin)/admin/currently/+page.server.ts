import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { createCurrentlyRow, deleteCurrentlyRow, getCurrentlyRows, moveCurrentlyRow, updateCurrentlyRow } from "$lib/server/content/currently";
import { formText } from "$lib/server/formText";
import { currentlyRowSchema } from "$lib/schemas/currentlyRow";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();
const directionSchema = z.enum(["up", "down"]);

function rowID(values: Record<string, string>): number {
  const result = idSchema.safeParse(values.id);
  if (!result.success) error(400, "No row with that id");
  return result.data;
}

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  return { rows: await getCurrentlyRows() };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = currentlyRowSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { id: "new", values, errors: z.flattenError(result.error).fieldErrors });
    }

    const row = await createCurrentlyRow(result.data);
    return { id: "new", message: `${row.title} added.` };
  },

  update: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = rowID(values);
    const result = currentlyRowSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { id, values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateCurrentlyRow(id, result.data);
    if (!updated) error(404, "No row with that id");
    return { id, message: `${updated.title} saved.` };
  },

  move: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const direction = directionSchema.safeParse(values.direction);
    if (!direction.success) error(400, "Move a row up or down");

    await moveCurrentlyRow(rowID(values), direction.data);
  },

  delete: async ({ request, locals }) => {
    requireAdmin(locals);

    const deleted = await deleteCurrentlyRow(rowID(formText(await request.formData())));
    if (!deleted) error(404, "No row with that id");
  },
};
