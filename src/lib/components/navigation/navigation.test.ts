import { describe, expect, it } from "vitest";
import { isCurrentPage } from "./navigation";

describe("isCurrentPage", () => {
  it("matches a link on its own page and its sub-pages", () => {
    expect(isCurrentPage("/projects", "/projects")).toBe(true);
    expect(isCurrentPage("/projects", "/projects/issues")).toBe(true);
  });

  it("doesn't match a different page that starts with the same letters", () => {
    expect(isCurrentPage("/projects", "/projects-archive")).toBe(false);
  });
});
