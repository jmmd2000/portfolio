// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from "better-auth";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      /** The signed-in admin, or null. Looked up on every page, but only when a session cookie is present. */
      user: User | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
