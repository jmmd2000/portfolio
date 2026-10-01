// Adds a social link that the admin sends from the footer
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { createSocial } from "$lib/server/content/profile";
import { socialSchema } from "$lib/schemas/socials";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  requireAdmin(locals);

  const body: unknown = await request.json().catch(() => null);
  const result = socialSchema.safeParse(body);
  if (!result.success) return json(z.flattenError(result.error), { status: 400 });

  const created = await createSocial(result.data);
  return json(created, { status: 201 });
};
