import { getProfile } from "$lib/server/content/profile";
import { getSocials } from "$lib/server/content/socials";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const [profile, socials] = await Promise.all([getProfile(), getSocials()]);
  return { profile, socials, signedIn: locals.user !== null };
};
