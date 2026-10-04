// Rules for a project
import { z } from "zod";
import { httpsURL, optionalHTTPSURL } from "./httpsURL";
import { lineList } from "./lineList";
import { optionalText } from "./optionalText";
import { requiredText } from "./requiredText";

const checkbox = z
  .literal("on")
  .optional()
  .transform(value => value === "on");

const optionalYear = z
  .string()
  .trim()
  .refine(text => text === "" || /^\d{4}$/.test(text), "Use a year, or leave it empty")
  .transform(text => (text === "" ? null : Number(text)));

const title = requiredText("name", 60);
const description = requiredText("one-liner", 160);
const imageURL = httpsURL("screenshot");

/** The fields a new project needs. The rest are filled in on the projects own page */
export const newProjectSchema = z.object({ title, description, imageURL });

export const projectSchema = z
  .object({
    title,
    description,
    imageURL,
    liveURL: optionalHTTPSURL("live link"),
    liveLabel: optionalText("live link text", 30),
    sourceURL: optionalHTTPSURL("source link"),
    stack: lineList("stack item", 30),
    year: optionalYear,
    highlights: lineList("highlight", 400),
    featured: checkbox,
    showOnCV: checkbox,
    published: checkbox,
  })
  .refine(project => project.liveURL === null || project.liveLabel !== null, { message: "Add the text for the live link", path: ["liveLabel"] })
  .refine(project => project.liveLabel === null || project.liveURL !== null, { message: "Add the live link, or clear its text", path: ["liveURL"] });

export type NewProjectInput = z.infer<typeof newProjectSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
