import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { updateProfile } from "$lib/server/content/profile";
import { formText } from "$lib/server/formText";
import { profileSchema } from "$lib/schemas/profile";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, locals }) => {
    requireAdmin(locals);

    const values = formText(await request.formData());
    const result = profileSchema.safeParse(values);
    if (!result.success) {
      return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
    }

    await updateProfile(result.data);
    return { saved: true };
  },
};
