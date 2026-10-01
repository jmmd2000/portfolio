// Saves a new order for the social links.
import { json } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { reorderSocials } from "$lib/server/content/profile";
import { socialOrderSchema } from "$lib/schemas/socials";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, request }) => {
  requireAdmin(locals);

  const body: unknown = await request.json().catch(() => null);
  const result = socialOrderSchema.safeParse(body);
  if (!result.success) return json(z.flattenError(result.error), { status: 400 });

  const reordered = await reorderSocials(result.data.order);
  if (!reordered) return json({ message: "The links changed since the page loaded. Reload and try again" }, { status: 409 });
  return new Response(null, { status: 204 });
};
