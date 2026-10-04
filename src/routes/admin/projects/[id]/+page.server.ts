import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { deleteProject, getProject, updateProject } from "$lib/server/content/projects";
import { formText } from "$lib/server/formText";
import { projectSchema } from "$lib/schemas/project";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();

/** The project's id from the address, or 404 when it isn't a valid id */
function projectID(param: string): number {
  const result = idSchema.safeParse(param);
  if (!result.success) error(404, "No project with that id");
  return result.data;
}

export const load: PageServerLoad = async ({ locals, params }) => {
  requireAdmin(locals);

  const project = await getProject(projectID(params.id));
  if (!project) error(404, "No project with that id");
  return { project };
};

export const actions: Actions = {
  save: async ({ request, locals, params }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = projectSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateProject(projectID(params.id), result.data);
    if (!updated) error(404, "No project with that id");
    return { message: `${updated.title} saved.` };
  },

  delete: async ({ locals, params }) => {
    requireAdmin(locals);

    const deleted = await deleteProject(projectID(params.id));
    if (!deleted) error(404, "No project with that id");
    redirect(303, "/admin/projects");
  },
};
