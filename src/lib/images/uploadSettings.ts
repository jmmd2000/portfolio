import { z } from "zod";

const storageKey = "image-upload-settings";

const uploadSettingsSchema = z.object({
  maxWidth: z.number().int().min(16).max(10_000),
  quality: z.number().int().min(1).max(100),
  convertToWebP: z.boolean(),
});

/** How the uploader processes JPEG and PNG images before sending them */
export type UploadSettings = z.infer<typeof uploadSettingsSchema>;

export const defaultUploadSettings: UploadSettings = { maxWidth: 1600, quality: 80, convertToWebP: true };

/** The last settings used in this browser, or the defaults when there are none, they can't be read, or storage is blocked */
export function readUploadSettings(storage: Pick<Storage, "getItem">): UploadSettings {
  try {
    const stored = storage.getItem(storageKey);
    if (stored === null) return defaultUploadSettings;

    const result = uploadSettingsSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : defaultUploadSettings;
  } catch {
    return defaultUploadSettings;
  }
}

/** Remembers the settings. Does nothing when the browser blocks storage */
export function writeUploadSettings(storage: Pick<Storage, "setItem">, settings: UploadSettings): void {
  try {
    storage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Without storage the uploader still works, it just starts from the defaults next time
  }
}
