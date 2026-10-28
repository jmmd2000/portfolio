import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "$lib/server/db/schema";
import { authOptions } from "./options";

/** Opens a database connection with better-auth on top. Call `close` when done. */
function openAuth(databaseURL: string) {
  const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
  const database = drizzle(client, { casing: "snake_case" });
  const auth = betterAuth(authOptions(database));

  return { auth, database, close: () => client.end() };
}

/**
 * Creates the site's one admin user. Sign-up is off, so this goes through better-auth's internal
 * adapter: the same two rows its sign-up would write, a user and a password account.
 */
export async function createAdminUser(databaseURL: string, email: string, password: string): Promise<void> {
  const { auth, database, close } = openAuth(databaseURL);

  try {
    const existingUsers = await database.$count(users);
    if (existingUsers > 0) {
      throw new Error("An admin user already exists. Change its password with pnpm reset-password.");
    }

    const context = await auth.$context;
    const passwordHash = await context.password.hash(password);
    const user = await context.internalAdapter.createUser({ email: email.toLowerCase(), name: "admin", emailVerified: true }, { method: "email-password" });
    await context.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: passwordHash });
  } finally {
    await close();
  }
}

/** Gives the admin user a new password and signs it out everywhere. */
export async function resetAdminPassword(databaseURL: string, password: string): Promise<void> {
  const { auth, database, close } = openAuth(databaseURL);

  try {
    const [admin] = await database.select().from(users).limit(1);
    if (!admin) {
      throw new Error("There is no admin user yet. Create one with pnpm create-admin <email>.");
    }

    const context = await auth.$context;
    await context.internalAdapter.updatePassword(admin.id, await context.password.hash(password));
    await context.internalAdapter.deleteUserSessions(admin.id);
  } finally {
    await close();
  }
}
