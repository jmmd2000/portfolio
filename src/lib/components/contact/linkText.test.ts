import { describe, expect, it } from "vitest";
import { linkText } from "./linkText";

describe("linkText", () => {
  it("shows the address for an email link", () => {
    expect(linkText("mailto:hi@jamesmddoyle.com")).toBe("hi@jamesmddoyle.com");
  });

  it("drops https, www and the trailing slash from a web link", () => {
    expect(linkText("https://www.linkedin.com/in/jamesmddoyle/")).toBe("linkedin.com/in/jamesmddoyle");
  });

  it("shows just the host for a link to a site's home page", () => {
    expect(linkText("https://jamesmddoyle.com/")).toBe("jamesmddoyle.com");
  });
});
