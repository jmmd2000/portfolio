import { describe, expect, it } from "vitest";
import { jobSchema } from "./job";

const typedJob = {
  title: "Software Engineer",
  company: "Ericsson",
  companyURL: "",
  location: "  ",
  logoURL: "https://assets.jamesmddoyle.com/ericsson.png",
  startDate: "2023-07",
  endDate: "",
  bullets: "Led testing",
  tags: "Go",
};

function firstError(job: Record<string, string>, field: string): string | undefined {
  const result = jobSchema.safeParse(job);
  if (result.success) return undefined;
  return result.error.issues.find(issue => issue.path[0] === field)?.message;
}

describe("jobSchema", () => {
  it("stores the typed months as dates, and empty optional fields as null", () => {
    const job = jobSchema.parse({ ...typedJob, endDate: "2024-03" });

    expect(job.startDate).toBe("2023-07-01");
    expect(job.endDate).toBe("2024-03-01");
    expect(job.companyURL).toBeNull();
    expect(job.location).toBeNull();
  });

  it("treats an empty Finished as a current job", () => {
    expect(jobSchema.parse(typedJob).endDate).toBeNull();
  });

  it("refuses a month that doesn't exist or isn't written like 2023-07", () => {
    expect(firstError({ ...typedJob, startDate: "2023-13" }, "startDate")).toBeDefined();
    expect(firstError({ ...typedJob, startDate: "July 2023" }, "startDate")).toBeDefined();
  });

  it("refuses a job that finished before it started", () => {
    expect(firstError({ ...typedJob, endDate: "2022-01" }, "endDate")).toBeDefined();
  });

  it("allows a job that started and finished in the same month", () => {
    expect(jobSchema.safeParse({ ...typedJob, endDate: "2023-07" }).success).toBe(true);
  });

  it("refuses a logo or website that isn't https", () => {
    expect(firstError({ ...typedJob, logoURL: "http://example.com/logo.png" }, "logoURL")).toBeDefined();
    expect(firstError({ ...typedJob, companyURL: "javascript:alert(1)" }, "companyURL")).toBeDefined();
  });
});
