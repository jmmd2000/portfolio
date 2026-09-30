import password from "@inquirer/password";
import { newPasswordSchema } from "$lib/server/auth/passwordRules";

function validatePassword(value: string): true | string {
  const result = newPasswordSchema.safeParse(value);
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
