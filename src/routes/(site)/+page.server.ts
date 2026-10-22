import { isListeningRow, withNowPlaying } from "$lib/components/home/nowPlayingRow";
import { toArticleListItem } from "$lib/server/content/articleList";
import { getHomeArticles } from "$lib/server/content/articles";
import { getShownCurrentlyRows } from "$lib/server/content/currently";
import { getLiveSettings } from "$lib/server/content/liveSettings";
import { countPublishedProjects, getFeaturedProjects } from "$lib/server/content/projects";
import { spotify } from "$lib/server/spotify";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [featuredProjects, projectCount, currentlyRows, homeArticles, liveSettings] = await Promise.all([
    getFeaturedProjects(),
    countPublishedProjects(),
    getShownCurrentlyRows(),
    getHomeArticles(),
    getLiveSettings(),
  ]);

  // Spotify is only asked when it's switched on and the Listening row is on the page
  const askSpotify = liveSettings.spotifyShown && currentlyRows.some(isListeningRow);
  const nowPlaying = askSpotify ? await spotify.getNowPlaying() : null;

  return { featuredProjects, projectCount, currentlyRows: withNowPlaying(currentlyRows, nowPlaying), articles: homeArticles.map(toArticleListItem) };
};
