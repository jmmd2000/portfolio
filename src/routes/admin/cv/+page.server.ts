import { error, fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getCV } from "$lib/server/content/cv";
import { createJob, deleteJob, updateJob } from "$lib/server/content/jobs";
import { createQualification, deleteQualification, updateQualification } from "$lib/server/content/qualifications";
import { createSkillCategory, deleteSkillCategory, moveSkillCategory, updateSkillCategory } from "$lib/server/content/skills";
import { formText } from "$lib/server/formText";
import { jobSchema } from "$lib/schemas/job";
import { qualificationSchema } from "$lib/schemas/qualification";
import { skillCategorySchema } from "$lib/schemas/skillCategory";
import type { Actions, PageServerLoad } from "./$types";

const idSchema = z.coerce.number().int().positive();
const directionSchema = z.enum(["up", "down"]);

function itemID(values: Record<string, string>): number {
  const result = idSchema.safeParse(values.id);
  if (!result.success) error(400, "No item with that id");
  return result.data;
}

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  const { jobs, skillCategories, qualifications } = await getCV();
  return { jobs, skillCategories, qualifications };
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

  addSkillCategory: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = skillCategorySchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "skills", id: "new", values, errors: z.flattenError(result.error).fieldErrors });
    }

    const category = await createSkillCategory(result.data);
    return { list: "skills", id: "new", message: `${category.category} added.` };
  },

  updateSkillCategory: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = itemID(values);
    const result = skillCategorySchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "skills", id, values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateSkillCategory(id, result.data);
    if (!updated) error(404, "No skill category with that id");
    return { list: "skills", id, message: `${updated.category} saved.` };
  },

  moveSkillCategory: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const direction = directionSchema.safeParse(values.direction);
    if (!direction.success) error(400, "Move a skill category up or down");

    await moveSkillCategory(itemID(values), direction.data);
  },

  deleteSkillCategory: async ({ request, locals }) => {
    requireAdmin(locals);

    const deleted = await deleteSkillCategory(itemID(formText(await request.formData())));
    if (!deleted) error(404, "No skill category with that id");
  },

  addQualification: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = qualificationSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "qualifications", id: "new", values, errors: z.flattenError(result.error).fieldErrors });
    }

    const qualification = await createQualification(result.data);
    return { list: "qualifications", id: "new", message: `${qualification.degree} added.` };
  },

  updateQualification: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const id = itemID(values);
    const result = qualificationSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { list: "qualifications", id, values, errors: z.flattenError(result.error).fieldErrors });
    }

    const updated = await updateQualification(id, result.data);
    if (!updated) error(404, "No qualification with that id");
    return { list: "qualifications", id, message: `${updated.degree} saved.` };
  },

  deleteQualification: async ({ request, locals }) => {
    requireAdmin(locals);

    const deleted = await deleteQualification(itemID(formText(await request.formData())));
    if (!deleted) error(404, "No qualification with that id");
  },
};
