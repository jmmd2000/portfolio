import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getLiveSettings, updateLiveSettings } from "$lib/server/content/liveSettings";
import { formText } from "$lib/server/formText";
import { getPlum } from "$lib/server/plum/plum";
import { liveSettingsSchema } from "$lib/schemas/liveSettings";
import type { PlumStats } from "$lib/plum/plumRules";
import type { Actions, PageServerLoad } from "./$types";

/** Plum's stats, or null if they can't be read. The settings still load */
async function loadPlumStats(): Promise<PlumStats | null> {
  try {
    return await getPlum();
  } catch (error) {
    console.error("Couldn't read Plum's stats:", error);
    return null;
  }
}

export const load: PageServerLoad = async () => {
  const [settings, plum] = await Promise.all([getLiveSettings(), loadPlumStats()]);
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
