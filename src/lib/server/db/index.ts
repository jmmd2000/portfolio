import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "$lib/server/env";
import * as schema from "./schema";

const client = postgres(env.DATABASE_URL);

// adapter-node stops the HTTP server on SIGTERM but doesn't exit. Open database connections keep Node running,
// so they close here, or the container only stops when Docker kills it
process.on("sveltekit:shutdown", () => void client.end());

export const db = drizzle(client, { schema, casing: "snake_case" });
