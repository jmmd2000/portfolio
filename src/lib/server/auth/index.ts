import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { authOptions } from "./options";

/**
 * better-auth for the running app. Its HTTP handler is never mounted: login and logout are SvelteKit
 * actions that call `auth.api` on the server, so every login goes through the rate limiter. The
 * sveltekitCookies plugin sets the session cookie on the SvelteKit response.
 */
export const auth = betterAuth({ ...authOptions(db), plugins: [sveltekitCookies(getRequestEvent)] });
