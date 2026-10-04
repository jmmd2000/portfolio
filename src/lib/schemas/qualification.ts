// Rules for a qualification on the CV.
import { z } from "zod";
import { optionalText } from "./optionalText";
import { requiredText } from "./requiredText";

const year = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Use a year")
  .transform(Number);

export const qualificationSchema = z
  .object({
    degree: requiredText("qualification", 120),
    institution: requiredText("institution", 120),
    location: optionalText("location", 80),
    grade: requiredText("grade", 80),
    startYear: year,
    endYear: year,
  })
  .refine(qualification => qualification.endYear >= qualification.startYear, { message: "End year can't be before start year", path: ["endYear"] });

export type QualificationInput = z.infer<typeof qualificationSchema>;
