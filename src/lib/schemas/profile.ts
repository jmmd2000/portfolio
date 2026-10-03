// Rules for the profile text. The profile form's action checks every save with them.
import { z } from "zod";
import { requiredText } from "./requiredText";

export const profileSchema = z.object({
  name: requiredText("name", 80),
  role: requiredText("role", 80),
  location: requiredText("location", 80),
  bio: requiredText("bio", 1000),
});

export type ProfileInput = z.infer<typeof profileSchema>;
