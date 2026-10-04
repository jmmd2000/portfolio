import { describe, expect, it } from "vitest";
import { skillCategorySchema } from "./skillCategory";

describe("skillCategorySchema", () => {
  it("refuses a category with no skills, even when the box only has blank lines", () => {
    const result = skillCategorySchema.safeParse({ category: "Frontend", items: "\n  \n" });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Add at least one skill");
  });
});
