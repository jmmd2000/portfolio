import { fail, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "$lib/server/auth";
import { loginLimiter } from "$lib/server/auth/loginLimiter";
import type { Actions } from "./$types";

const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });

export const actions: Actions = {
  default: async ({ request, getClientAddress }) => {
    const clientAddress = getClientAddress();
    const limit = loginLimiter.check(clientAddress);
    if (!limit.allowed) {
      const minutes = Math.ceil(limit.retryAfterMs / 60_000);
      return fail(429, { email: "", message: `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.` });
    }

    const formData = Object.fromEntries(await request.formData());
    const email = typeof formData.email === "string" ? formData.email : "";
    const login = loginSchema.safeParse(formData);
    if (!login.success) {
      loginLimiter.record(clientAddress);
      return fail(400, { email, message: "Wrong email or password." });
    }

    try {
      await auth.api.signInEmail({ body: login.data, headers: request.headers });
    } catch (error) {
      if (!(error instanceof APIError)) throw error;
      loginLimiter.record(clientAddress);
      return fail(400, { email, message: "Wrong email or password." });
    }

    redirect(303, "/admin");
  },
};
