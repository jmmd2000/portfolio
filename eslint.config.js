import path from "node:path";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import { defineConfig, includeIgnoreFile } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  prettier,
  svelte.configs.prettier,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    rules: {
      "svelte/button-has-type": "error",
      "svelte/prefer-const": "error",
      eqeqeq: "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // Playwright fixtures take an empty {} first parameter when they depend on no other fixture
    files: ["e2e/**/*.ts"],
    rules: {
      "no-empty-pattern": ["error", { allowObjectPatternsAsParameters: true }],
    },
  }
);
