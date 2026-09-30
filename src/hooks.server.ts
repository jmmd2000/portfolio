import type { Handle } from "@sveltejs/kit";
import type { User } from "better-auth";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "$lib/server/auth";

const loginPath = "/admin/login";

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
}

function redirectTo(location: string): Response {
  return new Response(null, { status: 303, headers: { location } });
}

/** Only look up the signed in admin when the cookie is present */
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
