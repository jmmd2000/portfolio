import { describe, expect, it } from "vitest";
import { qualificationSchema } from "./qualification";

const typedQualification = {
  degree: "BSc Computer Science",
  institution: "Maynooth University",
  location: "",
  grade: "2.1",
  startYear: "2019",
  endYear: "2023",
};

function firstError(qualification: Record<string, string>, field: string): string | undefined {
  const result = qualificationSchema.safeParse(qualification);
  if (result.success) return undefined;
  return result.error.issues.find(issue => issue.path[0] === field)?.message;
}

describe("qualificationSchema", () => {
  it("stores the years as numbers, and an empty location as null", () => {
    const qualification = qualificationSchema.parse(typedQualification);

    expect(qualification.startYear).toBe(2019);
    expect(qualification.endYear).toBe(2023);
    expect(qualification.location).toBeNull();
  });

  it("refuses a year that isn't four digits, including an empty one", () => {
    expect(firstError({ ...typedQualification, startYear: "19" }, "startYear")).toBe("Use a year");
    expect(firstError({ ...typedQualification, endYear: "" }, "endYear")).toBe("Use a year");
  });

  it("refuses a qualification that finished before it started", () => {
    expect(firstError({ ...typedQualification, endYear: "2018" }, "endYear")).toBe("End year can't be before start year");
  });
});
