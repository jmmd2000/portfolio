import { getTableName } from "drizzle-orm";
import { drizzle, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { PgDatabase, PgTable } from "drizzle-orm/pg-core";
import postgres from "postgres";
import { currently, education, experience, profile, projects, skills, socials } from "./schema";
import { seedData } from "./seedData";

type Database = PgDatabase<PostgresJsQueryResultHKT>;

interface TableOutcome {
  tableName: string;
  seeded: boolean;
}

export interface SeedResult {
  seededTables: string[];
  skippedTables: string[];
}

/**
 * Fills each content table from the seed data, but only if the table is empty.
 */
export async function seedDatabase(databaseURL: string): Promise<SeedResult> {
  const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
  const database = drizzle(client, { casing: "snake_case" });

  try {
    const outcomes = await database.transaction(async transaction => [
      await seedTable(transaction, profile, [seedData.profile]),
      await seedTable(transaction, socials, seedData.socials),
      await seedTable(transaction, experience, seedData.experience),
      await seedTable(transaction, skills, seedData.skills),
      await seedTable(transaction, education, seedData.education),
      await seedTable(transaction, projects, seedData.projects),
      await seedTable(transaction, currently, seedData.currently),
    ]);

    return {
      seededTables: outcomes.filter(outcome => outcome.seeded).map(outcome => outcome.tableName),
      skippedTables: outcomes.filter(outcome => !outcome.seeded).map(outcome => outcome.tableName),
    };
  } finally {
    await client.end();
  }
}

/** Inserts the rows if the table is empty */
async function seedTable<Table extends PgTable>(database: Database, table: Table, rows: Table["$inferInsert"][]): Promise<TableOutcome> {
  const tableName = getTableName(table);

  const existingRows = await database.$count(table);
  if (existingRows > 0) {
    return { tableName, seeded: false };
  }

  await database.insert(table).values(rows);
  return { tableName, seeded: true };
}
