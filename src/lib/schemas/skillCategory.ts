// Rules for a skill category on the CV.
import { z } from "zod";
import { lineList } from "./lineList";
import { requiredText } from "./requiredText";

export const skillCategorySchema = z.object({
  category: requiredText("category", 40),
  items: lineList("skill", 40).refine(items => items.length > 0, "Add at least one skill"),
});

export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
