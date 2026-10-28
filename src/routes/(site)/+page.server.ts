import { isListeningRow, withNowPlaying } from "$lib/components/home/nowPlayingRow";
import { toArticleListItem } from "$lib/server/content/articleList";
import { getHomeArticles } from "$lib/server/content/articles";
import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { getLiveSettings } from "$lib/server/content/liveSettings";
import { countPublishedProjects, getFeaturedProjects } from "$lib/server/content/projects";
import { getPlumState } from "$lib/server/plum/actions";
import { spotify } from "$lib/server/spotify";
import type { PlumState } from "$lib/schemas/plumState";
import type { PageServerLoad } from "./$types";

/** Plum's state, or null if it can't be read. Then her pen shows her asleep with the buttons off, and the page still loads */
async function loadPlum(): Promise<PlumState | null> {
  try {
    return await getPlumState(new Date());
  } catch (error) {
    console.error("Couldn't read Plum's state:", error);
    return null;
  }
}

export const load: PageServerLoad = async () => {
  const [featuredProjects, projectCount, currentlyRows, homeArticles, liveSettings, plum] = await Promise.all([
    getFeaturedProjects(),
    countPublishedProjects(),
    getShownCurrentlyRows(),
    getHomeArticles(),
    getLiveSettings(),
    loadPlum(),
  ]);

  // Spotify is only asked when it's switched on and the Listening row is on the page
  const askSpotify = liveSettings.spotifyShown && currentlyRows.some(isListeningRow);
  const nowPlaying = askSpotify ? await spotify.getNowPlaying() : null;

  return { featuredProjects, projectCount, currentlyRows: withNowPlaying(currentlyRows, nowPlaying), articles: homeArticles.map(toArticleListItem), plum };
};
