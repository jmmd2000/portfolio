import { env } from "$lib/server/env";
import { createSpotifyClient } from "./spotifyClient";

/** The site's one Spotify client, so every visitor shares its access token and its 30-second answer */
export const spotify = createSpotifyClient({
  clientID: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  refreshToken: env.SPOTIFY_REFRESH_TOKEN,
});
