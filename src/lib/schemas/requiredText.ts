// The rule for a short piece of text that every content schema uses.
import { z } from "zod";

/** Text that must have something in it once the spaces around it are trimmed */
export function requiredText(label: string, maxLength: number) {
  return z.string().trim().min(1, `Add a ${label}.`).max(maxLength, `Keep the ${label} to ${maxLength} characters or fewer.`);
}
