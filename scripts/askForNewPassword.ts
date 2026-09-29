import password from "@inquirer/password";
import { z } from "zod";

// The same minimum better-auth's own sign-up uses
const passwordSchema = z.string().min(8, "Use at least 8 characters.");

function validatePassword(value: string): true | string {
  const result = passwordSchema.safeParse(value);
  return result.success || (result.error.issues[0]?.message ?? "That password won't work.");
}

/** Asks for a new password twice, hidden as it's typed, so it never lands in the shell history. */
export async function askForNewPassword(): Promise<string> {
  const newPassword = await password({ message: "New password", mask: true, validate: validatePassword });
  const confirmation = await password({ message: "Type it again", mask: true });

  if (newPassword !== confirmation) {
    throw new Error("The two passwords didn't match. Nothing was changed.");
  }
  return newPassword;
}
