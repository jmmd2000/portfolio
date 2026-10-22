CREATE TABLE "counters" (
	"name" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_hashes" (
	"day" date NOT NULL,
	"hash" text NOT NULL,
	CONSTRAINT "visitor_hashes_day_hash_pk" PRIMARY KEY("day","hash")
);
--> statement-breakpoint
CREATE TABLE "visitor_secrets" (
	"day" date PRIMARY KEY NOT NULL,
	"secret" text NOT NULL
);
