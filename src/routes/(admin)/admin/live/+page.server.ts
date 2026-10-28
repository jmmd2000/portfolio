import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getLiveSettings, updateLiveSettings } from "$lib/server/content/liveSettings";
import { formText } from "$lib/server/formText";
import { getPlumState } from "$lib/server/plum/actions";
import { liveSettingsSchema } from "$lib/schemas/liveSettings";
import type { PlumState } from "$lib/schemas/plumState";
import type { Actions, PageServerLoad } from "./$types";

/** How Plum is, or null if it can't be read. The settings still load */
async function loadPlum(): Promise<PlumState | null> {
  try {
    return await getPlumState(new Date());
  } catch (error) {
    console.error("Couldn't read Plum's stats:", error);
    return null;
  }
}

export const load: PageServerLoad = async () => {
  const [settings, plum] = await Promise.all([getLiveSettings(), loadPlum()]);
  return { settings, plum };
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
