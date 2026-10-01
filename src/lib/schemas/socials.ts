// Rules for the social links. The browser and the server both check edits with them.
import { z } from "zod";
import { requiredText } from "./requiredText";

const mailtoPrefix = "mailto:";

/** Only web pages and email addresses */
function isSafeLink(url: string): boolean {
  if (url.startsWith(mailtoPrefix)) {
    return z.email().safeParse(url.slice(mailtoPrefix.length)).success;
  }
  return z.url({ protocol: /^https$/ }).safeParse(url).success;
}

export const socialSchema = z.object({
  name: requiredText("name", 40),
  url: z.string().trim().refine(isSafeLink, "Use a full https:// address, or mailto: and an email address"),
});

/** One or more fields to change. Each edit sends only the field that changed */
export const socialChangesSchema = socialSchema.partial().refine(changes => Object.keys(changes).length > 0, "Send at least one field to change");

/** Every link's id, in the new order */
export const socialOrderSchema = z.object({ order: z.array(z.number().int().positive()).min(1) });

export type SocialInput = z.infer<typeof socialSchema>;
export type SocialChanges = z.infer<typeof socialChangesSchema>;
export type SocialField = keyof SocialInput;
