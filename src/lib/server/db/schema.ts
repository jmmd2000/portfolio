import { sql } from "drizzle-orm";
import { boolean, check, date, integer, pgTable, text } from "drizzle-orm/pg-core";

export const profile = pgTable(
  "profile",
  {
    id: integer().primaryKey().default(1),
    name: text().notNull(),
    role: text().notNull(),
    bio: text().notNull(),
    location: text().notNull(),
  },
  table => [check("profile_singleton", sql`${table.id} = 1`)]
);

export const socials = pgTable("socials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  url: text().notNull(),
  sort: integer().notNull(),
});

export const experience = pgTable("experience", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  company: text().notNull(),
  companyURL: text(),
  location: text(),
  logoURL: text().notNull(),
  startDate: date().notNull(),
  endDate: date(),
  bullets: text().array().notNull().default([]),
  tags: text().array().notNull().default([]),
  sort: integer().notNull(),
});

export const skills = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  category: text().notNull(),
  items: text().array().notNull().default([]),
  sort: integer().notNull(),
});

export const education = pgTable("education", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  degree: text().notNull(),
  institution: text().notNull(),
  location: text(),
  grade: text().notNull(),
  startYear: integer().notNull(),
  endYear: integer().notNull(),
  sort: integer().notNull(),
});

export const projects = pgTable(
  "projects",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    description: text().notNull(),
    imageURL: text().notNull(),
    sourceURL: text(),
    liveURL: text(),
    liveLabel: text(),
    stack: text().array().notNull().default([]),
    year: integer(),
    highlights: text().array().notNull().default([]),
    featured: boolean().notNull().default(false),
    showOnCV: boolean().notNull().default(false),
    published: boolean().notNull().default(false),
    sort: integer().notNull(),
  },
  table => [check("projects_live_link", sql`(${table.liveURL} is null) = (${table.liveLabel} is null)`)]
);

export const currently = pgTable("currently", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  label: text().notNull(),
  title: text().notNull(),
  subtitle: text(),
  url: text(),
  imageURL: text(),
  sort: integer().notNull(),
});
