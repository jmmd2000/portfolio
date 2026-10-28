import { z } from "zod";
import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const profile = { name: "James Doyle", role: "Software Engineer", intro: "Software engineer in Dublin.", location: "Dublin, Ireland" };

describe("profileSchema", () => {
  it("refuses a field that is only spaces", () => {
    const result = profileSchema.safeParse({ ...profile, role: "   " });
    if (result.success) expect.unreachable("a role of only spaces should fail");

    expect(Object.keys(z.flattenError(result.error).fieldErrors)).toEqual(["role"]);
  });
});
