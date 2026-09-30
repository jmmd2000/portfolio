import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sessions } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { createAdminUser, resetAdminPassword } from "./adminUser";
import { authOptions } from "./options";

const databaseURL = testEnvironment.DATABASE_URL_TEST;
const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
const database = drizzle(client, { casing: "snake_case" });
const auth = betterAuth({ ...authOptions(database), logger: { disabled: true } });

async function signsIn(email: string, password: string): Promise<boolean> {
  try {
    await auth.api.signInEmail({ body: { email, password } });
    return true;
  } catch {
    return false;
  }
}

beforeEach(async () => {
  await wipeDatabase(databaseURL);
});

afterAll(async () => {
  await client.end();
});

describe("createAdminUser", () => {
  it("creates an admin that can sign in", async () => {
    await createAdminUser(databaseURL, "Admin@Example.com", "first-password-123");

    expect(await signsIn("admin@example.com", "first-password-123")).toBe(true);
    expect(await signsIn("admin@example.com", "wrong-password-123")).toBe(false);
  });

  it("refuses to create a second admin", async () => {
    await createAdminUser(databaseURL, "admin@example.com", "first-password-123");

    await expect(createAdminUser(databaseURL, "someone@example.com", "other-password-123")).rejects.toThrow("already exists");
  });
});

describe("resetAdminPassword", () => {
  it("replaces the password and signs the admin out everywhere", async () => {
    await createAdminUser(databaseURL, "admin@example.com", "first-password-123");
    await signsIn("admin@example.com", "first-password-123");

    await resetAdminPassword(databaseURL, "second-password-123");

    expect(await database.$count(sessions)).toBe(0);
    expect(await signsIn("admin@example.com", "first-password-123")).toBe(false);
    expect(await signsIn("admin@example.com", "second-password-123")).toBe(true);
  });

  it("explains what to do when there is no admin yet", async () => {
    await expect(resetAdminPassword(databaseURL, "second-password-123")).rejects.toThrow("pnpm create-admin");
  });
});
