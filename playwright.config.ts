import { defineConfig } from "@playwright/test";
import { e2eEnvironment } from "./e2e/environment";

const port = 4173;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  globalSetup: "./e2e/globalSetup.ts",
  use: {
    baseURL: `http://localhost:${port}`,
    // Production reads the client IP from this header (see ADDRESS_HEADER below), so every test sends one
    extraHTTPHeaders: { "x-forwarded-for": "127.0.0.1" },
  },
  webServer: {
    command: "pnpm build && node build",
    port,
    env: {
      PORT: String(port),
      NODE_ENV: "production",
      DATABASE_URL: e2eEnvironment.DATABASE_URL_TEST_E2E,
      DATABASE_URL_MIGRATE: e2eEnvironment.DATABASE_URL_TEST_E2E,
      // adapter-node assumes https without ORIGIN, which would fail SvelteKit's check on form posts
      ORIGIN: `http://localhost:${port}`,
      BETTER_AUTH_URL: `http://localhost:${port}`,
      ADDRESS_HEADER: "x-forwarded-for",
    },
  },
});
