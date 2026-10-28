// Gets a new Spotify refresh token and saves it to .env. Run it when Spotify stops accepting the old one.
// The app's settings at developer.spotify.com must list http://127.0.0.1:8888/callback as a redirect URI.
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z } from "zod";

const redirectURI = "http://127.0.0.1:8888/callback";
const scope = "user-read-currently-playing";
const envPath = ".env";

// Not $lib/server/env: that refuses to load without a refresh token, which is what this script is for
const credentials = z.object({ SPOTIFY_CLIENT_ID: z.string().min(1), SPOTIFY_CLIENT_SECRET: z.string().min(1) }).safeParse(process.env);
if (!credentials.success) {
  console.error("Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env first.");
  process.exit(1);
}

const { SPOTIFY_CLIENT_ID: clientID, SPOTIFY_CLIENT_SECRET: clientSecret } = credentials.data;
const state = randomBytes(16).toString("hex");
const tokenResponseSchema = z.object({ refresh_token: z.string().min(1) });

/** Swaps the code from Spotify's sign-in for a refresh token */
async function exchangeCode(code: string): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${clientID}:${clientSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectURI }),
  });
  if (!response.ok) throw new Error(`Spotify refused the code (${response.status})`);

  return tokenResponseSchema.parse(await response.json()).refresh_token;
}

/** Replaces the SPOTIFY_REFRESH_TOKEN line in .env, or adds it at the end */
function saveRefreshToken(refreshToken: string): void {
  const line = `SPOTIFY_REFRESH_TOKEN="${refreshToken}"`;
  const lines = readFileSync(envPath, "utf8").split("\n");
  const index = lines.findIndex(existing => existing.startsWith("SPOTIFY_REFRESH_TOKEN="));

  if (index !== -1) {
    lines[index] = line;
  } else {
    while (lines.length > 0 && lines.at(-1) === "") lines.pop();
    lines.push(line, "");
  }
  writeFileSync(envPath, lines.join("\n"));
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", redirectURI);
  if (url.pathname !== "/callback") {
    response.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  if (url.searchParams.get("state") !== state || !code) {
    response.writeHead(400).end("Sign-in failed. Check the terminal.");
    console.error(`Sign-in failed: ${url.searchParams.get("error") ?? "the answer didn't match this sign-in"}`);
    server.close();
    process.exitCode = 1;
    return;
  }

  try {
    saveRefreshToken(await exchangeCode(code));
    response.writeHead(200, { "Content-Type": "text/plain" }).end("Done. The refresh token is saved in .env. You can close this tab.");
    console.log("Saved the new refresh token in .env. Restart the dev server to use it.");
  } catch (error) {
    response.writeHead(500).end("Getting the token failed. Check the terminal.");
    console.error("Getting the token failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
  server.close();
}

const server = createServer((request, response) => void handleRequest(request, response));

server.listen(8888, "127.0.0.1", () => {
  const authorizeURL = new URL("https://accounts.spotify.com/authorize");
  authorizeURL.search = new URLSearchParams({ response_type: "code", client_id: clientID, scope, redirect_uri: redirectURI, state }).toString();
  console.log(`Open this address, sign in to Spotify and agree:\n${authorizeURL}`);
});
