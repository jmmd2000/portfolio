-- An existing profile starts with its role as the intro, until the intro is edited in admin
ALTER TABLE "profile" ADD COLUMN "intro" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "profile" SET "intro" = "role";--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "intro" DROP DEFAULT;
