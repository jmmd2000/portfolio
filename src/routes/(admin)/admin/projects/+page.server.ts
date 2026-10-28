import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { createProject, getAllProjects, moveProject } from "$lib/server/content/projects";
import { formText } from "$lib/server/formText";
import { newProjectSchema } from "$lib/schemas/project";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();
const directionSchema = z.enum(["up", "down"]);

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  return { projects: await getAllProjects() };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = newProjectSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
    }

    const project = await createProject(result.data);
    redirect(303, `/admin/projects/${project.id}`);
  },

  move: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = idSchema.safeParse(values.id);
    if (!id.success) error(400, "No project with that id");
    const direction = directionSchema.safeParse(values.direction);
    if (!direction.success) error(400, "Move a project up or down");

    await moveProject(id.data, direction.data);
  },
};
