import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

// Better-auth tables

export const users = pgTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  table => [index("sessions_user_id_index").on(table.userId)]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  table => [index("accounts_user_id_index").on(table.userId)]
);

export const verifications = pgTable(
  "verifications",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  table => [index("verifications_identifier_index").on(table.identifier)]
);
