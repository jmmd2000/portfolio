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
  it("stores empty optional fields as null", () => {
    const project = projectSchema.parse(typedProject);

    expect(project.liveURL).toBeNull();
    expect(project.liveLabel).toBeNull();
    expect(project.sourceURL).toBeNull();
    expect(project.year).toBeNull();
  });

  it("stores the year as a number, and refuses one that isn't four digits", () => {
    expect(projectSchema.parse({ ...typedProject, year: "2026" }).year).toBe(2026);
    expect(firstError({ ...typedProject, year: "26" }, "year")).toBeDefined();
  });

  it("needs the live link and its text together", () => {
    expect(firstError({ ...typedProject, liveURL: "https://phantom.dev" }, "liveLabel")).toBeDefined();
    expect(firstError({ ...typedProject, liveLabel: "npm" }, "liveURL")).toBeDefined();
    expect(projectSchema.safeParse({ ...typedProject, liveURL: "https://phantom.dev", liveLabel: "Try it" }).success).toBe(true);
  });
});
