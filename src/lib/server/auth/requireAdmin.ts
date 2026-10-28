import { error } from "@sveltejs/kit";
import type { User } from "better-auth";

/** Returns the signed in admin or 401, called by every edit and admin endpoint */
export function requireAdmin(locals: App.Locals): User {
  if (!locals.user) error(401, "Sign in first");
  return locals.user;
}
