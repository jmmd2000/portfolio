import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getCV } from "$lib/server/content/cv";
import { createJob, deleteJob, updateJob } from "$lib/server/content/jobs";
import { formText } from "$lib/server/formText";
import { jobSchema } from "$lib/schemas/job";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();

function itemID(values: Record<string, string>): number {
  const result = idSchema.safeParse(values.id);
  if (!result.success) error(400, "No item with that id");
  return result.data;
}

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  const { jobs } = await getCV();
  return { jobs };
};

export const actions: Actions = {
  addJob: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = jobSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "jobs", id: "new", values, errors: z.flattenError(result.error).fieldErrors });
    }

    const job = await createJob(result.data);
    return { list: "jobs", id: "new", message: `${job.title} at ${job.company} added.` };
  },

  updateJob: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = itemID(values);
    const result = jobSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "jobs", id, values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateJob(id, result.data);
    if (!updated) error(404, "No job with that id");
    return { list: "jobs", id, message: `${updated.company} saved.` };
  },

  deleteJob: async ({ request, locals }) => {
    requireAdmin(locals);

    const deleted = await deleteJob(itemID(formText(await request.formData())));
    if (!deleted) error(404, "No job with that id");
  },
};
