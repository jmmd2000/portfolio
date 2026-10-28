import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import * as Sentry from "@sentry/node";
import { buildServerErrorReportingOptions, reportServerError } from "./errorReporting";

interface SentEvent {
  exception?: { values?: { value?: string }[] };
}

const secretEmail = "admin@secret.example";
const secretNote = "secret-private-note";
let sentEvents: SentEvent[] = [];

beforeAll(() => {
  Sentry.init({
    ...buildServerErrorReportingOptions({ dsn: "https://key@glitchtip.invalid/2", environment: "production", release: "abc1234" }),
    transport: () => ({
      send: async envelope => {
        for (const [header, payload] of envelope[1]) {
          if (header.type === "event") sentEvents.push(payload as SentEvent);
        }
        return {};
      },
      flush: async () => true,
    }),
  });
});

afterAll(async () => {
  await Sentry.close();
});

beforeEach(() => {
  sentEvents = [];
});

describe("reportServerError", () => {
  it("keeps the query of a failed database query but not its values", async () => {
    const failure = new Error(`Failed query: insert into "users" ("email", "name") values ($1, $2)\nparams: ${secretEmail},${secretNote}`);

    reportServerError(failure);
    await Sentry.flush(2000);

    const message = sentEvents[0].exception?.values?.[0].value;
    expect(message).toBe('Failed query: insert into "users" ("email", "name") values ($1, $2)');
    expect(JSON.stringify(sentEvents)).not.toContain(secretNote);
  });

  it("cuts the value from a Postgres error but keeps the kind of failure", async () => {
    const failure = new Error(`invalid input syntax for type integer: "${secretNote}"`);
    failure.name = "PostgresError";

    reportServerError(failure);
    await Sentry.flush(2000);

    expect(sentEvents[0].exception?.values?.[0].value).toBe("invalid input syntax for type integer");
    expect(JSON.stringify(sentEvents)).not.toContain(secretNote);
  });

  it("leaves a message without query values as it is", async () => {
    reportServerError(new Error("the database went away"));
    await Sentry.flush(2000);

    expect(sentEvents[0].exception?.values?.[0].value).toBe("the database went away");
  });
});
