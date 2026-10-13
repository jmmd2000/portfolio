CREATE TABLE "article_slug_redirects" (
	"old_slug" text PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_slug_redirects" ADD CONSTRAINT "article_slug_redirects_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;