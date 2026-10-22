// Rules for the Live parts settings. The Live parts form's action checks every save with them.
import { z } from "zod";
import { checkbox } from "./checkbox";

export const liveSettingsSchema = z.object({
  visitorCountShown: checkbox,
});

export type LiveSettingsInput = z.infer<typeof liveSettingsSchema>;
