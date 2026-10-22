CREATE TABLE "plum" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"food" integer DEFAULT 80 NOT NULL,
	"happiness" integer DEFAULT 80 NOT NULL,
	"energy" integer DEFAULT 100 NOT NULL,
	"decayed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plum_singleton" CHECK ("plum"."id" = 1),
	CONSTRAINT "plum_food_range" CHECK ("plum"."food" between 0 and 100),
	CONSTRAINT "plum_happiness_range" CHECK ("plum"."happiness" between 0 and 100),
	CONSTRAINT "plum_energy_range" CHECK ("plum"."energy" between 0 and 100)
);
