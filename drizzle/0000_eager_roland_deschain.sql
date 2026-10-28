CREATE TABLE "currently" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "currently_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"url" text,
	"image_url" text,
	"sort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "education_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"degree" text NOT NULL,
	"institution" text NOT NULL,
	"grade" text NOT NULL,
	"start_year" integer NOT NULL,
	"end_year" integer NOT NULL,
	"sort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "experience_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"company" text NOT NULL,
	"logo_url" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"bullets" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"sort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text NOT NULL,
	"location" text NOT NULL,
	CONSTRAINT "profile_singleton" CHECK ("profile"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"source_url" text,
	"live_url" text,
	"live_label" text,
	"stack" text[] DEFAULT '{}' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"sort" integer NOT NULL,
	CONSTRAINT "projects_live_link" CHECK (("projects"."live_url" is null) = ("projects"."live_label" is null))
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "skills_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category" text NOT NULL,
	"items" text[] DEFAULT '{}' NOT NULL,
	"sort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "socials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"url" text NOT NULL,
	"sort" integer NOT NULL
);
