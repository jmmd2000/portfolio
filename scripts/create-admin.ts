import { z } from "zod";
import { createAdminUser } from "$lib/server/auth/adminUser";
import { env } from "$lib/server/env";
import { askForNewPassword } from "./askForNewPassword";

const email = z.email().safeParse(process.argv[2]);
if (!email.success) {
  console.error("Usage: pnpm create-admin <email>");
  process.exit(1);
}

try {
  const password = await askForNewPassword();
  await createAdminUser(env.DATABASE_URL_MIGRATE, email.data, password);
  console.log(`Created the admin user ${email.data}.`);
} catch (error) {
  console.error("Creating the admin user failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
