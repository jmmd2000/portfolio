import { json } from "@sveltejs/kit";
import { wake } from "$lib/server/plum/actions";
import type { RequestHandler } from "./$types";

/** Wakes her if she's asleep. Returns how she is afterwards */
export const POST: RequestHandler = async () => {
  return json(await wake(new Date()), { headers: { "cache-control": "no-store" } });
};
