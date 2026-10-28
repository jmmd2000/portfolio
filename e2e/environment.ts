import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL_TEST_E2E: z.url(),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid e2e environment variables:", z.flattenError(parsedEnvironment.error).fieldErrors);
  throw new Error("Invalid e2e environment variables. Check .env against .env.example.");
}

/** Environment variables for the e2e tests, validated once when this module loads. */
export const e2eEnvironment = parsedEnvironment.data;
