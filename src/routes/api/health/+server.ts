import { json } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { buildInfo } from "$lib/buildInfo";
import { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";

/** Healthy when the site is up and can reach the database. The deploy checks it after each release */
export const GET: RequestHandler = async () => {
  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    console.error("Health check failed: the database can't be reached", error);
    return json({ status: "unhealthy", ...buildInfo }, { status: 503 });
  }

  return json({ status: "ok", ...buildInfo });
};
