ALTER TABLE "education" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "company_url" text;--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "highlights" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "show_on_cv" boolean DEFAULT false NOT NULL;