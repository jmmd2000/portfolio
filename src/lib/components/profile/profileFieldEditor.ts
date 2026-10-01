// Connects one profile field to the editing code, with its label, its rule and its save request.
import { invalidateAll } from "$app/navigation";
import { makeEditable } from "$lib/components/edit/makeEditable";
import { sendEdit } from "$lib/components/edit/sendEdit";
import { profileSchema, type ProfileField } from "$lib/schemas/profile";

const labels: Record<ProfileField, string> = {
  name: "Name",
  role: "Role",
  location: "Location",
  bio: "Bio",
};

/** Makes one profile field editable */
export function makeProfileFieldEditable(element: HTMLElement, field: ProfileField): () => void {
  return makeEditable(element, {
    label: labels[field],
    check: text => {
      const result = profileSchema.shape[field].safeParse(text);
      if (result.success) return { value: result.data };
      return { error: result.error.issues[0]?.message ?? "Invalid content." };
    },
    save: async value => {
      const outcome = await sendEdit("/api/admin/profile", "PATCH", { [field]: value });
      // reloads the page's data, so anywhere else showing this field updates too
      if (outcome === "saved") await invalidateAll();
      return outcome;
    },
  });
}
