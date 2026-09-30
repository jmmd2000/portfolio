import { resetAdminPassword } from "$lib/server/auth/adminUser";
import { env } from "$lib/server/env";

try {
  const password = "test1234";
  await resetAdminPassword(env.DATABASE_URL_MIGRATE, password);
  console.log("Password changed. Every existing session has been signed out.");
} catch (error) {
  console.error("Resetting the password failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
