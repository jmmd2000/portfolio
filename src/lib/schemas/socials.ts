// Rules for the social links. The socials form's actions check every save with them.
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
  url: z.string().trim().refine(isSafeLink, "Use a full https:// address, or mailto: and an email address."),
});

export type SocialInput = z.infer<typeof socialSchema>;
