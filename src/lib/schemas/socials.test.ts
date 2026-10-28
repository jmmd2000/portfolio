import { describe, expect, it } from "vitest";
import { socialSchema } from "./socials";

function urlIsAccepted(url: string): boolean {
  return socialSchema.shape.url.safeParse(url).success;
}

describe("socialSchema", () => {
  it("accepts https links and email links", () => {
    expect(urlIsAccepted("https://github.com/jmmd2000")).toBe(true);
    expect(urlIsAccepted("mailto:hi@jamesmddoyle.com")).toBe(true);
  });

  it("refuses links that could run code or aren't secure", () => {
    expect(urlIsAccepted("javascript:alert(1)")).toBe(false);
    expect(urlIsAccepted("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(urlIsAccepted("http://example.com")).toBe(false);
  });

  it("refuses an email link with no address", () => {
    expect(urlIsAccepted("mailto:")).toBe(false);
    expect(urlIsAccepted("mailto:not-an-address")).toBe(false);
  });
});
