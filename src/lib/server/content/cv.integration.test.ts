import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { education, experience } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { getCV } from "./cv";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("getCV", () => {
  it("lists current jobs first, then the rest by when they ended", async () => {
    // Started after the current Ericsson job, so sorting by start date alone would put it first
    await db.insert(experience).values({ title: "Contractor", company: "Acme", logoURL: "https://assets.jamesmddoyle.com/acme.png", startDate: "2023-09-01", endDate: "2024-03-01" });

    const { jobs } = await getCV();
    expect(jobs.map(job => job.company)).toEqual(["Ericsson", "Acme", "Fusio"]);
  });

  it("lists qualifications by when they ended, newest first", async () => {
    await db.insert(education).values({ degree: "Certificate", institution: "Night school", grade: "Pass", startYear: 2020, endYear: 2020 });

    const { qualifications } = await getCV();
    expect(qualifications.map(qualification => qualification.institution)).toEqual(["Maynooth University", "Night school", "Dunboyne College of Further Education"]);
  });
});
