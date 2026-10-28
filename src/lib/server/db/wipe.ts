import postgres from "postgres";

const localHosts = ["localhost", "127.0.0.1", "[::1]"];
const wipeableNameEndings = ["_dev", "_test", "_test_e2e"];

/**
 * Throws unless the URL points at a local dev or test database, so a wipe can never reach production.
 */
export function assertSafeToWipe(databaseURL: string): void {
  const url = new URL(databaseURL);
  const databaseName = url.pathname.slice(1);

  if (!localHosts.includes(url.hostname)) {
    throw new Error(`Refusing to wipe "${databaseName}": host "${url.hostname}" is not local`);
  }

  const hasWipeableName = wipeableNameEndings.some(ending => databaseName.endsWith(ending));
  if (!hasWipeableName) {
    throw new Error(`Refusing to wipe "${databaseName}": the name must end in _dev, _test or _test_e2e`);
  }
}

/**
 * Wipes every table in the public schema.
 */
export async function wipeDatabase(databaseURL: string): Promise<void> {
  assertSafeToWipe(databaseURL);

  const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
  try {
    const tables = await client<{ tablename: string }[]>`select tablename from pg_tables where schemaname = 'public'`;
    for (const table of tables) {
      await client`truncate table ${client(table.tablename)} restart identity cascade`;
    }
  } finally {
    await client.end();
  }
}

const testNameEndings = ["_test", "_test_e2e"];

/**
 * Throws unless tests are running (NODE_ENV=test) against a test database. Tests wipe before every run,
 * so they get this stricter check on top of assertSafeToWipe.
 */
export function assertTestDatabase(databaseURL: string): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(`Refusing to wipe for tests: NODE_ENV is "${process.env.NODE_ENV}", not "test"`);
  }

  const databaseName = new URL(databaseURL).pathname.slice(1);
  const isTestDatabase = testNameEndings.some(ending => databaseName.endsWith(ending));
  if (!isTestDatabase) {
    throw new Error(`Refusing to wipe "${databaseName}" for tests: the name must end in _test or _test_e2e`);
  }
}
