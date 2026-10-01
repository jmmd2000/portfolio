// Changes or deletes one social link.
import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { deleteSocial, updateSocial } from "$lib/server/content/profile";
import { socialChangesSchema } from "$lib/schemas/socials";
import type { RequestHandler } from "./$types";

/** The link's id from the URL, or a 404 */
function socialID(param: string): number {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) error(404, "No social link with that id");
  return id;
}

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
  requireAdmin(locals);
  const id = socialID(params.id);

  const body: unknown = await request.json().catch(() => null);
  const result = socialChangesSchema.safeParse(body);
  if (!result.success) return json(z.flattenError(result.error), { status: 400 });

  const updated = await updateSocial(id, result.data);
  if (!updated) error(404, "No social link with that id");
  return json(updated);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  requireAdmin(locals);
  const id = socialID(params.id);

  const deleted = await deleteSocial(id);
  if (!deleted) error(404, "No social link with that id");
  return new Response(null, { status: 204 });
};
