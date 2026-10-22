CREATE TABLE "live_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"visitor_count_shown" boolean DEFAULT true NOT NULL,
	CONSTRAINT "live_settings_singleton" CHECK ("live_settings"."id" = 1)
);
