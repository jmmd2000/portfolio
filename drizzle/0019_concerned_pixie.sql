CREATE TABLE "spotify_albums" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"artists" text[] NOT NULL,
	"release_year" integer NOT NULL,
	"cover_url" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
