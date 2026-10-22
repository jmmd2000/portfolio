import { describe, expect, it } from "vitest";
import type { ImageReferences } from "$lib/server/content/imageReferences";
import { imageUses } from "./imageUses";

const logo = "https://assets.jamesmddoyle.com/ericsson-1a2b3c4d.png";
const screenshot = "https://assets.jamesmddoyle.com/sandsim-5e6f7a8b.webp";

const references: ImageReferences = {
  articles: [
    { title: "How the sand falls", body: `Some text.\n\n![The grid](${screenshot})` },
    { title: "No pictures", body: "Just words." },
  ],
  projects: [{ title: "SandSim", imageURL: screenshot }],
  currentlyRows: [{ label: "Playing", title: "Fallout 4", imageURL: null }],
  jobs: [{ title: "Software Engineer", company: "Ericsson", logoURL: logo }],
};

describe("imageUses", () => {
  it("names every row that uses an image, from article bodies to CV logos", () => {
    const uses = imageUses([screenshot, logo], references);

    expect(uses.get(screenshot)).toEqual(["Article: How the sand falls", "Project: SandSim"]);
    expect(uses.get(logo)).toEqual(["CV: Software Engineer at Ericsson"]);
  });

  it("gives an empty list for an image nothing uses", () => {
    expect(imageUses(["https://assets.jamesmddoyle.com/unused.png"], references).get("https://assets.jamesmddoyle.com/unused.png")).toEqual([]);
  });
});
