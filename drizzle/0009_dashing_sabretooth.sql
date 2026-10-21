ALTER TABLE "articles" DROP CONSTRAINT "articles_project_id_unique";--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "articles_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "project_id";