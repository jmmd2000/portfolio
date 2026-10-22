import { fail } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { getCurrentlyRows } from "$lib/server/content/currently";
import { getLiveSettings, updateLiveSettings } from "$lib/server/content/liveSettings";
import { formText } from "$lib/server/formText";
import { liveSettingsSchema } from "$lib/schemas/liveSettings";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [settings, currentlyRows] = await Promise.all([getLiveSettings(), getCurrentlyRows()]);
  return { settings, currentlyRows };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    requireAdmin(locals);

    const result = liveSettingsSchema.safeParse(formText(await request.formData()));
    if (!result.success) {
      return fail(400, { message: "Those settings couldn't be saved." });
    }

    const { spotifyRowID } = result.data;
    if (spotifyRowID !== null) {
      const currentlyRows = await getCurrentlyRows();
      if (!currentlyRows.some(row => row.id === spotifyRowID)) {
        return fail(400, { message: "That Currently row no longer exists. Pick another." });
      }
    }

    await updateLiveSettings(result.data);
    return { saved: true };
  },
};
