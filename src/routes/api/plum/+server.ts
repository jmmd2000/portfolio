import { error, json } from "@sveltejs/kit";
import { actionRequestSchema } from "$lib/schemas/plumState";
import { act, getPlumState } from "$lib/server/plum/actions";
import type { RequestHandler } from "./$types";

// Plum changes every few seconds, so no answer is ever kept by a cache
const noStore = { "cache-control": "no-store" };

/** How Plum is now. Her pen asks every 10 seconds while the page is open */
export const GET: RequestHandler = async () => {
  return json(await getPlumState(new Date()), { headers: noStore });
};

/** Does one of Plum's actions, sent as `{ action }`. Returns what came of it and how she is afterwards */
export const POST: RequestHandler = async ({ request }) => {
  const result = actionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) error(400, "Send an action: feed, pet or play");

  return json(await act(result.data.action, new Date()), { headers: noStore });
};
