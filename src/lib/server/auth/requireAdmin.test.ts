import { isHttpError } from "@sveltejs/kit";
import type { User } from "better-auth";
import { describe, expect, it } from "vitest";
import { requireAdmin } from "./requireAdmin";

const admin: User = { id: "1", name: "Admin", email: "james@test.com", emailVerified: true, image: null, createdAt: new Date(), updatedAt: new Date() };

describe("requireAdmin", () => {
  it("stops a signed-out request with a 401", () => {
    try {
      requireAdmin({ user: null });
      expect.unreachable("requireAdmin should have thrown");
    } catch (thrown) {
      expect(isHttpError(thrown, 401)).toBe(true);
    }
  });

  it("returns the signed-in admin", () => {
    expect(requireAdmin({ user: admin })).toBe(admin);
  });
});
