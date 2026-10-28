CREATE TABLE "plum_cooldowns" (
	"action" text PRIMARY KEY NOT NULL,
	"ready_at" timestamp with time zone NOT NULL,
	CONSTRAINT "plum_cooldowns_action" CHECK ("plum_cooldowns"."action" in ('feed', 'pet', 'play'))
);
