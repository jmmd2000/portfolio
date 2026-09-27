import { describe, expect, it } from "vitest";

describe("server test environment", () => {
  it("runs in node, not a browser", () => {
    expect(typeof window).toBe("undefined");
  });

  it("sets NODE_ENV to test", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
