import { requireAdmin } from "$lib/server/auth/requireAdmin";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ locals }) => {
  const admin = requireAdmin(locals);
  return { email: admin.email };
};
