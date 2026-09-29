import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { projects } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { getCV } from "./cv";
import { countPublishedProjects, getFeaturedProjects, getPublishedProjects } from "./projects";

const draftTitle = "Unpublished draft";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);

  // Featured, on the CV and sorted first, so it would show everywhere if the published filter were missing
  await db.insert(projects).values({
    title: draftTitle,
    description: "Not ready yet.",
    imageURL: "https://assets.jamesmddoyle.com/draft.webp",
    featured: true,
    showOnCV: true,
    published: false,
    sort: 0,
  });
});

function titlesOf(projectList: { title: string }[]): string[] {
  return projectList.map(project => project.title);
}

describe("unpublished projects", () => {
  it("never appear on the index", async () => {
    const titles = titlesOf(await getPublishedProjects());

    expect(titles).not.toContain(draftTitle);
    expect(await countPublishedProjects()).toBe(titles.length);
  });

  it("never appear on the home page", async () => {
    expect(titlesOf(await getFeaturedProjects())).not.toContain(draftTitle);
  });

  it("never appear on the CV", async () => {
    const cv = await getCV();

    expect(titlesOf(cv.projects)).not.toContain(draftTitle);
  });
});

describe("the home page", () => {
  it("shows at most three featured projects, in sort order", async () => {
    await db.insert(projects).values({
      title: "Fourth featured",
      description: "Sorted last, so it's the one left off.",
      imageURL: "https://assets.jamesmddoyle.com/fourth.webp",
      featured: true,
      published: true,
      sort: 99,
    });

    const titles = titlesOf(await getFeaturedProjects());

    expect(titles).toEqual(["JamesReviewsMusic", "Phantom", "SandSim"]);
  });
});
