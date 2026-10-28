import { z } from "zod";
import { checkbox } from "./checkbox";

export const liveSettingsSchema = z.object({
  visitorCountShown: checkbox,
  spotifyShown: checkbox,
});

export type LiveSettingsInput = z.infer<typeof liveSettingsSchema>;
