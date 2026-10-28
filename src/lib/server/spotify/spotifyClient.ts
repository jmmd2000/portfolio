import { z } from "zod";
import { coverRequestMilliseconds, maxCoverResults, type CoverResult } from "$lib/server/covers/coverResult";
import { parseAlbums } from "./albums";
import { parseNowPlaying, type NowPlaying } from "./nowPlaying";

export interface SpotifyClientOptions {
  clientID: string;
  clientSecret: string;
  refreshToken: string;
  /** Tests pass a fake */
  fetch?: typeof fetch;
  accountsURL?: string;
  apiURL?: string;
}

export interface SpotifyClient {
  /** What's playing, or null when nothing is or Spotify fails. One answer is shared by every caller for 30 seconds */
  getNowPlaying(): Promise<NowPlaying | null>;
  /** Albums matching the words, for the admin's cover search. Throws when Spotify fails, so the admin can be told */
  searchAlbums(query: string): Promise<CoverResult[]>;
}

const answerLifetimeMilliseconds = 30_000;
const tokenMarginMilliseconds = 60_000;
const timeoutMilliseconds = 1_500;

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
  refresh_token: z.string().min(1).optional(),
});

interface AccessToken {
  value: string;
  expiresAt: number;
}

interface CachedAnswer {
  answer: Promise<NowPlaying | null>;
  askedAt: number;
}

/**
 * A Spotify client for the signed-in account's currently playing track, and for album searches. It keeps the access token until a minute
 * before it expires, and it keeps each answer for 30 seconds, failures included, so a slow or failing Spotify holds
 * up at most one page load every 30 seconds. Each answer takes at most 1.5 seconds.
 */
export function createSpotifyClient(options: SpotifyClientOptions): SpotifyClient {
  const fetchFunction = options.fetch ?? fetch;
  const accountsURL = options.accountsURL ?? "https://accounts.spotify.com";
  const apiURL = options.apiURL ?? "https://api.spotify.com";
  const credentials = Buffer.from(`${options.clientID}:${options.clientSecret}`).toString("base64");

  let refreshToken = options.refreshToken;
  let accessToken: AccessToken | null = null;
  let cachedAnswer: CachedAnswer | null = null;

  async function getAccessToken(signal: AbortSignal): Promise<string> {
    if (accessToken && Date.now() < accessToken.expiresAt - tokenMarginMilliseconds) return accessToken.value;

    const response = await fetchFunction(`${accountsURL}/api/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
      signal,
    });
    if (!response.ok) throw new Error(`Spotify refused to refresh the access token (${response.status})`);

    const tokens = tokenResponseSchema.parse(await response.json());
    accessToken = { value: tokens.access_token, expiresAt: Date.now() + tokens.expires_in * 1000 };
    // Spotify can hand out a new refresh token, and the old one may then stop working
    if (tokens.refresh_token) refreshToken = tokens.refresh_token;

    return accessToken.value;
  }

  async function askSpotify(): Promise<NowPlaying | null> {
    const signal = AbortSignal.timeout(timeoutMilliseconds);
    try {
      const token = await getAccessToken(signal);
      const response = await fetchFunction(`${apiURL}/v1/me/player/currently-playing`, { headers: { Authorization: `Bearer ${token}` }, signal });

      if (response.status === 401) {
        accessToken = null;
        throw new Error("Spotify rejected the access token");
      }
      if (response.status === 204) return null;
      if (!response.ok) throw new Error(`Spotify answered ${response.status}`);

      return parseNowPlaying(await response.json());
    } catch (error) {
      console.error("Couldn't get what's playing on Spotify:", error);
      return null;
    }
  }

  return {
    getNowPlaying() {
      const now = Date.now();
      if (cachedAnswer && now - cachedAnswer.askedAt < answerLifetimeMilliseconds) return cachedAnswer.answer;

      // The answer is cached while Spotify is still being asked, so visitors arriving together share one request
      cachedAnswer = { answer: askSpotify(), askedAt: now };
      return cachedAnswer.answer;
    },

    async searchAlbums(query) {
      const signal = AbortSignal.timeout(coverRequestMilliseconds);
      const token = await getAccessToken(signal);
      const parameters = new URLSearchParams({ q: query, type: "album", limit: String(maxCoverResults) });
      const response = await fetchFunction(`${apiURL}/v1/search?${parameters}`, { headers: { Authorization: `Bearer ${token}` }, signal });

      if (response.status === 401) {
        accessToken = null;
        throw new Error("Spotify rejected the access token");
      }
      if (!response.ok) throw new Error(`Spotify answered ${response.status}`);

      return parseAlbums(await response.json());
    },
  };
}
