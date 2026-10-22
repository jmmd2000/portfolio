import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_URL_MIGRATE: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  R2_ENDPOINT: z.url(),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  /** The bucket's public address, with no slash at the end */
  ASSETS_URL: z.url().transform(url => url.replace(/\/+$/, "")),
  SPOTIFY_CLIENT_ID: z.string().min(1),
  SPOTIFY_CLIENT_SECRET: z.string().min(1),
  SPOTIFY_REFRESH_TOKEN: z.string().min(1),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid environment variables:", z.flattenError(parsedEnvironment.error).fieldErrors);
  throw new Error("Invalid environment variables. Check .env against .env.example.");
}

/** Environment variables, validated once when this module loads. */
export const env = parsedEnvironment.data;
