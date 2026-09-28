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
  },
  webServer: {
    command: "pnpm build && node build",
    port,
    env: {
      PORT: String(port),
      NODE_ENV: "production",
      DATABASE_URL: e2eEnvironment.DATABASE_URL_TEST_E2E,
      DATABASE_URL_MIGRATE: e2eEnvironment.DATABASE_URL_TEST_E2E,
    },
  },
});
