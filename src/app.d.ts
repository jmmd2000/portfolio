// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from "better-auth";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      /** The signed-in admin. Only looked up for admin routes, so it's always null elsewhere. */
      user: User | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
