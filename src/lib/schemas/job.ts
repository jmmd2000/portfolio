// Rules for a job on the CV. The CV admin's job actions check every save with them.
import { z } from "zod";
import { httpsURL, optionalHTTPSURL } from "./httpsURL";
import { lineList } from "./lineList";
import { optionalText } from "./optionalText";
import { requiredText } from "./requiredText";

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const monthMessage = "Use a year and month, like 2023-07";

// Typed as "2023-07" and stored as the first of that month, because the col is a date
const month = z
  .string()
  .trim()
  .regex(monthPattern, monthMessage)
  .transform(text => `${text}-01`);

const optionalMonth = z
  .string()
  .trim()
  .refine(text => text === "" || monthPattern.test(text), monthMessage)
  .transform(text => (text === "" ? null : `${text}-01`));

export const jobSchema = z
  .object({
    title: requiredText("job title", 80),
    company: requiredText("company", 80),
    companyURL: optionalHTTPSURL("company website"),
    location: optionalText("location", 80),
    logoURL: httpsURL("logo"),
    startDate: month,
    endDate: optionalMonth,
    bullets: lineList("bullet", 400),
    tags: lineList("tag", 30),
  })
  .refine(job => job.endDate === null || job.endDate >= job.startDate, { message: "End date can't be before start date", path: ["endDate"] });

export type JobInput = z.infer<typeof jobSchema>;
