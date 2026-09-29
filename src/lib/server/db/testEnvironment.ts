import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL_TEST: z.url(),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid integration test environment variables:", z.flattenError(parsedEnvironment.error).fieldErrors);
  throw new Error("Invalid integration test environment variables. Check .env against .env.example.");
}

/** Environment variables for the integration tests, validated once when this module loads. */
export const testEnvironment = parsedEnvironment.data;
