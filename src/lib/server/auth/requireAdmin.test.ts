import { isHttpError } from "@sveltejs/kit";
import { describe, expect, it } from "vitest";
import { requireAdmin } from "./requireAdmin";

describe("requireAdmin", () => {
  it("stops a signed-out request with a 401", () => {
    try {
      requireAdmin({ user: null });
      expect.unreachable("requireAdmin should have thrown");
    } catch (thrown) {
      expect(isHttpError(thrown, 401)).toBe(true);
    }
  });
});
