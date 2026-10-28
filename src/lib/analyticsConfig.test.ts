import { describe, expect, it } from "vitest";
import { parseUmamiWebsiteID } from "./analyticsConfig";

describe("parseUmamiWebsiteID", () => {
  it("turns analytics off when the ID is missing or blank", () => {
    expect(parseUmamiWebsiteID({})).toBeUndefined();
    expect(parseUmamiWebsiteID({ PUBLIC_UMAMI_WEBSITE_ID: "" })).toBeUndefined();
  });

  it("refuses an ID that isn't a UUID, so a typo stops the app instead of silently counting nothing", () => {
    expect(() => parseUmamiWebsiteID({ PUBLIC_UMAMI_WEBSITE_ID: "my-site" })).toThrow("PUBLIC_UMAMI_WEBSITE_ID");
    expect(parseUmamiWebsiteID({ PUBLIC_UMAMI_WEBSITE_ID: "347baf58-55c7-4b85-a153-25a0fcd914eb" })).toBe("347baf58-55c7-4b85-a153-25a0fcd914eb");
  });
});
