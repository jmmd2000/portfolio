import { readFileSync } from "node:fs";
import adapter from "@sveltejs/adapter-node";
import { sveltekit } from "@sveltejs/kit/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const packageJSON: { version: string } = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig({
  // The build the admin shows. The Docker build passes GIT_SHA and BUILT_AT in
  define: {
    __APP_VERSION__: JSON.stringify(packageJSON.version),
    __GIT_SHA__: JSON.stringify(process.env.GIT_SHA ?? "dev"),
    __BUILT_AT__: JSON.stringify(process.env.BUILT_AT ?? ""),
  },
  build: {
    // "hidden" writes the maps without linking them from the bundles. The Docker build uploads them, then deletes them.
    sourcemap: "hidden",
  },
  plugins: [
    sveltekit({
      compilerOptions: {
        runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
      },
      adapter: adapter(),
      // Every stylesheet is under 10kB, so all of a page's CSS goes in the HTML and nothing blocks the first paint
      inlineStyleThreshold: 10_240,
      typescript: {
        // Type-check and lint the db scripts and drizzle config along with the app
        config: tsconfig => {
          tsconfig.include.push("../scripts/**/*.ts", "../drizzle.config.ts", "../e2e/**/*.ts", "../playwright.config.ts");
        },
      },
    }),
  ],
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium", headless: true }],
          },
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"],
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}", "src/**/*.integration.test.ts"],
          fileParallelism: false,
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.integration.test.ts"],
          globalSetup: ["src/lib/server/db/integrationSetup.ts"],
          setupFiles: ["src/lib/server/db/useTestDatabase.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
