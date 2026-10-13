// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from "better-auth";
import type { Social } from "$lib/server/content/socials";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      /** The signed-in admin, or null. Looked up on every page, but only when a session cookie is present. */
      user: User | null;
    }
    /** The root layout's data. An error page can show before it loads, so each part may be missing there */
    interface PageData {
      socials?: Social[];
      signedIn?: boolean;
      hasArticles?: boolean;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
