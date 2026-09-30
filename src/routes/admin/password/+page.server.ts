import { fail } from "@sveltejs/kit";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "$lib/server/auth";
import { newPasswordSchema } from "$lib/server/auth/passwordRules";
import type { Actions } from "./$types";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: newPasswordSchema,
    confirmation: z.string(),
  })
  .refine(values => values.newPassword === values.confirmation, { message: "The new passwords don't match." });

export const actions: Actions = {
  default: async ({ request }) => {
    const change = changePasswordSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!change.success) {
      return fail(400, { message: change.error.issues[0]?.message ?? "Check the form and try again." });
    }

    try {
      await auth.api.changePassword({
        body: { currentPassword: change.data.currentPassword, newPassword: change.data.newPassword, revokeOtherSessions: true },
        headers: request.headers,
      });
    } catch (error) {
      if (!(error instanceof APIError)) throw error;
      return fail(400, { message: "Your current password is wrong." });
    }

    return { changed: true, message: "Password changed. Every other session has been signed out." };
  },
};
