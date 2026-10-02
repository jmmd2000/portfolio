import { z } from "zod";
import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const profile = { name: "James Doyle", role: "Software Engineer", location: "Dublin, Ireland", bio: "Software Engineer." };

describe("profileSchema", () => {
  it("trims the spaces around a value", () => {
    const result = profileSchema.parse({ ...profile, name: "  James Doyle  " });
    expect(result.name).toBe("James Doyle");
  });

  it("refuses a field that is only spaces", () => {
    const result = profileSchema.safeParse({ ...profile, role: "   " });
    if (result.success) expect.unreachable("a role of only spaces should fail");

    expect(z.flattenError(result.error).fieldErrors).toEqual({ role: ["Add a role."] });
  });
});
