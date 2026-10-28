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
      // Image storage the tests can't reach, so the e2e server never touches a real bucket
      R2_ENDPOINT: "http://127.0.0.1:9",
      R2_ACCESS_KEY_ID: "e2e",
      R2_SECRET_ACCESS_KEY: "e2e",
      R2_BUCKET: "e2e",
      ASSETS_URL: "https://assets.e2e.invalid",
      // No test picks a row for Spotify to replace or lets a cover search reach the server, so the server never calls it
      SPOTIFY_CLIENT_ID: "e2e",
      SPOTIFY_CLIENT_SECRET: "e2e",
      SPOTIFY_REFRESH_TOKEN: "e2e",
      // As in production, so a 10 MB upload reaches the app instead of being refused by the server first
      BODY_SIZE_LIMIT: "11M",
    },
  },
});
