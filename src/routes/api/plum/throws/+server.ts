import { error, json } from "@sveltejs/kit";
import { getPlumState } from "$lib/server/plum/actions";
import { throwLimiter } from "$lib/server/plum/throwLimiter";
import { addThrow } from "$lib/server/plum/throws";
import { visitorAddress } from "$lib/server/visitors/visitorAddress";
import type { RequestHandler } from "./$types";

/** Counts one throw of Plum's ball. Returns how she is afterwards, or 429 when this visitor threw less than a second ago */
export const POST: RequestHandler = async ({ getClientAddress }) => {
  const visitor = visitorAddress(getClientAddress());
  if (!throwLimiter.check(visitor).allowed) error(429, "One throw a second");

  throwLimiter.record(visitor);
  const now = new Date();
  await addThrow(now);
  return json(await getPlumState(now), { headers: { "cache-control": "no-store" } });
};
