// Rules for the profile text. The browser and the server both check edits with them.
import { z } from "zod";

/** Text that must have something in it once the spaces around it are trimmed */
function requiredText(label: string, maxLength: number) {
  return z.string().trim().min(1, `Add a ${label}.`).max(maxLength, `Keep the ${label} to ${maxLength} characters or fewer.`);
}

export const profileSchema = z.object({
  name: requiredText("name", 80),
  role: requiredText("role", 80),
  location: requiredText("location", 80),
  bio: requiredText("bio", 1000),
});

/** One or more fields to change. Each edit sends only the field that changed */
export const profileChangesSchema = profileSchema.partial().refine(changes => Object.keys(changes).length > 0, "Send at least one field to change.");

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileChanges = z.infer<typeof profileChangesSchema>;
export type ProfileField = keyof ProfileInput;
