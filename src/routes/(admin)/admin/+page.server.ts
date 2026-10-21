import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// The admin has no home page of its own, so /admin opens the first section
export const load: PageServerLoad = () => {
  redirect(307, "/admin/profile");
};
