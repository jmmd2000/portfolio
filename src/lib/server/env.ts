import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_URL_MIGRATE: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid environment variables:", z.flattenError(parsedEnvironment.error).fieldErrors);
  throw new Error("Invalid environment variables. Check .env against .env.example.");
}

/** Environment variables, validated once when this module loads. */
export const env = parsedEnvironment.data;
