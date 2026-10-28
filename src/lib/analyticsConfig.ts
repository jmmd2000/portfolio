import { z } from "zod";

/** The shared Umami server on the VPS */
export const umamiScriptURL = "https://umami.vps.jamesmddoyle.com/script.js";

const configSchema = z.object({
  // An empty string counts as unset, so a blank line in .env turns analytics off
  PUBLIC_UMAMI_WEBSITE_ID: z.preprocess(value => (value === "" ? undefined : value), z.uuid().optional()),
});

/**
 * Reads the Umami website ID from the public environment.
 * @param source The variables to read, such as `$env/dynamic/public`
 * @throws Error when the ID is set but isn't a UUID
 * @returns The ID, or `undefined` when it isn't set and analytics are off
 */
export function parseUmamiWebsiteID(source: Record<string, string | undefined>): string | undefined {
  const result = configSchema.safeParse(source);
  if (!result.success) throw new Error("Invalid analytics settings.\n  PUBLIC_UMAMI_WEBSITE_ID: must be the website ID from Umami, a UUID");
  return result.data.PUBLIC_UMAMI_WEBSITE_ID;
}
