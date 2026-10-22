import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const profile = pgTable(
  "profile",
  {
    id: integer().primaryKey().default(1),
    name: text().notNull(),
    role: text().notNull(),
    intro: text().notNull(),
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

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull(),
    body: text().notNull(),
    published: boolean().notNull().default(false),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => [check("articles_published_date", sql`not ${table.published} or ${table.publishedAt} is not null`)]
);

/** Each slug an article had before it was renamed, so its old address can redirect to the current one */
export const articleSlugRedirects = pgTable("article_slug_redirects", {
  oldSlug: text().primaryKey(),
  articleID: integer()
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const currently = pgTable("currently", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  label: text().notNull(),
  title: text().notNull(),
  subtitle: text(),
  url: text(),
  imageURL: text(),
  shown: boolean().notNull().default(true),
  sort: integer().notNull(),
});

/** Running totals, one row per name, such as "visitors" */
export const counters = pgTable("counters", {
  name: text().primaryKey(),
  count: integer().notNull(),
});

/** Settings for the live parts of the site. There is only ever one row */
export const liveSettings = pgTable(
  "live_settings",
  {
    id: integer().primaryKey().default(1),
    visitorCountShown: boolean().notNull().default(true),
  },
  table => [check("live_settings_singleton", sql`${table.id} = 1`)]
);

/** The secret that scrambles visitors' IPs on one Irish date. A new random one is made each day */
export const visitorSecrets = pgTable("visitor_secrets", {
  day: date().primaryKey(),
  secret: text().notNull(),
});

/** The scrambled IP of each visitor counted on one Irish date */
export const visitorHashes = pgTable(
  "visitor_hashes",
  {
    day: date().notNull(),
    hash: text().notNull(),
  },
  table => [primaryKey({ columns: [table.day, table.hash] })]
);

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
