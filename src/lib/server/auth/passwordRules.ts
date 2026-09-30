import { z } from "zod";

/** Password requirements. */
export const newPasswordSchema = z.string().min(8, "Use at least 8 characters.").max(128, "Use 128 characters or fewer.");
