import { db } from "$lib/server/db";
import { liveSettings } from "$lib/server/db/schema";
import type { LiveSettingsInput } from "$lib/schemas/liveSettings";

export type LiveSettings = LiveSettingsInput;

/** What the site uses until the settings are first saved */
const defaultLiveSettings: LiveSettings = { visitorCountShown: true, spotifyShown: false };

export async function getLiveSettings(): Promise<LiveSettings> {
  const [row] = await db.select({ visitorCountShown: liveSettings.visitorCountShown, spotifyShown: liveSettings.spotifyShown }).from(liveSettings).limit(1);
  return row ?? defaultLiveSettings;
}

/** Saves the settings, and adds their row the first time */
export async function updateLiveSettings(input: LiveSettingsInput): Promise<void> {
  await db
    .insert(liveSettings)
    .values({ id: 1, ...input })
    .onConflictDoUpdate({ target: liveSettings.id, set: input });
}
