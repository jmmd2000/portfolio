// Rules for the Live parts settings. The Live parts form's action checks every save with them.
import { z } from "zod";
import { checkbox } from "./checkbox";

export const liveSettingsSchema = z.object({
  visitorCountShown: checkbox,
  /** The select sends "" for None, or a Currently row's id */
  spotifyRowID: z.union([z.literal("").transform(() => null), z.coerce.number().int().positive()]),
});

export type LiveSettingsInput = z.infer<typeof liveSettingsSchema>;
