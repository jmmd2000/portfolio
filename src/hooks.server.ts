import type { Handle, HandleServerError, ServerInit } from "@sveltejs/kit";
import type { User } from "better-auth";
import { getSessionCookie } from "better-auth/cookies";
import { env } from "$env/dynamic/public";
import { parseErrorReportingConfig } from "$lib/errorReportingConfig";
import { auth } from "$lib/server/auth";
import { reportServerError, startServerErrorReporting } from "$lib/server/errorReporting";
import { startPlumDecay } from "$lib/server/plum/plum";
import { startVisitorCleanup } from "$lib/server/visitors/visits";

const loginPath = "/admin/login";

export const init: ServerInit = () => {
  startServerErrorReporting(parseErrorReportingConfig(env));
  startVisitorCleanup();
  startPlumDecay();
};

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
}

function redirectTo(location: string): Response {
  return new Response(null, { status: 303, headers: { location } });
}

async function findAdmin(request: Request): Promise<User | null> {
  if (!getSessionCookie(request)) return null;

  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

/** Every admin page and admin API needs a signed-in session. Public pages don't */
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = await findAdmin(event.request);
  if (!isAdminPath(event.url.pathname)) return resolve(event);

  if (event.url.pathname === loginPath) {
    return event.locals.user ? redirectTo("/admin") : resolve(event);
  }

  if (event.locals.user) return resolve(event);

  if (event.url.pathname.startsWith("/api/")) {
    return new Response("Sign in first", { status: 401 });
  }
  return redirectTo(loginPath);
};

/**
 * Logs and reports errors the site did not expect. SvelteKit also calls this for a missing
 * page (404), which is not a fault, so only server errors (500 and above) are reported.
 * The route, such as `/articles/[slug]`, is reported instead of the address.
 */
export const handleError: HandleServerError = ({ error, event, status }) => {
  const request = { route: event.route.id ?? "unmatched", method: event.request.method };
  console.error("Unhandled error:", error, request);
  if (status >= 500) reportServerError(error, request);
};
