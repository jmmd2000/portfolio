import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getLiveSettings, updateLiveSettings } from "$lib/server/content/liveSettings";
import { formText } from "$lib/server/formText";
import { liveSettingsSchema } from "$lib/schemas/liveSettings";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  return { settings: await getLiveSettings() };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    requireAdmin(locals);

    const result = liveSettingsSchema.safeParse(formText(await request.formData()));
    if (!result.success) {
      return fail(400, { message: "Those settings couldn't be saved." });
    }

    await updateLiveSettings(result.data);
    return { saved: true };
  },
};
