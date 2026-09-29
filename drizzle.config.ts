import { defineConfig } from "drizzle-kit";
import { env } from "$lib/server/env";

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL_MIGRATE },
  verbose: true,
  strict: true,
  casing: "snake_case",
});
