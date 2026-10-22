import { withNowPlaying } from "$lib/components/home/nowPlayingRow";
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

  // Spotify is only asked when the row it can replace is on the page
  const spotifyRowShown = currentlyRows.some(row => row.id === liveSettings.spotifyRowID);
  const nowPlaying = spotifyRowShown ? await spotify.getNowPlaying() : null;

  return { featuredProjects, projectCount, currentlyRows: withNowPlaying(currentlyRows, liveSettings.spotifyRowID, nowPlaying), articles: homeArticles.map(toArticleListItem) };
};
