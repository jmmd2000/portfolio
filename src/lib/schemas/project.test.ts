import { describe, expect, it } from "vitest";
import { projectSchema } from "./project";

const typedProject = {
  title: "Phantom",
  description: "A mock API server.",
  imageURL: "https://assets.jamesmddoyle.com/phantom.webp",
  liveURL: "",
  liveLabel: "",
  sourceURL: "",
  stack: "Svelte\nNode.js",
  year: "",
  highlights: "",
};

function firstError(project: Record<string, string>, field: string): string | undefined {
  const result = projectSchema.safeParse(project);
  if (result.success) return undefined;
  return result.error.issues.find(issue => issue.path[0] === field)?.message;
}

describe("projectSchema", () => {
  it("reads a ticked checkbox as true, and a missing one as false", () => {
    const project = projectSchema.parse({ ...typedProject, published: "on" });

    expect(project.published).toBe(true);
    expect(project.featured).toBe(false);
    expect(project.showOnCV).toBe(false);
  });

  it("stores empty optional fields as null", () => {
    const project = projectSchema.parse(typedProject);

    expect(project.liveURL).toBeNull();
    expect(project.liveLabel).toBeNull();
    expect(project.sourceURL).toBeNull();
    expect(project.year).toBeNull();
  });

  it("stores the year as a number, and refuses one that isn't four digits", () => {
    expect(projectSchema.parse({ ...typedProject, year: "2026" }).year).toBe(2026);
    expect(firstError({ ...typedProject, year: "26" }, "year")).toBe("Use a year, or leave it empty");
  });

  it("needs the live link and its text together", () => {
    expect(firstError({ ...typedProject, liveURL: "https://phantom.dev" }, "liveLabel")).toBe("Add the text for the live link");
    expect(firstError({ ...typedProject, liveLabel: "npm" }, "liveURL")).toBe("Add the live link, or clear its text");
    expect(projectSchema.safeParse({ ...typedProject, liveURL: "https://phantom.dev", liveLabel: "Try it" }).success).toBe(true);
  });
});
