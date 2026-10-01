// Checks profile edits from the admin and saves them.
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { updateProfile } from "$lib/server/content/profile";
import { profileChangesSchema } from "$lib/schemas/profile";
import type { RequestHandler } from "./$types";

/** Saves one or more profile fields */
export const PATCH: RequestHandler = async ({ locals, request }) => {
  requireAdmin(locals);

  const body: unknown = await request.json().catch(() => null);
  const result = profileChangesSchema.safeParse(body);
  if (!result.success) return json(z.flattenError(result.error), { status: 400 });

  const savedProfile = await updateProfile(result.data);
  return json(savedProfile);
};
