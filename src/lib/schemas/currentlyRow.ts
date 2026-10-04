// Rules for a row in the Currently section
import { z } from "zod";
import { checkbox } from "./checkbox";
import { optionalHTTPSURL } from "./httpsURL";
import { optionalText } from "./optionalText";
import { requiredText } from "./requiredText";

export const currentlyRowSchema = z.object({
  label: requiredText("label", 30),
  title: requiredText("title", 80),
  subtitle: optionalText("subtitle", 80),
  url: optionalHTTPSURL("link"),
  imageURL: optionalHTTPSURL("cover"),
  shown: checkbox,
});

export type CurrentlyRowInput = z.infer<typeof currentlyRowSchema>;
