import { z } from "zod";
import { describe, expect, it } from "vitest";
import { profileChangesSchema } from "./profile";

describe("profileChangesSchema", () => {
  it("trims the spaces around a value", () => {
    const result = profileChangesSchema.parse({ name: "  James Doyle  " });
    expect(result).toEqual({ name: "James Doyle" });
  });

  it("refuses a field that is only spaces", () => {
    const result = profileChangesSchema.safeParse({ role: "   " });
    if (result.success) expect.unreachable("a role of only spaces should fail");

    expect(z.flattenError(result.error).fieldErrors).toEqual({ role: ["Add a role."] });
  });

  it("refuses an edit with nothing in it", () => {
    expect(profileChangesSchema.safeParse({}).success).toBe(false);
  });
});
