import type { User } from "better-auth";
import type { Social } from "$lib/server/content/socials";

declare global {
  /** Set by Vite's `define` in vite.config.ts */
  const __APP_VERSION__: string;
  const __GIT_SHA__: string;
  const __BUILT_AT__: string;

  namespace App {
    interface Locals {
      /** The signed-in admin, or null. Looked up on every page, but only when a session cookie is present. */
      user: User | null;
    }
    /** The root layout's data. An error page can show before it loads, so each part may be missing there */
    interface PageData {
      socials?: Social[];
      hasArticles?: boolean;
    }
  }
}

export {};
